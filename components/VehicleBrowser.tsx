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

  return (
    <section className="mx-auto max-w-6xl px-6 pb-40">
      <div className="sticky top-4 z-40 mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl md:flex-row md:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, country or year..."
          className="w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-cyan-300/60"
        />

        <div className="flex flex-wrap gap-2">
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
          <button
            onClick={() => setOnlyFavs((v) => !v)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              onlyFavs
                ? "bg-pink-500 text-white"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            ♥ Favorites ({favCount})
          </button>
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
          {filtered.map((v) => {
            const isFav = favorites.includes(v.id);
            const isCmp = compareIds.includes(v.id);
            return (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className={`relative rounded-2xl border bg-white/5 backdrop-blur hover:border-cyan-300/50 ${
                  isCmp ? "border-cyan-300" : "border-white/10"
                }`}
              >
                <div className="absolute right-9 top-9 z-10 flex gap-2">
                  <button
                    onClick={() => toggleFav(v.id)}
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    title="Favorite"
                    className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${
                      isFav
                        ? "bg-pink-500 text-white"
                        : "bg-black/50 text-white/80 hover:bg-black/70"
                    }`}
                  >
                    {isFav ? "♥" : "♡"}
                  </button>
                  <button
                    onClick={() => toggleCompare(v.id)}
                    aria-label="Compare"
                    title="Compare"
                    className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition ${
                      isCmp
                        ? "bg-cyan-400 text-black"
                        : "bg-black/50 text-white/80 hover:bg-black/70"
                    }`}
                  >
                    ⇄
                  </button>
                </div>

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
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-white/50">
          {onlyFavs && favCount === 0
            ? "No favorites yet. Tap the ♡ on any card."
            : "No vehicles found. Try another search."}
        </p>
      )}

      {/* Compare bar at the bottom */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
        <AnimatePresence>
          {picked.length > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-xl"
            >
              <div className="flex flex-1 flex-wrap gap-2">
                {picked.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => toggleCompare(v.id)}
                    className="rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/20"
                  >
                    {v.name} ✕
                  </button>
                ))}
              </div>
              {picked.length === 2 ? (
                <button
                  onClick={() => setShowCompare(true)}
                  className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black"
                >
                  Compare now
                </button>
              ) : (
                <span className="text-sm text-white/50">Pick one more</span>
              )}
              <button
                onClick={() => setCompareIds([])}
                className="text-sm text-white/50 hover:text-white"
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