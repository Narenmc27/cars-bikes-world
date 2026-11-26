const res = await fetch("https://api.groq.com/openai/v1/models", {
  headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
});
const json = await res.json();

if (!res.ok) {
  console.error("ERROR:", json.error?.message || res.status);
  process.exit(1);
}

console.log("Models your key can use:\n");
for (const m of json.data.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(m.id);
}