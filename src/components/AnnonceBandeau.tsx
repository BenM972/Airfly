"use client";

import Link from "next/link";
import { annonce } from "@/data/annonce";

/**
 * Bandeau d'annonce defilant, en haut de toutes les pages.
 *
 * Le defilement est purement decoratif : le texte complet est present une
 * premiere fois dans le DOM et lu normalement par les lecteurs d'ecran, les
 * repetitions suivantes sont masquees par aria-hidden. Un visiteur qui a
 * demande la reduction des animations voit le texte fixe, sans defilement.
 */
export default function AnnonceBandeau() {
  if (!annonce) return null;

  const contenu = (
    <>
      <span className="font-medium">{annonce.titre}</span>
      <span className="mx-3 text-white/40" aria-hidden="true">◆</span>
      <span className="text-white/80">{annonce.detail}</span>
    </>
  );

  const bandeau = (
    <div className="relative flex items-center overflow-hidden bg-gray-900 text-white text-xs uppercase tracking-widest h-[var(--h-annonce)]">
      {/* Premiere copie : la seule lue par les technologies d'assistance */}
      <div className="flex shrink-0 items-center whitespace-nowrap animate-[defilement_38s_linear_infinite] motion-reduce:animate-none motion-reduce:justify-center motion-reduce:w-full">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex items-center px-8 motion-reduce:hidden motion-reduce:first:flex" aria-hidden={i > 0}>
            {contenu}
          </span>
        ))}
      </div>
      {/* Seconde copie, purement visuelle : elle prend le relais pour que la
          boucle soit continue, sans saut au moment du rebouclage. */}
      <div
        className="flex shrink-0 items-center whitespace-nowrap animate-[defilement_38s_linear_infinite] motion-reduce:hidden"
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex items-center px-8">{contenu}</span>
        ))}
      </div>
    </div>
  );

  if (!annonce.href) return <div className="fixed inset-x-0 top-0 z-[60]">{bandeau}</div>;

  return (
    <Link
      href={annonce.href}
      className="fixed inset-x-0 top-0 z-[60] block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF0080]"
      aria-label={`${annonce.titre} — ${annonce.detail}`}
    >
      {bandeau}
    </Link>
  );
}
