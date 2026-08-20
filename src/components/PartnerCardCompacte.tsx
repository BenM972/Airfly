"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { Partner } from "@/data/partners";
import { stripAccents } from "@/lib/text";
import { compterClicPartenaire } from "@/lib/compterClicPartenaire";

/**
 * Carte reduite, pour les partenaires secondaires.
 *
 * Elle reste plus legere que la grande carte — ni photo, ni atouts, ni
 * description — mais pas fade pour autant : le filet rose et le bouton
 * circulaire reprennent le vocabulaire du reste du site. La hierarchie
 * tient a la surface occupee, pas a un manque de soin.
 *
 * La carte entiere est le lien : sur mobile, viser un libelle de quelques
 * caracteres est penible, et le bloc depasse largement les 44 px de haut.
 */
export default function PartnerCardCompacte({ partner }: { partner: Partner }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const sobre = useReducedMotion();

  return (
    <motion.article
      ref={ref}
      initial={sobre ? false : { opacity: 0, y: 16 }}
      animate={inView || sobre ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <a
        href={partner.href}
        onClick={() => compterClicPartenaire(partner.slug)}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-5 overflow-hidden border border-gray-200 bg-white py-6 pl-8 pr-6 transition-all duration-300 hover:border-gray-900 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0080] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f0e8] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        {/* Filet rose : rappel de l'accent du site, et seul element qui bouge
            vraiment au survol. Il s'elargit au lieu de changer de couleur, ce
            qui reste lisible pour qui distingue mal les teintes. */}
        <span
          className="absolute inset-y-0 left-0 w-[3px] bg-[#FF0080] transition-all duration-300 group-hover:w-[7px] motion-reduce:transition-none"
          aria-hidden="true"
        />

        {partner.logo && (
          <>
            <div className="relative h-12 w-24 shrink-0">
              {/* alt vide : le nom suit immediatement en texte, le repeter
                  alourdirait la lecture vocale. */}
              <Image src={partner.logo} alt="" fill sizes="96px" className="object-contain object-left" />
            </div>
            <span className="h-12 w-px shrink-0 bg-gray-200" aria-hidden="true" />
          </>
        )}

        <div className="relative min-w-0 flex-1">
          <p
            className="mb-1.5 text-[10px] uppercase tracking-[0.25em] text-gray-400 transition-colors duration-300 group-hover:text-[#FF0080] motion-reduce:transition-none"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            {stripAccents(partner.location)}
          </p>
          <p
            className="text-2xl font-light leading-snug text-gray-900"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {partner.name}
          </p>
          <p
            className="mt-0.5 text-base font-light leading-snug text-gray-500"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {partner.tagline}
          </p>
        </div>

        {/* Decoratif : la nature de lien est deja portee par la balise, et le
            libelle accessible par le texte de la carte. */}
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-all duration-300 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white motion-reduce:transition-none"
          aria-hidden="true"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </span>
      </a>
    </motion.article>
  );
}
