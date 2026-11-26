import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getVehicles, getVehicleBySlug } from "../../../lib/vehicles";
import { slugify } from "../../../lib/slug";

export async function generateStaticParams() {
  const all = await getVehicles();
  return all.map((v) => ({ slug: slugify(v.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) return { title: "Not found" };

  const description =
    v.story ?? `${v.name} (${v.year}${v.country ? ", " + v.country : ""})`;

  return {
    title: v.name,
    description,
    openGraph: {
      title: v.name,
      description,
      images: v.image_url ? [{ url: v.image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      images: v.image_url ? [v.image_url] : undefined,
    },
  };
}

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
    { label: "Decade", value: `${Math.floor(vehicle.year / 10) * 10}s` },
  ];

  return (
    <main className="px-4 py-10 md:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-block font-bold text-bone underline underline-offset-4 hover:text-mustard"
        >
          Back to the garage
        </Link>

        <article className="relative mt-8 border-2 border-ink bg-bone p-5 text-ink shadow-[8px_8px_0_#0b1a16] md:p-10">
          <span className="absolute -top-3 left-1/2 h-5 w-24 -translate-x-1/2 -rotate-2 bg-mustard/80" />

          {/* photo print */}
          <div className="-rotate-1">
            {vehicle.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vehicle.image_url}
                alt={vehicle.name}
                className="max-h-[65vh] w-full border-[10px] border-white object-cover"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center border-[10px] border-white bg-chrome/50 text-ink/60">
                No photo yet
              </div>
            )}
          </div>
          {vehicle.image_credit && (
            <p className="mt-3 text-xs text-ink/50">{vehicle.image_credit}</p>
          )}

          <div className="mt-8 flex items-center gap-3">
            <span className="border-2 border-ink bg-mustard px-3 py-1 font-display text-2xl leading-none">
              {vehicle.year}
            </span>
            <span className="text-lg font-bold">{vehicle.type}</span>
          </div>

          <h1 className="mt-4 font-display text-[clamp(2rem,6vw,4rem)] leading-none">
            {vehicle.name}
          </h1>

          <table className="mt-8 w-full border-collapse border-2 border-ink text-left">
            <tbody>
              {facts.map((f) => (
                <tr key={f.label} className="border-b-2 border-ink last:border-b-0">
                  <th
                    scope="row"
                    className="w-1/3 border-r-2 border-ink bg-mustard/60 px-4 py-2 font-bold"
                  >
                    {f.label}
                  </th>
                  <td className="px-4 py-2">{f.value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {vehicle.story && (
            <p className="mt-8 max-w-prose text-lg leading-relaxed">
              {vehicle.story}
            </p>
          )}

          {related.length > 0 && (
            <section className="mt-12 border-t-2 border-dashed border-ink/40 pt-8">
              <h2 className="font-display text-2xl">
                More {vehicle.type.toLowerCase()}s from around {vehicle.year}
              </h2>
              <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                {related.map((v) => (
                  <Link
                    key={v.id}
                    href={`/vehicles/${slugify(v.name)}`}
                    className="block border-2 border-ink bg-bone p-3 shadow-[4px_4px_0_#0b1a16] transition-transform hover:-translate-y-1 hover:bg-mustard/30"
                  >
                    <span className="border-2 border-ink bg-mustard px-2 py-0.5 font-display leading-none">
                      {v.year}
                    </span>
                    <p className="mt-3 font-bold leading-snug">{v.name}</p>
                    <p className="text-sm text-ink/70">{v.country}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}