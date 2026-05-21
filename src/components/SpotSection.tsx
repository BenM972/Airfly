"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import CarteMartinique from "./CarteMartinique";
import SectionTitle from "./SectionTitle";

function openNavigation() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const url = isIOS
    ? `maps://maps.apple.com/?q=14.541922560749377,-60.82981741961289`
    : `https://www.google.com/maps/dir/?api=1&destination=14.541922560749377,-60.82981741961289`;
  window.open(url, "_blank");
}

export default function SpotSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="bg-[#f5f0e8] py-24 px-10 md:px-16 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto">

        <SectionTitle title="Le Spot" className="mb-12" />

        {/* Split : carte gauche / texte droite */}
        <div className="md:grid md:grid-cols-2 md:gap-16 items-center">

          {/* Colonne gauche — carte Martinique */}
          <div className="hidden md:flex items-center justify-center">
            <CarteMartinique className="w-80 h-80" />
          </div>

          {/* Colonne droite */}
          <div>
            <motion.div
              className="space-y-5 text-gray-700 text-base leading-relaxed mb-10"
              style={{ fontFamily: "var(--font-cormorant)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p>
                L'école de glisse Airfly évolue sur le spot de la <strong className="text-gray-900">Pointe Faula</strong>, plus
                précisément sur les <strong className="text-gray-900">hauts fonds de Massy Massy</strong>. L'eau est chaude
                toute l'année — on peut naviguer en short et lycra, sans combinaison.
              </p>
              <p>
                La barrière de corail au large crée une eau plate (sans vague) et le banc de sable permet d'avoir
                pied sur une grande partie de la zone école. Toutes les conditions sont réunies pour{" "}
                <strong className="text-gray-900">apprendre et progresser rapidement</strong> en kitesurf ou en wingfoil.
              </p>
              <p>
                Le vent souffle régulièrement entre <strong className="text-gray-900">12 et 20 nœuds</strong>, avec
                une saison forte de novembre à mai. Un bateau de sécurité est présent à chaque session.
                Les zones de navigation sont balisées par arrêté préfectoral pour la sécurité de tous.
              </p>
            </motion.div>

            <motion.button
              type="button"
              onClick={openNavigation}
              className="flex items-center gap-3 border border-gray-400 text-gray-600 uppercase tracking-widest text-sm px-6 py-3.5 hover:border-gray-900 hover:text-gray-900 transition-colors duration-300"
              style={{ fontFamily: "Mirloanne, serif" }}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Emmenes-moi au spot
            </motion.button>

          </div>

        </div>
      </div>
    </section>
  );
}
