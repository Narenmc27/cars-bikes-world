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
  { label: "Decade", get: (v) => `${Math.floor(v.year / 10) * 10}s` },
  { label: "Story", get: (v) => v.story ?? "-" },
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
      className="fixed inset-0 z-[45] flex items-center justify-center bg-brg-deep/85 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label="Compare vehicles"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto border-2 border-ink bg-bone p-5 text-ink shadow-[8px_8px_0_#0b1a16] md:p-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 h-9 w-9 border-2 border-ink bg-bone font-bold hover:bg-mustard/50"
        >
          ✕
        </button>

        <h2 className="font-display text-3xl">Side by side</h2>

        <table className="mt-6 w-full table-fixed border-collapse border-2 border-ink text-left">
          <thead>
            <tr className="border-b-2 border-ink align-top">
              <td className="w-1/4 border-r-2 border-ink bg-mustard/60" />
              {[a, b].map((v, i) => (
                <th
                  key={v.id}
                  scope="col"
                  className={`p-3 font-normal ${i === 0 ? "border-r-2 border-ink" : ""}`}
                >
                  {v.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.image_url}
                      alt={v.name}
                      className="h-24 w-full border-4 border-white object-cover md:h-36"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center border-4 border-white bg-chrome/50 text-sm text-ink/60 md:h-36">
                      No photo yet
                    </div>
                  )}
                  <p className="mt-2 font-display text-base leading-tight md:text-xl">
                    {v.name}
                  </p>
                  <Link
                    href={`/vehicles/${slugify(v.name)}`}
                    className="mt-1 inline-block text-sm font-bold text-enamel underline underline-offset-4"
                  >
                    Read the full card
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b-2 border-ink last:border-b-0">
                <th
                  scope="row"
                  className="border-r-2 border-ink bg-mustard/60 px-3 py-2 align-top font-bold"
                >
                  {r.label}
                </th>
                <td className="border-r-2 border-ink px-3 py-2 align-top text-sm md:text-base">
                  {r.get(a)}
                </td>
                <td className="px-3 py-2 align-top text-sm md:text-base">
                  {r.get(b)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 bg-mustard px-4 py-3 font-bold">{summary}</p>
      </motion.div>
    </motion.div>
  );
}