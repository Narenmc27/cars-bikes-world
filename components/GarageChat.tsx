"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

type Msg = {
  role: "user" | "bot";
  text: string;
  vehicles?: { name: string; slug: string }[];
};

const EXAMPLES = ["Oldest bike from Italy?", "Cars from India", "What was made in 1969?"];

export default function GarageChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || loading) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "bot",
          text: data.answer ?? data.error ?? "Something went wrong.",
          vehicles: data.vehicles,
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "bot", text: "Could not reach the garage. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-4 z-40 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-black shadow-lg md:bottom-6 md:right-6"
      >
        {open ? "Close" : "💬 Ask the Garage"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed bottom-40 right-4 z-40 flex h-[min(70vh,520px)] w-[min(92vw,380px)] flex-col rounded-3xl border border-white/10 bg-[#0b0d14]/95 backdrop-blur-xl md:bottom-24 md:right-6"
          >
            <div className="border-b border-white/10 px-5 py-4">
              <p className="font-semibold">Ask the Garage 🚗🏍️</p>
              <p className="text-xs text-white/50">
                Answers come only from this website&apos;s database.
              </p>
            </div>

            <div data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/60">Try one of these:</p>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => ask(ex)}
                      className="block w-full rounded-xl bg-white/5 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}

              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-cyan-400 text-black"
                        : "bg-white/10 text-white/90"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.vehicles && m.vehicles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.vehicles.map((v) => (
                          <Link
                            key={v.slug}
                            href={`/vehicles/${v.slug}`}
                            className="rounded-full bg-black/30 px-3 py-1 text-xs text-cyan-300 hover:bg-black/50"
                          >
                            {v.name} →
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && <p className="text-sm text-white/50">Thinking...</p>}
              <div ref={endRef} />
            </div>

            <div className="flex gap-2 border-t border-white/10 p-3">
              <input
                value={input}
                maxLength={200}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask(input);
                }}
                placeholder="Ask about a car or bike..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-cyan-300/60"
              />
              <button
                onClick={() => ask(input)}
                disabled={loading}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}