import Reveal from "../components/Reveal";
import VehicleBrowser from "../components/VehicleBrowser";
import { supabase } from "../lib/supabase";
import { cacheLife } from "next/cache";
import type { Vehicle } from "../lib/types";

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

      <VehicleBrowser vehicles={vehicles} />
    </main>
  );
}