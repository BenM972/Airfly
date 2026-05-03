"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroPanel from "./HeroPanel";
import HeroTicker from "./HeroTicker";

const panels = [
  { id: "ecole", label: "Ecole de glisse", image: "/hero_ecole.jpg", cta: "Reserver un cours", href: "/ecole" },
  { id: "textile", label: "Textile", image: "/hero_textile.jpg", cta: "Voir les collections", href: "/textile" },
  { id: "materiel", label: "Materiel", image: "/hero_materiel.jpg", cta: "Voir le matos technique", href: "/materiel" },
];

export default function Hero() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [autoIndex, setAutoIndex] = useState(0);
  const isUserHovering = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      if (!isUserHovering.current) {
        setAutoIndex((i) => (i + 1) % panels.length);
      }
    }, 5000);
  };

  useEffect(() => {
    startAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const activePanel = hovered ?? panels[autoIndex].id;

  const handleMouseEnter = (id: string) => {
    isUserHovering.current = true;
    setHovered(id);
  };

  const handleMouseLeave = () => {
    isUserHovering.current = false;
    setHovered(null);
    // Resync l'autoplay sur le panel suivant
    if (intervalRef.current) clearInterval(intervalRef.current);
    startAutoplay();
  };

  return (
    <section className="relative w-full h-screen min-h-[500px]">
      {/* Panels desktop — côte à côte */}
      <div className="hidden md:flex w-full h-full">
        {panels.map((panel) => (
          <HeroPanel
            key={panel.id}
            label={panel.label}
            image={panel.image}
            cta={panel.cta}
            href={panel.href}
            isHovered={activePanel === panel.id}
            isAnyHovered={true}
            onMouseEnter={() => handleMouseEnter(panel.id)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      <HeroTicker />

      {/* Panels mobile — empilés verticalement */}
      <div className="flex flex-col md:hidden w-full h-full">
        {panels.map((panel) => (
          <MobilePanelItem key={panel.id} panel={panel} />
        ))}
      </div>
    </section>
  );
}

function MobilePanelItem({
  panel,
}: {
  panel: { id: string; label: string; image: string; cta: string; href: string };
}) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <Image
        src={panel.image}
        alt={panel.label}
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 gap-3">
        <motion.span
          className="text-white uppercase tracking-wider text-base font-light"
          style={{ fontFamily: "Mirloanne, serif" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {panel.label}
        </motion.span>
        <Link
          href={panel.href}
          className="border border-white text-white uppercase text-[9px] tracking-wider px-4 py-1.5 hover:bg-white hover:text-black transition-colors duration-300 text-center"
          style={{ fontFamily: "Mirloanne, serif", letterSpacing: "0.1em" }}
        >
          {panel.cta}
        </Link>
      </div>
    </div>
  );
}
