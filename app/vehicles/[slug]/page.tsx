import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Reveal from "../../../components/Reveal";
import { getVehicles, getVehicleBySlug } from "../../../lib/vehicles";
import { slugify } from "../../../lib/slug";

export default function VehiclePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VehicleDetail params={params} />
    </Suspense>
  );
}

async function VehicleDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const all = await getVehicles();
  const related = all
    .filter((v) => v.id !== vehicle.id && v.type === vehicle.type)
    .sort(
      (a, b) =>
        Math.abs(a.year - vehicle.year) - Math.abs(b.year - vehicle.year)
    )
    .slice(0, 3);

  const facts = [
    { label: "Year", value: String(vehicle.year) },
    { label: "Country", value: vehicle.country ?? "Unknown" },
    { label: "Type", value: vehicle.type },
    { label: "Era", value: `${Math.floor(vehicle.year / 10) * 10}s` },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="inline-block text-sm text-cyan-300 transition hover:-translate-x-1"
      >
        ← Back to all vehicles
      </Link>

      <Reveal>
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {vehicle.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.image_url}
              alt={vehicle.name}
              className="max-h-[70vh] w-full object-cover"
            />
          ) : (
            <div className="h-[40vh] bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30" />
          )}
        </div>
        {vehicle.image_credit && (
          <p className="mt-2 text-xs text-white/30">{vehicle.image_credit}</p>
        )}
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-10 text-sm tracking-[0.3em] text-cyan-300">
          {vehicle.type.toUpperCase()} · {vehicle.year}
        </p>
        <h1 className="mt-2 text-[clamp(2rem,7vw,5rem)] font-bold leading-none">
          {vehicle.name}
        </h1>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {facts.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <p className="text-xs uppercase tracking-widest text-white/40">
                {f.label}
              </p>
              <p className="mt-1 text-lg font-semibold">{f.value}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {vehicle.story && (
        <Reveal delay={0.2}>
          <p className="mt-10 max-w-2xl text-[clamp(1.05rem,2vw,1.35rem)] leading-relaxed text-white/70">
            {vehicle.story}
          </p>
        </Reveal>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <Reveal>
            <h2 className="mb-6 text-2xl font-semibold">
              More {vehicle.type.toLowerCase()}s from a similar time
            </h2>
          </Reveal>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {related.map((v, i) => (
              <Reveal key={v.id} delay={i * 0.1}>
                <Link
                  href={`/vehicles/${slugify(v.name)}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/50"
                >
                  <p className="text-sm text-cyan-300">{v.year}</p>
                  <p className="mt-1 font-semibold">{v.name}</p>
                  <p className="text-sm text-white/50">{v.country}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}