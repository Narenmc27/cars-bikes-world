"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Vehicle } from "../lib/types";
import { slugify } from "../lib/slug";

const TYPES = ["All", "Car", "Bike"] as const;

const splitCountries = (country: string | null) =>
  (country ?? "")
    .split("/")
    .map((c) => c.trim())
    .filter(Boolean);

export default function VehicleBrowser({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [country, setCountry] = useState("All");

  const countries = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => splitCountries(v.country).forEach((c) => set.add(c)));
    return ["All", ...Array.from(set).sort()];
  }, [vehicles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (type !== "All" && v.type !== type) return false;
      if (country !== "All" && !splitCountries(v.country).includes(country))
        return false;
      if (q && !`${v.name} ${v.country ?? ""} ${v.year}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [vehicles, query, type, country]);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-32">
      <div className="sticky top-4 z-40 mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl md:flex-row md:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, country or year..."
          className="w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-cyan-300/60"
        />

        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                type === t
                  ? "bg-cyan-400 text-black"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {t === "All" ? "All" : `${t}s`}
            </button>
          ))}
        </div>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#0b0d14] px-4 py-3 text-white outline-none"
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All countries" : c}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-6 text-sm text-white/50">
        Showing {filtered.length} of {vehicles.length} vehicles
      </p>

      <motion.div
        layout
        className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((v) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-cyan-300/50"
            >
              <Link
                href={`/vehicles/${slugify(v.name)}`}
                className="block cursor-pointer p-6"
              >
                {v.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.image_url}
                    alt={v.name}
                    loading="lazy"
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
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {v.story}
                  </p>
                )}
                {v.image_credit && (
                  <p className="mt-3 text-xs text-white/30">{v.image_credit}</p>
                )}
                <p className="mt-4 text-sm text-cyan-300">View details →</p>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-white/50">
          No vehicles found. Try another search.
        </p>
      )}
    </section>
  );
}