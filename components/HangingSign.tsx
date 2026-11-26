"use client";
import { motion, useReducedMotion } from "framer-motion";

export default function HangingSign() {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        style={{ transformOrigin: "50% 0%" }}
        initial={reduce ? false : { rotate: 7 }}
        animate={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 40, damping: 4, mass: 1.2 }}
      >
        <div className="mx-auto flex w-[62%] justify-between">
          <div className="chain h-14 w-2" />
          <div className="chain h-14 w-2" />
        </div>

        <div className="relative rounded-2xl border-[6px] border-bone bg-enamel p-2 shadow-[8px_8px_0_#0b1a16]">
          <span className="absolute left-5 top-5 h-2.5 w-2.5 rounded-full bg-chrome" />
          <span className="absolute right-5 top-5 h-2.5 w-2.5 rounded-full bg-chrome" />
          <span className="absolute bottom-5 left-5 h-2.5 w-2.5 rounded-full bg-chrome" />
          <span className="absolute bottom-5 right-5 h-2.5 w-2.5 rounded-full bg-chrome" />

          <div className="rounded-xl border-2 border-bone/70 px-6 pb-4 pt-8 text-center">
            <h1 className="font-display text-[clamp(2.4rem,9vw,6.5rem)] leading-[0.95] text-bone">
              Cars &amp; Bikes World
            </h1>
            <p className="mx-auto mt-6 w-fit bg-mustard px-4 py-1.5 font-bold text-ink">
              Machines from 1886 to today
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}