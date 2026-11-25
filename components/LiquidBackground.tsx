"use client";
import { motion } from "framer-motion";

export default function LiquidBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 160, -80, 0], y: [0, -100, 80, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[5%] top-[10%] h-[45vmax] w-[45vmax] rounded-full bg-cyan-500/25 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -140, 100, 0], y: [0, 120, -60, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[5%] top-[30%] h-[40vmax] w-[40vmax] rounded-full bg-fuchsia-500/20 blur-3xl"
      />
    </div>
  );
}