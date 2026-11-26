import HangingSign from "../components/HangingSign";
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
      <div className="h-3 w-full bg-chrome" />

      <section className="px-6 pb-20">
        <HangingSign />
        <p className="mx-auto mt-10 max-w-md text-center text-lg leading-relaxed text-bone/90">
          {vehicles.length} cars and bikes, filed by year. Search the shelves
          below, or ask the garage.
        </p>
      </section>

      <div className="checker" />

      <div className="pt-12">
        <VehicleBrowser vehicles={vehicles} />
      </div>
    </main>
  );
}