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
        aria-expanded={open}
        className="fixed bottom-24 right-4 z-40 border-2 border-ink bg-enamel px-5 py-3 font-bold text-bone shadow-[4px_4px_0_#0b1a16] focus-visible:outline-4 focus-visible:outline-mustard md:bottom-6 md:right-6"
      >
        {open ? "Close the chat" : "Ask the Garage"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask the Garage"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed bottom-40 right-4 z-40 flex h-[min(70vh,520px)] w-[min(92vw,380px)] flex-col border-2 border-ink bg-bone text-ink shadow-[8px_8px_0_#0b1a16] md:bottom-24 md:right-6"
          >
            <div className="border-b-2 border-ink bg-enamel px-5 py-3 text-bone">
              <p className="font-display text-xl">Ask the Garage</p>
              <p className="text-xs">
                Answers come from the cards on this site. AI can make mistakes,
                so check the card.
              </p>
            </div>

            <div data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-ink/70">Try one of these:</p>
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => ask(ex)}
                      className="block w-full border-2 border-ink bg-white px-3 py-2 text-left text-sm hover:bg-mustard/40"
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
                    className={`max-w-[85%] border-2 border-ink px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-mustard" : "bg-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.vehicles && m.vehicles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.vehicles.map((v) => (
                          <Link
                            key={v.slug}
                            href={`/vehicles/${v.slug}`}
                            className="border-2 border-ink bg-bone px-2 py-0.5 text-xs font-bold text-enamel hover:bg-mustard/50"
                          >
                            {v.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && <p className="text-sm text-ink/60">Checking the files...</p>}
              <div ref={endRef} />
            </div>

            <div className="flex gap-2 border-t-2 border-ink p-3">
              <input
                value={input}
                maxLength={200}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask(input);
                }}
                placeholder="Ask about a car or bike"
                className="flex-1 border-2 border-ink bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-ink/50 focus:border-enamel"
              />
              <button
                onClick={() => ask(input)}
                disabled={loading}
                className="border-2 border-ink bg-enamel px-4 py-2 text-sm font-bold text-bone disabled:opacity-50"
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