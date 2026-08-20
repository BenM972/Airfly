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
 * Volontairement pauvre : logo, nom, localisation, accroche. Ni photo, ni
 * atouts, ni description — c'est cette sobriete qui exprime la hierarchie
 * face a la grande carte, sans avoir a le dire au visiteur.
 *
 * La carte entiere est le lien : sur mobile, viser un libelle de quelques
 * caracteres est penible, et le bloc fait toujours plus de 44 px de haut.
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
        className="group flex items-center gap-5 border border-gray-300 bg-white/40 px-5 py-4 transition-colors duration-300 hover:border-gray-900 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0080] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f0e8]"
      >
        {partner.logo && (
          <div className="relative h-10 w-20 shrink-0">
            {/* alt vide : le nom du partenaire suit immediatement en texte,
                le decrire une seconde fois alourdirait la lecture vocale. */}
            <Image src={partner.logo} alt="" fill sizes="80px" className="object-contain object-left" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] uppercase tracking-[0.2em] text-[#FF0080] mb-1"
            style={{ fontFamily: "Mirloanne, serif" }}
          >
            {stripAccents(partner.location)}
          </p>
          <p
            className="text-gray-900 text-xl font-light leading-snug"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {partner.name}
          </p>
          <p
            className="text-gray-600 text-base font-light leading-snug"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {partner.tagline}
          </p>
        </div>

        {/* Decoratif : la nature de lien est deja portee par la balise. */}
        <span
          className="shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-900 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
          aria-hidden="true"
        >
          →
        </span>
      </a>
    </motion.article>
  );
}
