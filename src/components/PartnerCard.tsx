"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import type { Partner } from "@/data/partners";
import { stripAccents } from "@/lib/text";

type Props = {
  partner: Partner;
  /** Position dans la liste : les index impairs inversent le sens de la grille. */
  index: number;
};

export default function PartnerCard({ partner, index }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  // Certains visiteurs desactivent les animations au niveau du systeme.
  const sobre = useReducedMotion();
  const reversed = index % 2 === 1;
  const image = partner.image;

  return (
    <motion.article
      ref={ref}
      className="md:grid md:grid-cols-2 md:gap-16 items-center"
      initial={sobre ? false : { opacity: 0, y: 20 }}
      animate={inView || sobre ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Photo — le ratio explicite evite tout decalage de mise en page.
          Le leger zoom au survol reprend celui des cartes produit. */}
      {image && (
        <div
          className={`group relative aspect-[4/3] overflow-hidden shadow-xl mb-8 md:mb-0 ${
            reversed ? "md:order-2" : ""
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 608px"
            className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Voile discret en bas : detache la photo du fond beige sans l'assombrir. */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      <div className={!image ? "md:col-span-2 md:max-w-3xl" : ""}>
        {partner.logo && (
          <div className="relative h-11 w-36 mb-6">
            <Image src={partner.logo} alt="" fill sizes="144px" className="object-contain object-left" />
          </div>
        )}

        {/* Localisation avant le nom : elle situe le partenaire d'un coup d'oeil,
            et son petit corps laisse le titre dominer la hierarchie. */}
        <p
          className="text-xs uppercase tracking-[0.2em] text-[#FF0080] mb-3"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {stripAccents(partner.location)}
        </p>

        <h3
          className="text-gray-900 text-3xl md:text-4xl font-light leading-tight mb-3"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.name}
        </h3>

        <p
          className="text-gray-700 text-xl font-light mb-6"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.tagline}
        </p>

        {/* Atouts : le losange est deja le motif du site (SectionTitle, back office),
            ce qui evite d'importer une bibliotheque d'icones pour trois puces. */}
        {partner.atouts && partner.atouts.length > 0 && (
          <ul className="mb-6 space-y-2">
            {partner.atouts.map((atout) => (
              <li
                key={atout}
                className="flex items-baseline gap-3 text-gray-600 text-base"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                <span className="text-[#FF0080] text-[9px] shrink-0" aria-hidden="true">◆</span>
                {atout}
              </li>
            ))}
          </ul>
        )}

        <p
          className="text-gray-700 text-base leading-relaxed mb-8"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.description}
        </p>

        {/* Libelle en Mirloanne : sans accent, d'ou "Decouvrir".
            min-h-[44px] : cible tactile minimale sur mobile. */}
        <a
          href={partner.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center min-h-[44px] border border-gray-900 text-gray-900 uppercase tracking-widest text-xs px-8 py-3 transition-colors duration-300 hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0080] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f0e8]"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          Decouvrir {stripAccents(partner.name)}
        </a>
      </div>
    </motion.article>
  );
}
