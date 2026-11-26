import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md border-2 border-ink bg-bone p-8 text-center text-ink shadow-[8px_8px_0_#0b1a16]">
        <h1 className="font-display text-3xl">Card not found</h1>
        <p className="mt-3">We could not find that page in the card files.</p>
        <Link
          href="/"
          className="mt-6 inline-block border-2 border-ink bg-enamel px-4 py-2 font-bold text-bone"
        >
          Back to the garage
        </Link>
      </div>
    </main>
  );
}