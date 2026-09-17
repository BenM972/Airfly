/**
 * Le lieu, et sa fiche Google — source unique.
 *
 * L'URL d'itineraire par coordonnees etait ecrite en dur dans six endroits
 * (Navbar deux fois, Footer deux fois, SpotSection, schema.ts). Elle vit ici.
 *
 * Pourquoi deux URL distinctes, et pas une. L'audit local du 17 septembre 2026
 * a relevé que `hasMap` pointait vers des coordonnees brutes, sans aucun
 * `cid=` ni `place_id=` : rien ne rattachait le site a la fiche Google
 * Business Profile. Or les deux liens ne servent pas la meme chose.
 *
 * - `ITINERAIRE` ouvre un guidage vers le point GPS. C'est le bon lien pour un
 *   visiteur : la plage de Pointe Faula n'a pas d'adresse de rue utile, et une
 *   epingle d'etablissement ferait arriver sur le parking et non sur la zone.
 * - `FICHE` designe l'etablissement dans le graphe de Google. C'est celui que
 *   `hasMap` et `sameAs` doivent porter, parce qu'il identifie l'entite.
 *
 * Le `cid` est l'identifiant de la fiche, lu dans l'URL Maps de
 * l'etablissement (`!1s0x8c6a9ded5f1c5a77:0xb8077f1ab950d019`, dont la seconde
 * moitie convertie en decimal donne le cid). Il est stable, contrairement aux
 * URL `/maps/place/...` qui transportent des parametres de session.
 */
export const LAT = 14.541922560749377;
export const LON = -60.82981741961289;

/** Guidage vers la zone ecole. Destination en coordonnees, volontairement. */
export const ITINERAIRE = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LON}`;

/** La fiche d'etablissement elle-meme : c'est l'identite, pas un itineraire. */
export const FICHE = "https://maps.google.com/?cid=13260707380570673177";

/**
 * Les avis de la fiche. Le suffixe `!9m1!1b1` ouvre directement l'onglet.
 *
 * Le lien de depot d'avis en un clic (`g.page/r/<code>/review`) n'est pas ici :
 * il se recupere dans le tableau de bord Google Business Profile et ne se
 * deduit pas du cid.
 */
export const AVIS =
  "https://www.google.com/maps/place/Airfly/data=!4m6!3m5!1s0x8c6a9ded5f1c5a77:0xb8077f1ab950d019!9m1!1b1";
