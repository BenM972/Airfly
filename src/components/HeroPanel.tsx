"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface HeroPanelProps {
  label: string;
  image: string;
  cta: string;
  href: string;
  isHovered: boolean;
  isAnyHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export default function HeroPanel({
  label,
  image,
  cta,
  href,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: HeroPanelProps) {
  const flex = isHovered ? 3 : 0.5;

  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer h-full"
      animate={{ flex }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image — grayscale par défaut, couleur au hover */}
      <motion.div
        className="absolute inset-0"
        animate={{ filter: isHovered ? "grayscale(0%)" : "grayscale(100%)" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <Image
          src={image}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority
        />
      </motion.div>

      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        animate={{ opacity: isHovered ? 0.3 : 0.55 }}
        transition={{ duration: 0.5 }}
      />

      {/* Label sur tuile inactive — toujours visible, vertical */}
      <AnimatePresence>
        {!isHovered && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span
              className="text-white uppercase font-light whitespace-nowrap"
              style={{
                fontFamily: "Mirloanne, serif",
                letterSpacing: "0.25em",
                fontSize: "clamp(0.75rem, 1.2vw, 1.1rem)",
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
              }}
            >
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Titre centré + CTA — panel actif */}
      <AnimatePresence>
        {isHovered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <motion.span
              className="text-white uppercase font-light text-center"
              style={{
                fontFamily: "Mirloanne, serif",
                letterSpacing: "0.25em",
                fontSize: "clamp(2.5rem, 5vw, 5rem)",
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              {label}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
            >
              <Link
                href={href}
                className="inline-block border border-white text-white uppercase tracking-widest text-sm px-8 py-4 hover:bg-white hover:text-black transition-colors duration-300"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                {cta}
              </Link>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
