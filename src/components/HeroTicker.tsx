"use client";

import { motion } from "framer-motion";

const items = [
  "Kitesurf", "Wingfoil", "Kitefoil", "Windsurf", "Surf", "SUP",
  "Boardshorts", "Lycras", "Combinaisons", "Casquettes", "Lunettes",
  "Suncreams", "Boardbags", "Harnais", "Ailes & Boards", "Foils",
];

const separator = "◆";

export default function HeroTicker() {
  const repeated = [...items, ...items];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-sm overflow-hidden py-3">
      <motion.div
        className="flex gap-8 whitespace-nowrap w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 text-white uppercase text-xs tracking-widest"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            {item}
            <span className="text-white/40 text-[8px]">{separator}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
