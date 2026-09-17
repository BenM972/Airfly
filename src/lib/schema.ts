// Generateurs JSON-LD. Les valeurs viennent de Footer.tsx et EcoleTarifs.tsx :
// une seule source de verite, ici, pour ce qui est declare aux moteurs.

import type { WCProduct, WCVariation } from "./woocommerce";
import { toPlainText } from "./woocommerce";
import { getFermeture } from "@/data/fermeture";
import { questionsFrequentes } from "@/data/faq";
import { videoEcole } from "@/data/video";
import { FICHE, LAT, LON } from "@/data/lieu";
import { offresPourSchema } from "@/data/tarifs";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

const BUSINESS_ID = `${SITE_URL}/#business`;

export function localBusinessSchema() {
  const fermeture = getFermeture();
  return {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "SportingGoodsStore"],
    "@id": BUSINESS_ID,
    name: "Airfly",
    description:
      "École de glisse et surf shop à Pointe Faula, Le Vauclin (Martinique). Cours de kitesurf, wingfoil et kitefoil avec moniteurs diplômés FFVL/FFV, matériel et textile en boutique.",
    url: SITE_URL,
    telephone: "+596596762531",
    email: "info@airfly972.com",
    image: `${SITE_URL}/hero_ecole.jpg`,
    logo: `${SITE_URL}/logo-airfly.webp`,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plage de Pointe Faula",
      addressLocality: "Le Vauclin",
      postalCode: "97280",
      addressRegion: "Martinique",
      addressCountry: "MQ",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: LAT,
      longitude: LON,
    },
    // `hasMap` designe la fiche d'etablissement, pas un itineraire : c'est ce
    // lien qui rattache le site a la fiche Google Business Profile. L'itineraire
    // reste offert au visiteur dans l'interface.
    hasMap: FICHE,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Wednesday", "Sunday"],
        opens: "09:00",
        closes: "13:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "12:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday", "Friday", "Saturday"],
        opens: "13:45",
        closes: "18:00",
      },
    ],
    // Fermeture temporaire. Sans cette declaration, les horaires ci-dessus
    // restent seuls et Google continue d'afficher "Ouvert" pendant les
    // vacances. `opens` egal a `closes` est la maniere documentee de dire
    // "ferme toute la journee" sur la periode.
    ...(fermeture
      ? {
          specialOpeningHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            opens: "00:00",
            closes: "00:00",
            validFrom: new Date().toISOString().slice(0, 10),
            validThrough: fermeture.jusquAu,
          },
        }
      : {}),
    // Tous les profils tenus par l'ecole, pour rattacher l'entite "Airfly" a
    // une identite unique. C'est ce qui permet de distinguer cette ecole de
    // l'Airfly normand et de l'adaptateur Bluetooth du meme nom, qui occupent
    // seuls le graphe aujourd'hui.
    sameAs: [
      "https://www.instagram.com/airfly972",
      "https://www.facebook.com/airfly972",
      "https://www.youtube.com/@airfly323",
      FICHE,
    ],
    sport: ["Kitesurfing", "Wing foiling", "Kitefoiling"],
    knowsAbout: [
      "Kitesurf",
      "Wingfoil",
      "Kitefoil",
      "Spot de Pointe Faula",
      "Le Vauclin",
      "Martinique",
    ],
  };
}

/** Prix affiche : celui de la variation en promo, sinon le prix courant. */
function priceOf(product: WCProduct, variations: WCVariation[]): string | null {
  const raw =
    variations.find((v) => v.price)?.price ||
    product.price ||
    product.regular_price ||
    "";
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) && value > 0 ? value.toFixed(2) : null;
}

