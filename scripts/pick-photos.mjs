import http from "node:http";
import { createClient } from "@supabase/supabase-js";

const PORT = 4000;
const BUCKET = "vehicle-images";
// Same email you used in add-photos.mjs
const HEADERS = {
  "User-Agent": "CarsBikesWorld/1.0 (personal project; YOUR-EMAIL@example.com)",
};
const OK_LICENSE = /^(CC BY(-SA)?[ -]\d|CC0|Public domain|PD)/i;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("Missing keys. Run with: node --env-file=.env.local scripts/pick-photos.mjs");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const args = process.argv.slice(2);
const showAll = args.includes("--all");
const nameIdx = args.indexOf("--name");
const onlyName = nameIdx >= 0 ? args[nameIdx + 1] : null;

const clean = (s = "") => s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function loadVehicles() {
  let q = supabase.from("vehicles").select("id, name, image_url").order("year");
  if (onlyName) q = q.eq("name", onlyName);
  else if (!showAll) q = q.is("image_url", null);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

async function searchCandidates(query, vehicleName) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query} -interior -engine -dashboard -badge -emblem -detail`,
    gsrnamespace: "6",
    gsrlimit: "30",
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: "960",
  });

  const res = await fetch(url, { headers: HEADERS });
  const json = await res.json();
  const pages = Object.values(json.query?.pages ?? {});
  const wanted = norm(vehicleName);
  const out = [];

  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (!info || info.mime !== "image/jpeg") continue;
    if (info.width < info.height || info.width < 800) continue;
    const meta = info.extmetadata ?? {};
    const license = meta.LicenseShortName?.value ?? "";
    if (!OK_LICENSE.test(license)) continue;

    const download = info.thumburl || info.url;
    const preview = download.includes("/960px-")
      ? download.replace("/960px-", "/330px-")
      : download;
    const artist = clean(meta.Artist?.value) || "Unknown author";

    out.push({
      index: p.index ?? 999,
      exact: norm(p.title).includes(wanted) ? 1 : 0,
      preview,
      download,
      pageUrl: info.descriptionurl,
      license,
      credit: `Photo: ${artist}, ${license}, Wikimedia Commons`,
    });
  }

  out.sort((a, b) => b.exact - a.exact || a.index - b.index);
  return out.slice(0, 5);
}

async function choose({ id, name, download, credit }) {
  const u = new URL(download);
  const host = u.hostname;
  if (
    u.protocol !== "https:" ||
    !(host === "wikimedia.org" || host.endsWith(".wikimedia.org"))
  ) {
    throw new Error("Only Wikimedia images are allowed (got: " + host + ")");
  }
  const file = await fetch(download, { headers: HEADERS });
  if (!file.ok) throw new Error(`Download failed (${file.status})`);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: old } = await supabase
    .from("vehicles")
    .select("image_url")
    .eq("id", id)
    .single();

  const path = `${slug(name)}-${Date.now()}.jpg`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: "image/jpeg" });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const { error: dbErr } = await supabase
    .from("vehicles")
    .update({ image_url: pub.publicUrl, image_credit: credit })
    .eq("id", id);
  if (dbErr) throw dbErr;

  // remove the old file so the bucket stays clean
  const marker = `/${BUCKET}/`;
  if (old?.image_url?.includes(marker)) {
    const oldPath = decodeURIComponent(old.image_url.split(marker)[1]);
    await supabase.storage.from(BUCKET).remove([oldPath]);
  }
}

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>Photo Picker</title>
<style>
body{background:#05060a;color:#fff;font-family:system-ui,sans-serif;max-width:1200px;margin:auto;padding:24px}
.v{border:1px solid #ffffff22;border-radius:16px;padding:16px;margin:16px 0;background:#ffffff08}
.v.done{border-color:#22c55e}
.row{display:flex;gap:12px;flex-wrap:wrap;margin-top:12px}
.c{width:200px;cursor:pointer;border:2px solid transparent;border-radius:10px;overflow:hidden;background:#0b0d14}
.c:hover{border-color:#22d3ee}
.c img{width:100%;height:130px;object-fit:cover;display:block}
.c small{display:block;padding:6px;font-size:11px;color:#ffffff99}
.c a{color:#67e8f9}
input{background:#0b0d14;border:1px solid #ffffff33;color:#fff;padding:8px;border-radius:8px;width:260px}
button{background:#22d3ee;border:0;border-radius:8px;padding:8px 12px;cursor:pointer}
.muted{color:#ffffff88;font-size:13px}
.cur{height:50px;border-radius:6px;vertical-align:middle;margin-left:8px}
</style></head><body>
<h1>📸 Photo Picker</h1>
<p class="muted">Click the best photo for each vehicle. It is saved right away. Click "details" to check the picture and license.</p>
<div id="list">Loading...</div>
<script>
var list = document.getElementById("list");
function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

async function api(path, opts) {
  var r = await fetch(path, opts);
  var j = await r.json();
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}

function renderCandidates(v, cands) {
  v.box.innerHTML = "";
  if (!cands.length) { v.box.textContent = "No free photo found. Try another search above."; return; }
  cands.forEach(function (c) {
    var card = document.createElement("div"); card.className = "c";
    var img = document.createElement("img"); img.src = c.preview;
    img.onerror = function () { img.onerror = null; img.src = c.download; };
    var small = document.createElement("small");
    small.textContent = c.license + " · ";
    var a = document.createElement("a");
    a.href = c.pageUrl; a.target = "_blank"; a.textContent = "details";
    a.onclick = function (e) { e.stopPropagation(); };
    small.appendChild(a);
    card.appendChild(img); card.appendChild(small);
    card.onclick = function () { choose(v, c, card); };
    v.box.appendChild(card);
  });
}

async function choose(v, c, card) {
  card.style.opacity = "0.5";
  try {
    await api("/api/choose", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Picker": "1" },
      body: JSON.stringify({ id: v.id, name: v.name, download: c.download, credit: c.credit })
    });
    v.wrap.className = "v done";
    v.status.textContent = " ✅ Saved";
  } catch (e) {
    card.style.opacity = "1";
    alert("Error: " + e.message);
  }
}

async function search(v, query) {
  v.box.textContent = "Searching...";
  try {
    var cands = await api("/api/candidates?name=" + encodeURIComponent(v.name) + "&q=" + encodeURIComponent(query));
    renderCandidates(v, cands);
  } catch (e) { v.box.textContent = "Error: " + e.message; }
}

async function main() {
  var vehicles = await api("/api/vehicles");
  list.innerHTML = "";
  if (!vehicles.length) {
    list.textContent = "Nothing to do. Every vehicle has a photo 🎉 (use --all or --name to review)";
    return;
  }
  vehicles.forEach(function (v) {
    v.wrap = document.createElement("div"); v.wrap.className = "v";
    var h = document.createElement("h3"); h.textContent = v.name;
    v.status = document.createElement("span"); h.appendChild(v.status);
    if (v.image_url) {
      var cur = document.createElement("img"); cur.src = v.image_url; cur.className = "cur";
      h.appendChild(cur);
    }
    var input = document.createElement("input"); input.value = v.name;
    var btn = document.createElement("button"); btn.textContent = "Search";
    btn.onclick = function () { search(v, input.value); };
    v.box = document.createElement("div"); v.box.className = "row";
    v.wrap.appendChild(h); v.wrap.appendChild(input); v.wrap.appendChild(btn); v.wrap.appendChild(v.box);
    list.appendChild(v.wrap);
    v.input = input;
  });
  for (var i = 0; i < vehicles.length; i++) {
    await search(vehicles[i], vehicles[i].name);
    await sleep(1200);
  }
}
main().catch(function (e) { list.textContent = "Error: " + e.message; });
</script></body></html>`;

function send(res, code, type, body) {
  res.writeHead(code, { "Content-Type": type });
  res.end(body);
}
const sendJson = (res, code, obj) => send(res, code, "application/json", JSON.stringify(obj));

function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => resolve(d));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, 200, "text/html; charset=utf-8", PAGE);
    }
    if (req.method === "GET" && url.pathname === "/api/vehicles") {
      return sendJson(res, 200, await loadVehicles());
    }
    if (req.method === "GET" && url.pathname === "/api/candidates") {
      const name = url.searchParams.get("name") ?? "";
      const q = url.searchParams.get("q") || name;
      return sendJson(res, 200, await searchCandidates(q, name));
    }
    if (req.method === "POST" && url.pathname === "/api/choose") {
      if (req.headers["x-picker"] !== "1") return sendJson(res, 403, { error: "Forbidden" });
      await choose(JSON.parse(await readBody(req)));
      return sendJson(res, 200, { ok: true });
    }
    sendJson(res, 404, { error: "Not found" });
  } catch (e) {
    console.error(e);
    sendJson(res, 500, { error: e.message || String(e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n📸 Photo Picker is running. Open: http://localhost:${PORT}`);
  console.log("Press Ctrl + C to stop.\n");
});