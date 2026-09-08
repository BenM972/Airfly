// Redirections des URLs des anciens sites airfly972.com.
//
// Le domaine a porte quatre generations de site avant celui-ci :
//
//   2005-2012  site ASP.NET et pages .html, avec des cadres (/top.htm, /bottom.htm)
//   2018-2021  WordPress + WooCommerce, slugs descriptifs et /product/...
//   2023-2026  Squarespace
//   2026-      ce site, en Next.js
//
// Inventaire etabli le 8 septembre 2026 a partir de deux sources : la capture
// locale de la page d'accueil Squarespace du 12 aout 2026, qui donne la
// navigation du site tel qu'il etait a la bascule, et l'index CDX de la Wayback
// Machine pour les generations anterieures. 82 chemins testes contre la
// production : 76 repondaient 404.
//
// Toutes les cibles ont ete choisies pour leur PROXIMITE DE SUJET, pas par
// commodite. Une redirection vers une page sans rapport est traitee par Google
// comme une soft 404 : elle ne transmet rien et brouille l'index. Les URLs sans
// equivalent honnete restent donc en 404, volontairement — la liste figure en
// bas de ce fichier.

/** Ancien chemin -> nouveau, avec la generation d'origine pour memoire. */
const carte = [
  // ── Squarespace, en ligne jusqu'a la bascule de 2026 ────────────────────
  // La generation la plus recente, donc celle dont les liens entrants et la
  // presence dans l'index sont les plus susceptibles d'etre encore vivants.
  ["/accueil", "/"],
  ["/cart", "/shop"],                                 // le panier est un tiroir, plus une page
  ["/cgu", "/mentions-legales"],                      // pas de CGU sur le site actuel
  ["/contact", "/ecole#reservation"],                 // pas de page contact ; le formulaire est la
  ["/cookies", "/politique-de-confidentialite"],
  ["/mto", "/#meteo"],
  ["/pointe-faula", "/#spot"],
  ["/hebergement", "/#hebergement"],
  ["/shop-magasin-kitesurf-martinique", "/shop"],

  // ── WordPress, 2018-2021 ────────────────────────────────────────────────
  // Slugs descriptifs et anciens : le profil type de l'URL citee par un
  // annuaire nautique ou un blog de voyage, dont le lien survit des annees.
  ["/ecole-de-kitesurf-martinique", "/ecole"],
  ["/tarifs-ecole-kitesurf-martinique", "/ecole"],
  ["/foil-kitesurf-martinique", "/ecole"],
  ["/meteo-kitesurf-martinique", "/#meteo"],
  ["/contact-ecole-de-kitesurf-martinique", "/ecole#reservation"],
  ["/e-shop", "/shop"],
  ["/product-category/shop", "/shop"],
  ["/page/SurfShop", "/shop"],
  ["/page/meteo", "/#meteo"],
  ["/page/evenement", "/"],
  ["/hello-world", "/"],                              // article par defaut de WordPress
  // Flux RSS du WordPress, releve dans l'index Common Crawl de 2021 et absent
  // de la Wayback Machine — d'ou l'interet d'avoir croise les deux sources.
  // Le site actuel n'a pas de flux ; les annuaires de blogs qui pointaient
  // dessus arrivent au moins sur une page vivante.
  ["/feed", "/"],

  // ── Pages anglaises du WordPress, 2019 ──────────────────────────────────
  // Le site actuel n'a pas de version anglaise. Rediriger vers l'equivalent
  // francais vaut mieux qu'une 404 : le visiteur arrive sur le bon sujet,
  // meme si la langue change. A revoir le jour ou une version anglaise existe.
  ["/en-welcome-kitesurf-school-martinique", "/"],
  ["/en-school-kitesurf-martinique", "/ecole"],
  ["/en-prices-school-kitesurf-martinique", "/ecole"],
  ["/en-foil-kitesurf-martinique", "/ecole"],
  ["/en-shop-school-kitesurf-martinique", "/shop"],
  ["/en-contact-school-kitesurf-martinique", "/ecole#reservation"],
  ["/en-weather-forecast-wind-report-kitesurf-martinique", "/#meteo"],

  // ── Site ASP.NET et pages .html, 2005-2012 ──────────────────────────────
  // Vingt ans pour les plus anciennes. Leur valeur residuelle est faible, mais
  // une redirection ne coute rien la ou l'equivalent est evident.
  ["/index.html", "/"],
  ["/index.aspx", "/"],
  ["/accueil.html", "/"],
  ["/shop.html", "/shop"],
  ["/shop/home.aspx", "/shop"],
  ["/shop/catalogue.aspx", "/shop"],
  ["/shop/beachwear.aspx", "/shop"],
  ["/shop/occase.aspx", "/shop"],
  ["/lifestyle.html", "/shop"],
  ["/tarifs.html", "/ecole"],
  ["/kite.html", "/ecole"],
  ["/spot.html", "/#spot"],
  ["/vauclin_kite.html", "/#spot"],
  ["/shop/meteo.aspx", "/#meteo"],
  ["/mentions.html", "/mentions-legales"],
  ["/contact.html", "/ecole#reservation"],
];

