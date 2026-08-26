"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Amene la page sur l'ancre demandee par l'URL.
 *
 * Next ne le fait pas de maniere fiable dans trois situations, toutes
 * rencontrees sur ce site :
 *
 *   - ouverture directe d'une adresse contenant un `#`, ou le navigateur fixe
 *     sa position avant que la page ne soit montee ;
 *   - clic sur un lien `/#ancre` depuis une AUTRE page : la navigation mene
 *     bien a l'accueil, mais en haut, sans tenir compte du `#` ;
 *   - clic sur un lien `/#ancre` depuis la page qui porte deja cette ancre,
 *     ou le routeur considere qu'il n'y a pas de changement de route.
 *
 * On refait donc le travail apres montage. Les tentatives espacees couvrent le
 * cas ou le contenu au-dessus de la cible s'allonge en se chargeant — images
 * du haut de page notamment — ce qui deplacerait une cible visee trop tot.
 *
 * `scroll-margin-top` est declare dans globals.css sur `section[id]` : il
 * degage la hauteur du bandeau et de la barre de navigation, toutes deux
 * fixes. Sans lui, la cible atterrit derriere elles.
 */
export default function DefilementVersAncre() {
  const pathname = usePathname();

  useEffect(() => {
    const viser = () => {
      const ancre = window.location.hash.slice(1);
      if (!ancre) return;
      const cible = document.getElementById(decodeURIComponent(ancre));
      // "instant" et non le defilement doux de la feuille de style : au
      // chargement, animer plusieurs milliers de pixels donne l'impression que
      // la page part toute seule. Le doux reste pour les clics dans le menu.
      cible?.scrollIntoView({ block: "start", behavior: "instant" });
    };

    // Trois passages : tout de suite, puis apres le rendu, puis une fois le
    // contenu retombe. Viser une seule fois suffit rarement au chargement.
    viser();
    const t1 = setTimeout(viser, 120);
    const t2 = setTimeout(viser, 600);

    window.addEventListener("hashchange", viser);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("hashchange", viser);
    };
  }, [pathname]);

  return null;
}
