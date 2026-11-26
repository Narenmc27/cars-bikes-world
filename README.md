# Cars & Bikes World 🚗🏍️

A fluid, animated encyclopedia of famous cars and bikes, with a searchable database, real photos with license credits, and an AI chat ("Ask the Garage") that answers questions using only the data on the site.

**Live site:** https://cars-bikes-world.vercel.app

<!-- Add 2 or 3 screenshots in a /docs folder, then link them here:
![Home page](docs/home.png)
![Compare view](docs/compare.png)
![Ask the Garage](docs/chat.png)
-->

I have loved beautiful websites since I was a child. This project is my attempt to build one: smooth, fluid and fast, about something I enjoy. It also became a way to practice building a complete product, from the database to the AI features to deployment.

---

## Features

| Feature | What it does |
|---|---|
| **Fluid design** | Smooth scrolling (Lenis), liquid background, a gooey mouse cursor, and animated cards that move when you filter |
| **52 vehicles** | 27 cars and 25 bikes, from the 1886 Benz Patent-Motorwagen to modern models, with many Indian favourites |
| **Search and filters** | Search by name, country or year. Filter by Car / Bike and by country |
| **Favorites** | Tap ♥ to save vehicles. Saved in the browser (localStorage), no login needed |
| **Compare** | Pick two vehicles (⇄) and see them side by side |
| **Detail pages** | Every vehicle has its own link, like `/vehicles/ferrari-f40`, with a big photo, facts and similar vehicles |
| **Share previews** | Each page has Open Graph tags, so links look good on WhatsApp and LinkedIn. Vehicle pages use the vehicle's own photo |
| **Ask the Garage** | A chat that answers questions like "Oldest bike from Italy?" using only the database |
| **Photo tools** | Scripts that find free photos, let me pick the best one, and use an AI vision model to flag wrong photos |

---

## Tech stack

- **Frontend:** Next.js 16 (App Router, Cache Components), React, TypeScript, Tailwind CSS, Framer Motion, Lenis
- **Database and storage:** Supabase (Postgres with Row Level Security, public Storage bucket for photos)
- **AI:** Groq API (a text model for the chat, a vision model for photo checking)
- **Photos:** Wikimedia Commons API
- **Hosting:** Vercel

---

## How "Ask the Garage" works

The AI never writes database queries, and it never answers from its own memory.

```
Visitor question
      │
      ▼
 Checks in code: length limit, per-visitor limit, daily cap (Postgres function)
      │
      ▼
 AI call 1: turns the question into a small JSON filter
      │   {type, country, year_min, year_max, name_contains, sort, limit, off_topic}
      ▼
 Code validates and cleans every field, then runs a normal Supabase query
      │
      ▼
 AI call 2: writes a short answer using ONLY the rows that were found
      │
      ▼
 Answer + links to the vehicles that the answer mentions
```

**Guardrails**

- Questions are limited to 200 characters.
- Off-topic questions get a polite refusal.
- The filter from the AI is checked field by field (allowed values only, cleaned text, limited number of rows).
- The answer prompt forbids guessing. If the database does not have the information (for example top speed or price), the chat says so.
- A daily cap (100 chats per day) is counted in Postgres with a `security definer` function. If the check fails, the chat does not run.
- A per-visitor limit (5 questions per minute) slows down spam. It is best-effort only, because memory is not shared between serverless instances. The daily cap is the strong protection.
- The API key is only used on the server and is never sent to the browser.

---

## Photo pipeline

Photos come from Wikimedia Commons, and only from these licenses: CC BY, CC BY-SA, CC0 and Public domain. The author and license are saved with every photo and shown on the site.

```
add-photos.mjs   → finds a photo for every vehicle without one
pick-photos.mjs  → local page where I choose the best of 5 photos
check-photos.mjs → AI vision model labels each photo: match / maybe / wrong
                   and prints a ready command to fix the bad ones
```

The AI check is only a first filter. A person makes the final decision.

---

## Project structure

