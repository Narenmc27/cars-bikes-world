"use client";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function LiquidCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const fastX = useSpring(x, { stiffness: 120, damping: 20 });
  const fastY = useSpring(y, { stiffness: 120, damping: 20 });
  const slowX = useSpring(x, { stiffness: 60, damping: 18 });
  const slowY = useSpring(y, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="pointer-events-none fixed inset-0 z-50 hidden md:block"
        style={{ filter: "url(#goo)" }}
      >
        <motion.div
          style={{ x: fastX, y: fastY }}
          className="absolute -left-4 -top-4 h-8 w-8 rounded-full bg-cyan-400"
        />
        <motion.div
          style={{ x: slowX, y: slowY }}
          className="absolute -left-8 -top-8 h-16 w-16 rounded-full bg-fuchsia-500/80"
        />
      </div>
    </>
  );
}