/**
 * Redirections « location ».
 *
 * Cinq anciennes URLs, reparties sur trois generations de site, parlent de
 * location de materiel : /shop/location.aspx (2007), /location.html (2012),
 * /location-kitesurf-martinique et /en-rental-kitesurf-martinique (2019),
 * /page/location-materiel (2018). Airfly a donc propose de la location pendant
 * des annees, et « location kitesurf Martinique » reste une requete ou ces URLs
 * ont pu accumuler des liens.
 *
 * Le site actuel ne dit nulle part s'il en propose encore — ni dans un sens ni
 * dans l'autre, verifie page par page. La cible ci-dessous est donc un choix
 * PAR DEFAUT, a confirmer :
 *
 *   - si la location existe toujours, ces cinq URLs meritent une vraie page,
 *     et elles y pointeront ;
 *   - si elle a cesse, /shop est le plus proche : le visiteur cherche du
 *     materiel, la boutique en vend.
 */
const CIBLE_LOCATION = "/shop";

const location = [
  ["/location-kitesurf-martinique", CIBLE_LOCATION],
  ["/en-rental-kitesurf-martinique", CIBLE_LOCATION],
  ["/page/location-materiel", CIBLE_LOCATION],
  ["/location.html", CIBLE_LOCATION],
  ["/shop/location.aspx", CIBLE_LOCATION],
];

/**
 * Motifs : les URLs generees en nombre par WooCommerce, qu'on ne peut pas
 * lister une par une. Seize fiches produit sont connues par l'archive, mais
 * rien ne dit que l'archive les a toutes vues.
 *
 * Toutes vont vers /shop plutot que vers l'accueil : ces produits (Rip Curl,
 * Salty Crew, Seventy One Percent) ne sont plus au catalogue, et la boutique
 * est le plus proche parent d'une fiche produit disparue.
 */
const motifs = [
  { source: "/product/:slug", destination: "/shop" },
  { source: "/product-category/:path*", destination: "/shop" },
  { source: "/e-shop/page/:n", destination: "/shop" },
  // Pas de regle pour les anciens permaliens WordPress par identifiant
  // (/?p=436) : la source et la destination seraient toutes deux "/", et Next
  // reporte les parametres non consommes sur la destination — la redirection
  // se declencherait donc en boucle sur elle-meme. L'archive montre par
  // ailleurs que ces URLs repondaient deja 301 en 2021, du temps du WordPress.
];

/**
 * Volontairement laissees en 404, faute d'equivalent honnete :
 *
 *   /top.htm, /bottom.htm, /shop/pop_promo.htm   fragments de cadres HTML
 *   /shop/popArt.aspx, /shop/lucie2.aspx,        pages disparues sans sujet
 *   /shop/lucie3.aspx, /shop/team.aspx,          repris ailleurs
 *   /shop/team2.aspx, /shop/croisieres.aspx
 *   /account/, /api/ui-extensions/               interne Squarespace
 *
 * Une 404 sur une page reellement disparue est la bonne reponse. La rediriger
 * vers l'accueil produirait une soft 404, que Google desindexe de toute facon,
 * en ayant au passage brouille le signal.
 */

export function redirectionsAnciennesUrls() {
  return [...carte, ...location]
    .map(([source, destination]) => ({ source, destination, permanent: true }))
    .concat(motifs.map((m) => ({ ...m, permanent: true })));
}

/** Expose pour les tests : permet de verifier qu'aucune cible n'est elle-meme morte. */
export const cibles = [...new Set([...carte, ...location].map(([, d]) => d))];
