import { createClient } from "@supabase/supabase-js";

const KEY = process.env.GROQ_API_KEY;
// If you get "model not found", open console.groq.com/docs/vision,
// copy a model name from there, and add it to .env.local as GROQ_VISION_MODEL=...
const MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b";

if (
  !KEY ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.error(
    "Missing keys. Check .env.local and run with: node --env-file=.env.local scripts/check-photos.mjs"
  );
  process.exit(1);
}

// Read-only, so the public (anon) key is enough
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const args = process.argv.slice(2);
const namesIdx = args.indexOf("--names");
const onlyNames =
  namesIdx >= 0
    ? args[namesIdx + 1].split(",").map((s) => s.trim()).filter(Boolean)
    : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callGroq(body, tries = 6) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KEY}`,
      },
      body: JSON.stringify(body),
    });

    // Free tier has speed limits. Wait and try again.
    if (res.status === 429 && i < tries - 1) {
      const wait = Number(res.headers.get("retry-after")) || 10;
      console.log(`   (speed limit reached, waiting ${wait}s...)`);
      await sleep(wait * 1000);
      continue;
    }

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || `API error ${res.status}`);
    return json;
  }
}

async function askModel(v) {
  const prompt = `You are checking photos for a car and bike encyclopedia.

Vehicle name: ${v.name}
First made: ${v.year}
Country: ${v.country ?? "unknown"}

Look at the photo and decide if it shows this exact vehicle model, in the form it had in its first era.

Reply with ONLY a JSON object, no other text:
{"verdict": "match" or "maybe" or "wrong", "shows": "what the photo really shows, under 12 words", "reason": "one short sentence"}

Rules:
- "match": clearly this model, and the whole vehicle is visible.
- "maybe": could be right, but it may be a modern version, a replica, only part of the vehicle, or you are not sure.
- "wrong": a different model, a different type of vehicle, or not a vehicle.
Be honest. If you are not sure, answer "maybe".`;

  const json = await callGroq({
    model: MODEL,
    max_completion_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: v.image_url } },
        ],
      },
    ],
  });

  let text = json.choices?.[0]?.message?.content ?? "";
  text = text.replace(/<think>[\s\S]*?<\/think>/g, ""); // remove "thinking" text if any
  const blocks = text.match(/\{[^{}]*\}/g);
  if (!blocks) throw new Error("Could not read the answer");
  return JSON.parse(blocks[blocks.length - 1]);
}

async function main() {
  let q = supabase
    .from("vehicles")
    .select("id, name, year, country, image_url")
    .not("image_url", "is", null)
    .order("year");
  if (onlyNames) q = q.in("name", onlyNames);

  const { data, error } = await q;
  if (error) throw error;

  console.log(`Checking ${data.length} photos with ${MODEL}...\n`);

  const icons = { match: "✅", maybe: "⚠️", wrong: "❌" };
  const counts = { match: 0, maybe: 0, wrong: 0, error: 0 };
  const toFix = [];

  for (const v of data) {
    try {
      const r = await askModel(v);
      const verdict = ["match", "maybe", "wrong"].includes(r.verdict)
        ? r.verdict
        : "maybe";
      counts[verdict]++;
      console.log(`${icons[verdict]} ${v.name} (${v.year})`);
      if (verdict !== "match") {
        console.log(`   shows: ${r.shows}`);
        console.log(`   why:   ${r.reason}`);
        toFix.push(v.name);
      }
    } catch (e) {
      counts.error++;
      console.log(`🔧 ${v.name}: ${e.message}`);
    }
    await sleep(6000); // slow and safe for the free tier
  }

  console.log(
    `\nDone. ✅ ${counts.match}   ⚠️ ${counts.maybe}   ❌ ${counts.wrong}   🔧 ${counts.error}`
  );

  if (toFix.length) {
    console.log("\nFix them with the picker:\n");
    console.log(
      `node --env-file=.env.local scripts/pick-photos.mjs --names "${toFix.join(",")}"`
    );
  }
}

main().catch((e) => {
  console.error("\nERROR:", e.message || e);
  process.exit(1);
});