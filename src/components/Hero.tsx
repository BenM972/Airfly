"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import HeroPanel from "./HeroPanel";
import HeroTicker from "./HeroTicker";

const panels = [
  { id: "ecole", label: "Ecole de glisse", image: "/hero_ecole.jpg", cta: "Reserver un cours", href: "/ecole" },
  { id: "textile", label: "Textile", image: "/hero_textile.jpg", cta: "Voir les collections", href: "/shop?cat=textile" },
  { id: "materiel", label: "Materiel", image: "/hero_materiel.jpg", cta: "Voir le matos technique", href: "/shop?cat=materiel" },
];

/**
 * Rotation automatique des panneaux : retiree le 8 septembre 2026.
 *
 * Un `setInterval` de 5 s faisait tourner le panneau ouvert. HeroPanel anime
 * la propriete `flex` (0,5 <-> 3), qui est une propriete de MISE EN PAGE : le
 * navigateur recalcule la disposition a chaque image de l'animation, et chaque
 * recalcul compte comme un decalage. Mesure du 8 septembre dans Chrome, page
 * d'accueil : 120 decalages, dont 107 apres la cinquieme seconde, le dernier a
 * 16 849 ms. CLS de 0,467 par fenetre de session, contre 0,1 pour le seuil
 * "bon" de Google et 0,25 au-dela duquel la page est classee mauvaise.
 * `/shop` et les fiches produit, sans accordeon, mesurent 0,002.
 *
 * Effet de bord : chaque ouverture repeignait un nouvel element le plus grand,
 * et Chrome reaffecte le LCP tant qu'aucune interaction n'a eu lieu. Le LCP
 * derivait donc de 2,6 a 16,3 s selon le moment de la mesure.
 *
 * L'accordeon reste pilote par le survol : le mouvement repond desormais a une
 * intention de l'utilisateur au lieu de se declencher seul. Les decalages
 * eventuels sont alors rares, volontaires, et absents sur mobile ou cette
 * disposition n'existe pas (les panneaux y sont empiles).
 *
 * Pour retablir la rotation il faudrait d'abord rendre l'animation neutre pour
 * la mise en page : panneaux en position absolue animes par `transform`, seul
 * moyen documente de bouger un element sans generer de decalage. Rebrancher le
 * minuteur sur l'animation `flex` actuelle ramenerait le CLS a 0,467.
 */
export default function Hero() {
  const [hovered, setHovered] = useState<string | null>(null);

  // Au repos, le premier panneau est ouvert : c'est l'etat rendu par le
  // serveur, donc aucun decalage au chargement.
  const activePanel = hovered ?? panels[0].id;

  const handleMouseEnter = (id: string) => setHovered(id);
  const handleMouseLeave = () => setHovered(null);

  return (
    <section className="relative w-full h-screen min-h-[500px]">
      {/* Le hero est un montage plein ecran sans titre visible : ce h1 donne a la
          page son titre pour les moteurs et les lecteurs d'ecran, qui n'en avaient aucun. */}
      <h1 className="sr-only">
        Airfly — école de kitesurf, wingfoil et kitefoil, et surf shop à Pointe Faula, Le Vauclin (Martinique)
      </h1>

      {/* Panels desktop — côte à côte */}
      <div className="hidden md:flex w-full h-full">
        {panels.map((panel, i) => (
          <HeroPanel
            key={panel.id}
            label={panel.label}
            image={panel.image}
            cta={panel.cta}
            href={panel.href}
            isHovered={activePanel === panel.id}
            isAnyHovered={true}
            priority={i === 0}
            onMouseEnter={() => handleMouseEnter(panel.id)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>

      <HeroTicker />

      {/* Panels mobile — empilés verticalement.
          `divide-y` trace un filet d'un pixel entre les panneaux, jamais avant
          le premier ni apres le dernier : les trois photos se touchent sinon,
          et la limite entre elles se devine mal. Le conteneur etant deja
          md:hidden, le filet ne concerne que le mobile. */}
      <div className="flex flex-col md:hidden w-full h-full divide-y divide-white/25">
        {panels.map((panel, i) => (
          // Seul le premier panneau est prioritaire : marquer les trois les
          // faisait se disputer la bande passante, sans qu'aucun ne le soit.
          <MobilePanelItem key={panel.id} panel={panel} priority={i === 0} />
        ))}
      </div>
    </section>
  );
}

function MobilePanelItem({
  panel,
  priority,
}: {
  panel: { id: string; label: string; image: string; cta: string; href: string };
  priority: boolean;
}) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <Image
        src={panel.image}
        alt={panel.label}
        fill
        sizes="100vw"
        className="object-cover"
        priority={priority}
        loading={priority ? undefined : "lazy"}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <motion.span
          className="text-white uppercase font-light text-center"
          style={{ fontFamily: "Mirloanne, serif", fontSize: "clamp(1.4rem, 5vw, 2rem)", letterSpacing: "0.2em" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {panel.label}
        </motion.span>
        <Link
          href={panel.href}
          className="border border-white text-white uppercase tracking-widest text-xs px-8 py-3 hover:bg-white hover:text-black transition-colors duration-300 text-center"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {panel.cta}
        </Link>
      </div>
    </div>
  );
}
