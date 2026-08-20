"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SectionTitleProps {
  title: string;
  className?: string;
  /**
   * Niveau du titre. h2 par defaut : le composant sert le plus souvent a
   * intituler une section au sein d'une page qui a deja son h1. Les pages
   * dont il EST le titre principal passent "h1", sans quoi la page n'a
   * aucun h1 et son titre se retrouve au meme rang que ses sous-parties.
   */
  niveau?: "h1" | "h2";
}

export default function SectionTitle({ title, className = "", niveau = "h2" }: SectionTitleProps) {
  const Titre = niveau;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={`flex items-center justify-center gap-4 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      <span className="text-gray-900 text-sm">◆</span>
      <Titre
        className="text-2xl md:text-3xl font-light text-gray-900 uppercase tracking-widest"
        style={{ fontFamily: "Mirloanne, serif" }}
      >
        {title}
      </Titre>
      <span className="text-gray-900 text-sm">◆</span>
    </motion.div>
  );
}
