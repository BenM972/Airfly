"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function EcoleHero() {
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <Image
        src="/hero_ecole.jpg"
        alt="Ecole de glisse Airfly"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.p
          className="uppercase tracking-widest text-xs text-[#FF0080] mb-4"
          style={{ fontFamily: "Mirloanne, serif" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Pointe Faula — Vauclin, Martinique
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl font-light text-white uppercase mb-6"
          style={{ fontFamily: "Mirloanne, serif" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Ecole de glisse
        </motion.h1>
        <motion.p
          className="text-white/80 text-lg md:text-xl max-w-xl"
          style={{ fontFamily: "var(--font-cormorant)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Kitesurf · Wingfoil · Kitefoil — tous niveaux, tous âges
        </motion.p>
      </div>
    </section>
  );
}
