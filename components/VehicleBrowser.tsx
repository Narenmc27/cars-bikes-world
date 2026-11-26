"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Vehicle } from "../lib/types";
import { slugify } from "../lib/slug";
import CompareModal from "./CompareModal";

const TYPES = ["All", "Car", "Bike"] as const;
const FAV_KEY = "cbw-favorites";

const splitCountries = (country: string | null) =>
  (country ?? "")
    .split("/")
    .map((c) => c.trim())
    .filter(Boolean);

// Saves a list of ids in the browser, so favorites stay after refresh
function useStoredIds(key: string) {
  const [ids, setIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setIds(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch {}
  }, [ids, key, loaded]);

  return [ids, setIds] as const;
}

export default function VehicleBrowser({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("All");
  const [country, setCountry] = useState("All");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [favorites, setFavorites] = useStoredIds(FAV_KEY);
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleFav = (id: number) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // keeps the latest 2 picked vehicles
  const toggleCompare = (id: number) =>
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-2)
    );

  const countries = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => splitCountries(v.country).forEach((c) => set.add(c)));
    return ["All", ...Array.from(set).sort()];
  }, [vehicles]);

  const favCount = useMemo(
    () => vehicles.filter((v) => favorites.includes(v.id)).length,
    [vehicles, favorites]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (onlyFavs && !favorites.includes(v.id)) return false;
      if (type !== "All" && v.type !== type) return false;
      if (country !== "All" && !splitCountries(v.country).includes(country))
        return false;
      if (q && !`${v.name} ${v.country ?? ""} ${v.year}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [vehicles, query, type, country, onlyFavs, favorites]);

  const picked = compareIds
    .map((id) => vehicles.find((v) => v.id === id))
    .filter((v): v is Vehicle => Boolean(v));

  const tabClass = (active: boolean) =>
    `border-2 border-ink px-4 py-1.5 text-sm font-bold transition-colors ${
      active ? "bg-enamel text-bone" : "bg-bone text-ink hover:bg-mustard/50"
    }`;

  return (
    <section className="mx-auto max-w-6xl px-6 pb-40">
      {/* Tool tray: search and filters */}
      <div className="sticky top-4 z-40 mb-10 flex flex-col gap-4 border-2 border-ink bg-bone p-4 text-ink shadow-[6px_6px_0_#0b1a16] md:flex-row md:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, country or year"
          className="w-full flex-1 border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none placeholder:text-ink/50 focus:border-enamel"
        />

        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={tabClass(type === t)}
            >
              {t === "All" ? "All" : `${t}s`}
            </button>
          ))}
          <button
            onClick={() => setOnlyFavs((v) => !v)}
            className={tabClass(onlyFavs)}
          >
            ♥ Favorites ({favCount})
          </button>
        </div>

        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border-2 border-ink bg-bone px-3 py-2 font-bold text-ink outline-none"
        >
          {countries.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All countries" : c}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-8 text-bone/80">
        Showing {filtered.length} of {vehicles.length} vehicles
      </p>

      <motion.div
        layout
        className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-x-8 gap-y-10"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((v) => {
            const isFav = favorites.includes(v.id);
            const isCmp = compareIds.includes(v.id);
            // each card sits a little crooked, like pinned paper
            const tilt = (((v.id * 37) % 7) - 3) * 0.5;

            return (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, scale: 0.92, rotate: tilt }}
                animate={{ opacity: 1, scale: 1, rotate: tilt }}
                exit={{ opacity: 0, scale: 0.92 }}
                whileHover={{ rotate: 0, y: -6 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                className={`relative border-2 border-ink bg-bone p-3 pb-5 text-ink shadow-[6px_6px_0_#0b1a16] ${
                  isCmp ? "ring-4 ring-mustard" : ""
                }`}
              >
                {/* piece of tape */}
                <span className="absolute -top-3 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-2 bg-mustard/80" />

                <div className="absolute right-6 top-6 z-10 flex gap-2">
                  <button
                    onClick={() => toggleFav(v.id)}
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    title="Favorite"
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink ${
                      isFav ? "bg-enamel text-bone" : "bg-bone text-ink"
                    }`}
                  >
                    {isFav ? "♥" : "♡"}
                  </button>
                  <button
                    onClick={() => toggleCompare(v.id)}
                    aria-label="Compare"
                    title="Compare"
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink ${
                      isCmp ? "bg-mustard text-ink" : "bg-bone text-ink"
                    }`}
                  >
                    ⇄
                  </button>
                </div>

                <Link
                  href={`/vehicles/${slugify(v.name)}`}
                  className="block cursor-pointer focus-visible:outline-4 focus-visible:outline-mustard"
                >
                  {/* photo print */}
                  {v.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.image_url}
                      alt={v.name}
                      loading="lazy"
                      className="h-44 w-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center border-4 border-white bg-chrome/50 text-ink/60">
                      No photo yet
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    <span className="border-2 border-ink bg-mustard px-2 py-0.5 font-display text-lg leading-none">
                      {v.year}
                    </span>
                    <span className="font-bold">{v.type}</span>
                  </div>

                  <h3 className="mt-3 font-display text-2xl leading-tight">
                    {v.name}
                  </h3>
                  <p className="text-sm text-ink/70">{v.country}</p>

                  {v.story && (
                    <p className="mt-3 leading-relaxed">{v.story}</p>
                  )}

                  {v.image_credit && (
                    <p className="mt-4 border-t border-dashed border-ink/30 pt-2 text-[0.7rem] leading-snug text-ink/50">
                      {v.image_credit}
                    </p>
                  )}

                  <p className="mt-3 font-bold text-enamel underline underline-offset-4">
                    Read the full card
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-bone/80">
          {onlyFavs && favCount === 0
            ? "No favorites yet. Tap the heart on any card."
            : "Nothing matches your search. Try fewer words."}
        </p>
      )}

      {/* Compare bar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <AnimatePresence>
          {picked.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center gap-3 border-2 border-ink bg-bone p-3 text-ink shadow-[6px_6px_0_#0b1a16]"
            >
              <div className="flex flex-1 flex-wrap gap-2">
                {picked.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleCompare(v.id)}
                    className="border-2 border-ink px-2 py-0.5 text-sm hover:bg-mustard/50"
                  >
                    {v.name} ✕
                  </button>
                ))}
              </div>
              {picked.length === 2 ? (
                <button
                  onClick={() => setShowCompare(true)}
                  className="border-2 border-ink bg-enamel px-4 py-2 font-bold text-bone"
                >
                  Compare now
                </button>
              ) : (
                <span className="text-sm text-ink/60">Pick one more</span>
              )}
              <button
                onClick={() => setCompareIds([])}
                className="text-sm text-ink/60 underline hover:text-ink"
              >
                Clear
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCompare && picked.length === 2 && (
          <CompareModal
            a={picked[0]}
            b={picked[1]}
            onClose={() => setShowCompare(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}