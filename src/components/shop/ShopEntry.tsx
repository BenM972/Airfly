"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type Props = {
  onSelect: (cat: "textile" | "materiel") => void;
};

const panels = [
  {
    id: "textile" as const,
    label: "Textile",
    sub: "T-shirts · Hoodies · Shorts · Casquettes",
    image: "/hero_textile.jpg",
    cta: "Voir la collection",
  },
  {
    id: "materiel" as const,
    label: "Materiel",
    sub: "Kites · Planches · Ailes · Harnais",
    image: "/shop/entry-materiel.jpg",
    cta: "Shoper mon matos",
  },
];

export default function ShopEntry({ onSelect }: Props) {
  return (
    <section className="h-screen flex flex-row">
      {panels.map((panel, i) => (
        <motion.button
          key={panel.id}
          onClick={() => onSelect(panel.id)}
          className="relative flex-1 overflow-hidden group cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: i * 0.15 }}
        >
          {/* Image */}
          <Image
            src={panel.image}
            alt={panel.label}
            fill
            className="object-cover transition-transform duration-700 scale-100 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-500" />

          {/* Separator line */}
          {i === 0 && (
            <div className="absolute right-0 top-0 h-full w-px bg-white/20 z-10" />
          )}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <motion.p
              className="text-[#FF0080] text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              Collection
            </motion.p>
            <motion.h2
              className="text-white text-3xl md:text-7xl uppercase font-light mb-4"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
            >
              {panel.label}
            </motion.h2>
            <motion.p
              className="hidden md:block text-white/60 text-base"
              style={{ fontFamily: "var(--font-cormorant)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
            >
              {panel.sub}
            </motion.p>

            {/* CTA */}
            <motion.span
              className="mt-8 border border-white/60 text-white uppercase tracking-widest text-xs px-8 py-3 group-hover:bg-white group-hover:text-black transition-colors duration-300"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
            >
              {panel.cta}
            </motion.span>
          </div>
        </motion.button>
      ))}
    </section>
  );
}
