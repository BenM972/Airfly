"use client";

import { useState } from "react";

type Props = {
  /** URL d'integration fournie par le partenaire (Lodgify, etc.). */
  url: string;
  /** Nom du partenaire, pour le libelle accessible de l'iframe. */
  nom: string;
};

/**
 * Calendrier de disponibilites charge UNIQUEMENT au clic.
 *
 * Ce n'est pas une optimisation de confort : un widget de reservation tiers
 * depose des cookies des son chargement. Tant que le visiteur ne clique pas,
 * rien n'est charge, aucun cookie n'est pose, et l'accueil ne paie aucun coup
 * de performance — ce qui compte sur une page dont le LCP vient d'etre travaille.
 */
export default function PartnerCalendar({ url, nom }: Props) {
  const [charge, setCharge] = useState(false);

  if (charge) {
    return (
      <div className="mt-8 border border-gray-200 bg-white">
        <iframe
          src={url}
          title={`Calendrier des disponibilites — ${nom}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-[420px] md:h-[520px] border-0"
        />
        <p
          className="px-4 py-2 text-[11px] text-gray-400 border-t border-gray-100"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Disponibilités fournies par {nom}. La réservation se fait sur leur site.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-gray-200 bg-white/60 px-6 py-7 text-center">
      <svg
        className="mx-auto mb-3 text-gray-400"
        width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>

      <p className="text-gray-900 text-lg mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
        Voir les disponibilités en direct
      </p>
      <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "var(--font-cormorant)" }}>
        Le calendrier est fourni par {nom} et ne se charge qu&apos;à votre demande, pour ne rien déposer sur votre navigateur sans raison.
      </p>

      {/* min-h-[44px] : cible tactile minimale. focus-visible conserve pour la navigation clavier. */}
      <button
        type="button"
        onClick={() => setCharge(true)}
        className="inline-flex items-center justify-center min-h-[44px] border border-gray-900 text-gray-900 uppercase tracking-widest text-xs px-8 py-3 cursor-pointer transition-colors duration-300 hover:bg-gray-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0080] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f0e8]"
        style={{ fontFamily: "Mirloanne, serif" }}
      >
        Afficher le calendrier
      </button>
    </div>
  );
}
