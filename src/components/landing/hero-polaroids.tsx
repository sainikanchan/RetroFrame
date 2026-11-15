"use client";

import { motion } from "framer-motion";

const cards = [
  { rotate: -8, x: 0, y: 10, bg: "linear-gradient(135deg,#E8A33D,#C1503F)", z: 3, caption: "sunday drive" },
  { rotate: 6, x: 90, y: -30, bg: "linear-gradient(135deg,#7C8B6F,#2E3627)", z: 2, caption: "the coast" },
  { rotate: -3, x: 40, y: 90, bg: "linear-gradient(135deg,#3B4A5A,#211E1B)", z: 1, caption: "midnight" },
];

export function HeroPolaroids() {
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-sm sm:h-[380px]">
      {cards.map((c, i) => (
        <motion.div
          key={i}
          initial={{ y: 40, rotate: 0 }}
          animate={{ y: c.y, rotate: c.rotate }}
          transition={{ delay: i * 0.15, type: "spring", stiffness: 90, damping: 14 }}
          style={{ left: c.x, zIndex: c.z }}
          className="polaroid-shadow absolute top-6 w-48 rounded-sm bg-paper p-3 pb-8"
        >
          <div className="aspect-square w-full rounded-[2px]" style={{ background: c.bg }} />
          <p className="mt-2 text-center font-caveat text-lg text-ink" style={{ fontFamily: "var(--font-caveat)" }}>
            {c.caption}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
