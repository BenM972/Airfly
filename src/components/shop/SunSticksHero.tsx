"use client";

import { motion } from "framer-motion";

type Props = {
  onShopSoins: () => void;
};

const STICKS = [
  { src: "/shop/stick-1.png", label: "Blanc" },
  { src: "/shop/stick-2.png", label: "Ocean Blue" },
  { src: "/shop/stick-3.png", label: "Sunset" },
];

export default function SunSticksHero({ onShopSoins }: Props) {
  return (
    <section className="relative overflow-hidden" style={{ height: "40vh" }}>
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/banner-suncream.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenu */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-16 flex items-center justify-between gap-8">

        {/* Gauche : texte */}
        <motion.div
          className="flex flex-col justify-center gap-3 flex-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50" style={{ fontFamily: "Mirloanne, serif" }}>
            seventy — one percent
          </p>
          <h2 className="text-white text-3xl md:text-5xl font-light leading-tight" style={{ fontFamily: "Mirloanne, serif" }}>
            Sun Sticks
          </h2>
          <p className="text-white/60 text-sm md:text-base" style={{ fontFamily: "var(--font-cormorant)" }}>
            SPF 50+ · Made in France · 1% for the Planet
          </p>
          <button
            onClick={onShopSoins}
            className="mt-2 self-start bg-white text-black uppercase tracking-widest text-xs px-6 py-3 hover:bg-[#FFF060] transition-colors duration-300"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            Découvrir la gamme →
          </button>
        </motion.div>

        {/* Droite : sticks */}
        <motion.div
          className="flex items-end gap-3 h-3/4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {STICKS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.label} className="flex-1 w-14 md:w-20 object-contain drop-shadow-lg" />
              <span className="text-[9px] uppercase tracking-wider text-white/50 hidden md:block" style={{ fontFamily: "Mirloanne, serif" }}>
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
