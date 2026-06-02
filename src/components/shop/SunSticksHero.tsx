"use client";

import { motion } from "framer-motion";

type Props = {
  onShopSoins: () => void;
};

const STICKS = [
  { color: "#F5F0E8", border: "#D4C9B0" },
  { color: "#1B4F6A", border: "#1B4F6A" },
  { color: "#F4827A", border: "#F4827A" },
  { color: "#C4924A", border: "#C4924A" },
];

export default function SunSticksHero({ onShopSoins }: Props) {
  return (
    <section className="bg-[#FFF060] px-6 md:px-16 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">

        {/* Gauche : marque + titre */}
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-black/40 leading-none mb-1" style={{ fontFamily: "Mirloanne, serif" }}>
              seventy — one percent
            </p>
            <h2 className="text-black text-2xl md:text-3xl font-light leading-none" style={{ fontFamily: "Mirloanne, serif" }}>
              Sun Sticks <span className="text-black/40 text-lg">SPF 50+</span>
            </h2>
          </div>
        </motion.div>

        {/* Centre : sticks */}
        <motion.div
          className="flex items-end gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {STICKS.map((s, i) => (
            <div
              key={i}
              className="w-5 rounded-2xl border"
              style={{ height: 40 + i * 6, backgroundColor: s.color, borderColor: s.border }}
            />
          ))}
        </motion.div>

        {/* Droite : claims + CTA */}
        <motion.div
          className="flex items-center gap-6 flex-wrap"
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p className="text-black/60 text-sm hidden md:block" style={{ fontFamily: "var(--font-cormorant)" }}>
            Made in France · 1% for the Planet · Eco Label
          </p>
          <button
            onClick={onShopSoins}
            className="bg-black text-[#FFF060] uppercase tracking-widest text-xs px-6 py-3 hover:bg-[#FF0080] hover:text-white transition-colors duration-300 whitespace-nowrap"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Découvrir →
          </button>
        </motion.div>

      </div>
    </section>
  );
}
