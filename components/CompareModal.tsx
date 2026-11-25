"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Vehicle } from "../lib/types";
import { slugify } from "../lib/slug";

const rows: { label: string; get: (v: Vehicle) => string }[] = [
  { label: "Type", get: (v) => v.type },
  { label: "Year", get: (v) => String(v.year) },
  { label: "Country", get: (v) => v.country ?? "Unknown" },
  { label: "Era", get: (v) => `${Math.floor(v.year / 10) * 10}s` },
];

export default function CompareModal({
  a,
  b,
  onClose,
}: {
  a: Vehicle;
  b: Vehicle;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const diff = Math.abs(a.year - b.year);
  const older = a.year <= b.year ? a : b;
  const newer = a.year <= b.year ? b : a;
  const summary =
    diff === 0
      ? `${a.name} and ${b.name} are from the same year.`
      : `${newer.name} came ${diff} year${diff === 1 ? "" : "s"} after ${older.name}.`;

  return (
    <motion.div
      className="fixed inset-0 z-[45] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        data-lenis-prevent
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0b0d14] p-6"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
        >
          ✕
        </button>

        <h2 className="mb-6 text-center text-2xl font-semibold">Compare</h2>

        <div className="grid grid-cols-2 gap-4">
          {[a, b].map((v) => (
            <div key={v.id} className="text-center">
              {v.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.image_url}
                  alt={v.name}
                  className="h-36 w-full rounded-xl object-cover md:h-48"
                />
              ) : (
                <div className="h-36 rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 md:h-48" />
              )}
              <h3 className="mt-3 text-lg font-semibold">{v.name}</h3>
              <Link
                href={`/vehicles/${slugify(v.name)}`}
                className="text-sm text-cyan-300"
              >
                View details →
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10">
          {rows.map((r) => (
            <div key={r.label} className="px-4 py-3">
              <p className="text-center text-xs uppercase tracking-widest text-white/40">
                {r.label}
              </p>
              <div className="mt-1 grid grid-cols-2 gap-4 text-center font-semibold">
                <p>{r.get(a)}</p>
                <p>{r.get(b)}</p>
              </div>
            </div>
          ))}
          <div className="px-4 py-3">
            <p className="text-center text-xs uppercase tracking-widest text-white/40">
              Story
            </p>
            <div className="mt-1 grid grid-cols-2 gap-4 text-center text-sm text-white/60">
              <p>{a.story ?? "-"}</p>
              <p>{b.story ?? "-"}</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-white/70">{summary}</p>
      </motion.div>
    </motion.div>
  );
}