export function productSchema(product: WCProduct, variations: WCVariation[]) {
  const price = priceOf(product, variations);
  const inStock =
    variations.length > 0
      ? variations.some((v) => v.stock_status === "instock")
      : product.stock_status === "instock";

  const description =
    toPlainText(product.short_description || product.description, 300) ||
    `${toPlainText(product.name, 90)} — disponible chez Airfly, Pointe Faula, Le Vauclin (Martinique).`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: toPlainText(product.name, 120),
    description,
    url: `${SITE_URL}/shop/${product.slug}`,
    image: product.images?.map((i) => i.src).slice(0, 6) ?? [],
    category: product.categories?.[product.categories.length - 1]?.name,
    // La marque vient du champ `brands` de WooCommerce, present dans la reponse
    // de l'API et deja serialise dans la page. L'audit d'aout concluait qu'elle
    // n'etait pas exposee ; c'etait faux, elle l'etait mais n'etait pas lue.
    // Elle reste facultative : aucune marque n'est deduite d'un nom de produit,
    // ce qui produirait de fausses declarations. `brand` conditionne
    // l'eligibilite aux Merchant listings de Google.
    ...(product.brands?.[0]?.name
      ? { brand: { "@type": "Brand", name: product.brands[0].name } }
      : {}),
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "EUR",
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `${SITE_URL}/shop/${product.slug}`,
          // Retrait en boutique uniquement, sans prepaiement
          availableDeliveryMethod: "https://schema.org/OnSitePickup",
          seller: { "@id": BUSINESS_ID },
        }
      : undefined,
  };
}

/**
 * Les prestations de l'ecole.
 *
 * Les tarifs ne sont plus recopies ici : ils viennent de `@/data/tarifs`, que
 * EcoleTarifs.tsx affiche. Les deux listes avaient diverge — six offres
 * declarees pour treize affichees. Une seule source supprime la classe de bug.
 */
export function schoolServiceSchema() {
  const lessons = offresPourSchema();

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Cours de kitesurf, wingfoil et kitefoil",
    name: "École de glisse Airfly",
    description:
      "Cours de kitesurf, wingfoil et kitefoil à Pointe Faula, Le Vauclin (Martinique). Moniteurs diplômés FFVL/FFV, 3 élèves maximum par session, bateau de sécurité et matériel fourni.",
    url: `${SITE_URL}/ecole`,
    provider: { "@id": BUSINESS_ID },
    areaServed: { "@type": "Place", name: "Martinique" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cours et prestations",
      itemListElement: lessons.map((l) => ({
        "@type": "Offer",
        price: l.price,
        priceCurrency: "EUR",
        itemOffered: { "@type": "Service", name: l.name, description: l.description },
      })),
    },
  };
}

/**
 * Questions frequentes de /ecole.
 *
 * Meme source que la section affichee : le balisage doit decrire ce que le
 * visiteur voit, sinon Google le traite comme trompeur. Aucune reponse n'est
 * balisee sans etre lisible sur la page.
 */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/ecole#questions`,
    isPartOf: { "@id": BUSINESS_ID },
    mainEntity: questionsFrequentes.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.reponse },
    })),
  };
}

/**
 * Video de presentation de /ecole.
 *
 * `uploadDate` est la vraie date de publication YouTube. La legende affichee ne
 * la mentionne pas, mais le balisage ne doit pas la maquiller : Google la
 * recoupe avec la page de la video.
 */
export function videoSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: videoEcole.titre,
    description: videoEcole.description,
    thumbnailUrl: `${SITE_URL}${videoEcole.miniature}`,
    uploadDate: videoEcole.publieeLe,
    duration: videoEcole.duree,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoEcole.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${videoEcole.id}`,
    publisher: { "@id": BUSINESS_ID },
    isPartOf: { "@id": BUSINESS_ID },
  };
}

/** Page catalogue : liste ordonnee des fiches, pour aider a la decouverte. */
export function shopCollectionSchema(products: { name: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Surf shop Airfly",
    description:
      "Matériel de kitesurf et wingfoil, textile de glisse et soins solaires, à retirer en boutique à Pointe Faula, Le Vauclin (Martinique).",
    url: `${SITE_URL}/shop`,
    isPartOf: { "@id": BUSINESS_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: toPlainText(p.name, 120),
        url: `${SITE_URL}/shop/${p.slug}`,
      })),
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
