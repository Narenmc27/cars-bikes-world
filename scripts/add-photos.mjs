import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "vehicle-images";
// Wikimedia asks for a real contact in User-Agent. Put your email.
const HEADERS = {
  "User-Agent": "CarsBikesWorld/1.0 (personal project; narendrakumar27072004@gmail.com)",
};
// Allowed licenses only (no NC / ND)
const OK_LICENSE = /^(CC BY(-SA)?[ -]\d|CC0|Public domain|PD)/i;

const clean = (s = "") =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findImage(name) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrsearch: `filetype:bitmap ${name}`,
    gsrnamespace: "6",
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
    iiurlwidth: "1200",
  });

  const res = await fetch(url, { headers: HEADERS });
  const json = await res.json();
  const pages = Object.values(json.query?.pages ?? {}).sort(
    (a, b) => a.index - b.index
  );
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const wanted = norm(name); // "fordmodelt"

  for (const p of pages) {
    const info = p.imageinfo?.[0];
    if (!info || info.mime !== "image/jpeg") continue;
    if (info.width < info.height) continue; // landscape photos only
    if (!norm(p.title).includes(wanted)) continue;

    const meta = info.extmetadata ?? {};
    const license = meta.LicenseShortName?.value ?? "";
    if (!OK_LICENSE.test(license)) continue;

    const artist = clean(meta.Artist?.value) || "Unknown author";
    return {
      downloadUrl: info.thumburl || info.url,
      pageUrl: info.descriptionurl,
      credit: `Photo: ${artist}, ${license}, Wikimedia Commons`,
    };
  }
  return null;
}

async function main() {
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, name")
    .is("image_url", null);

  if (error) throw error;
  console.log(`Found ${vehicles.length} vehicles without photos\n`);

  for (const v of vehicles) {
    try {
      const img = await findImage(v.name);
      if (!img) {
        console.log(`❌ ${v.name}: no good free photo found (add manually)`);
        continue;
      }

      const file = await fetch(img.downloadUrl, { headers: HEADERS });
      const buffer = Buffer.from(await file.arrayBuffer());
      const path = `${slug(v.name)}.jpg`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

      const { error: dbErr } = await supabase
        .from("vehicles")
        .update({ image_url: pub.publicUrl, image_credit: img.credit })
        .eq("id", v.id);
      if (dbErr) throw dbErr;

      console.log(`✅ ${v.name}\n   check: ${img.pageUrl}`);
    } catch (e) {
      console.log(`⚠️ ${v.name}: ${e.message}`);
    }
    await sleep(1500); // be polite to Wikimedia
  }
  console.log("\nDone! Refresh your site.");
}

main().catch((e) => {
  console.error("\nERROR:", e.message || e);
  if (e.code) console.error("Code:", e.code);
  if (e.details) console.error("Details:", e.details);
  if (e.hint) console.error("Hint:", e.hint);
  process.exit(1);
});