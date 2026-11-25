import Reveal from "../components/Reveal";
import { supabase } from "../lib/supabase";
import { cacheLife } from "next/cache";

type Vehicle = {
  id: number;
  name: string;
  type: string;
  year: number;
  country: string;
  story: string | null;
  image_url: string | null;
  image_credit: string | null;
};

export default async function Home() {
  "use cache";
  cacheLife("minutes");

  const { data, error } = await supabase.from("vehicles").select("*").order("year");
  if (error) console.error("Supabase error:", error.message);
  const vehicles = (data ?? []) as Vehicle[];

  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <p className="mb-4 text-sm tracking-[0.3em] text-cyan-300">
            EVERY MACHINE. EVERY ERA.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-[clamp(2.5rem,9vw,8rem)] font-bold leading-none">
            Cars & Bikes World
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-[clamp(1rem,2vw,1.25rem)] text-white/60">
            A fluid journey through every car and bike ever made.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {vehicles.map((v, i) => (
            <Reveal key={v.id} delay={(i % 3) * 0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform duration-500 hover:-translate-y-2 hover:border-cyan-300/50">
                {v.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="mb-6 h-40 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="mb-6 h-40 rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30" />
                )}
                <p className="text-sm text-cyan-300">
                  {v.type} · {v.year}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{v.name}</h3>
                <p className="text-white/50">{v.country}</p>
                {v.story && (
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{v.story}</p>
                )}
                {v.image_credit && (
                  <p className="mt-3 text-xs text-white/30">{v.image_credit}</p>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}