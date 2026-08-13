"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
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
  const reversed = index % 2 === 1;
  const image = partner.image;

  // Le depart du visiteur prime : ni preventDefault, ni await avant la
  // navigation. keepalive assure l'envoi pendant l'ouverture du nouvel onglet.
  const compterLeClic = () => {
    try {
      fetch("/api/partners/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: partner.slug }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Un echec de comptage ne doit jamais remonter au visiteur.
    }
  };

  return (
    <motion.article
      ref={ref}
      className="md:grid md:grid-cols-2 md:gap-16 items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Photo — le ratio explicite evite tout decalage de mise en page */}
      {image && (
        <div
          className={`relative aspect-[4/3] overflow-hidden shadow-xl mb-8 md:mb-0 ${
            reversed ? "md:order-2" : ""
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}

      <div className={!image ? "md:col-span-2" : ""}>
        {/* Hauteur fixe : n'importe quel ratio de logo s'y insere sans
            deformer ni decaler les cartes entre elles */}
        {partner.logo && (
          <div className="relative h-12 w-40 mb-6">
            <Image
              src={partner.logo}
              alt=""
              fill
              sizes="160px"
              className="object-contain object-left"
            />
          </div>
        )}

        <h3
          className="text-gray-900 text-2xl md:text-3xl font-light mb-2"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.name}
        </h3>

        <p
          className="text-gray-900 text-lg mb-3"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.tagline}
        </p>

        {/* Mirloanne : le contenu de location doit etre sans accent */}
        <p
          className="text-xs uppercase tracking-widest text-gray-500 mb-6"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {stripAccents(partner.location)}
        </p>

        <p
          className="text-gray-700 text-base leading-relaxed mb-8"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.description}
        </p>

        {/* Libelle en Mirloanne : sans accent, d'ou "Decouvrir" */}
        <a
          href={partner.href}
          onClick={compterLeClic}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-gray-900 text-gray-900 uppercase tracking-widest text-xs px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors duration-300"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          Decouvrir {stripAccents(partner.name)}
        </a>
      </div>
    </motion.article>
  );
}