```
app/
  api/chat/route.ts        Ask the Garage server code
  vehicles/[slug]/page.tsx Detail page
  layout.tsx               Global layout, metadata, smooth scroll, chat
  page.tsx                 Home page
  opengraph-image.tsx      Share image
  icon.tsx                 Tab icon
  template.tsx             Page transition
components/
  VehicleBrowser.tsx       Search, filters, favorites, compare bar
  CompareModal.tsx         Side-by-side comparison
  GarageChat.tsx           Chat window
  LiquidBackground.tsx     Moving background
  LiquidCursor.tsx         Gooey cursor
  SmoothScroll.tsx         Lenis smooth scroll
  Reveal.tsx               Scroll-in animation
lib/
  supabase.ts, vehicles.ts, slug.ts, types.ts
scripts/
  add-photos.mjs, pick-photos.mjs, check-photos.mjs, list-groq-models.mjs
```

---

## Run it on your computer

**1. Clone and install**

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/cars-bikes-world.git
cd cars-bikes-world
npm install
```

**2. Create a Supabase project** and run this in the SQL Editor:

```sql
create table vehicles (
  id bigint generated always as identity primary key,
  name text not null unique,
  type text not null check (type in ('Car', 'Bike')),
  year int,
  country text,
  story text,
  image_url text,
  image_credit text
);

alter table vehicles enable row level security;
create policy "Anyone can read vehicles" on vehicles for select using (true);

grant usage on schema public to anon;
grant select on public.vehicles to anon;

-- Daily cap for the chat
create table if not exists chat_usage (
  day date primary key,
  count int not null default 0
);
alter table chat_usage enable row level security;

create or replace function bump_chat_usage()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare new_count int;
begin
  insert into chat_usage (day, count) values (current_date, 1)
  on conflict (day) do update set count = chat_usage.count + 1
  returning chat_usage.count into new_count;
  return new_count <= 100;
end;
$$;

revoke all on function bump_chat_usage() from public;
grant execute on function bump_chat_usage() to anon;
```

Add your own vehicles, for example:

```sql
insert into vehicles (name, type, year, country, story) values
('Ford Model T', 'Car', 1908, 'USA', 'The affordable car that made car ownership possible for ordinary families.');
```

Then create a **public** Storage bucket named `vehicle-images`.

**3. Create `.env.local`**

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key
GROQ_API_KEY=your_groq_key

# Optional
GROQ_CHAT_MODEL=openai/gpt-oss-20b

# Only for the photo scripts on your own computer. Never put these on Vercel.
SUPABASE_SERVICE_ROLE_KEY=your_secret_key
GROQ_VISION_MODEL=a_vision_model_from_the_groq_docs
```

**4. Start the site**

```bash
npm run dev
```

Open http://localhost:3000.

**5. Photo scripts (optional)**

Open each script and put your own email in the `User-Agent` line, because Wikimedia asks for a contact.

```bash
node --env-file=.env.local scripts/add-photos.mjs
node --env-file=.env.local scripts/pick-photos.mjs --names "Vespa 98,Ford Mustang"
node --env-file=.env.local scripts/check-photos.mjs --names "Vespa 98"
```

Groq model names change often. Run `scripts/list-groq-models.mjs` to see which models your key can use.

---

## Deploy

1. Push the code to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `GROQ_API_KEY` (mark the Groq key as sensitive).
4. Do **not** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel.

---

## Known limitations

- The vehicle stories and years were written quickly and should be checked against reliable sources before the data is treated as fact.
- Some photos may show a modern version of a vehicle or only a part of it. I am improving them with the photo tools.
- AI answers can be wrong or incomplete, even with the guardrails. Each vehicle page is the reference.
- Favorites are saved in one browser on one device. Syncing across devices would need user login (for example Supabase Auth).
- The chat runs on a free tier with rate limits, so it can say "resting" when the limit is reached.

## Roadmap

- Finish the photo clean-up and re-run the AI check
- Grow the database to 150+ vehicles
- User accounts for synced favorites
- Own domain name

---

## Credits and licenses

- **Code:** MIT (add a `LICENSE` file to the repository).
- **Photos:** every photo keeps its own license (CC BY, CC BY-SA, CC0 or Public domain). The author and license are shown on each card and detail page. Photos come from [Wikimedia Commons](https://commons.wikimedia.org).

Built by **Narendrakumar P** — AI/ML Engineer, Chennai, India.
