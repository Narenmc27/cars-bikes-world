import { cacheLife } from "next/cache";
import { supabase } from "./supabase";
import { slugify } from "./slug";
import type { Vehicle } from "./types";

export async function getVehicles(): Promise<Vehicle[]> {
  "use cache";
  cacheLife("minutes");

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .order("year");
  if (error) console.error("Supabase error:", error.message);
  return (data ?? []) as Vehicle[];
}

export async function getVehicleBySlug(slug: string) {
  const all = await getVehicles();
  return all.find((v) => slugify(v.name) === slug) ?? null;
}