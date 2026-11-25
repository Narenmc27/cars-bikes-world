import Reveal from "../components/Reveal";

const vehicles = [
  { name: "Ford Model T", type: "Car", year: 1908, country: "USA" },
  { name: "Royal Enfield Bullet", type: "Bike", year: 1932, country: "UK / India" },
  { name: "Hindustan Ambassador", type: "Car", year: 1958, country: "India" },
  { name: "Honda CB750", type: "Bike", year: 1969, country: "Japan" },
  { name: "Yamaha RX100", type: "Bike", year: 1985, country: "Japan / India" },
  { name: "Ferrari F40", type: "Car", year: 1987, country: "Italy" },
];

export default function Home() {
  return (
    <main>
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Reveal>
          <p className="mb-4 text-sm tracking-[0.3em] text-cyan-300">
            EVERY MACHINE. EVERY ERA.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="text-[clamp(2.5rem,9vw,8rem)] font-bold leading-none">
            Cars & Bikes World
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl text-[clamp(1rem,2vw,1.25rem)] text-white/60">
            A fluid journey through every car and bike ever made.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-32">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {vehicles.map((v, i) => (
            <Reveal key={v.name} delay={(i % 3) * 0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform duration-500 hover:-translate-y-2 hover:border-cyan-300/50">
                <div className="mb-6 h-40 rounded-xl bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30" />
                <p className="text-sm text-cyan-300">
                  {v.type} · {v.year}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{v.name}</h3>
                <p className="text-white/50">{v.country}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}