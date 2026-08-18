// Generateurs JSON-LD. Les valeurs viennent de Footer.tsx et EcoleTarifs.tsx :
// une seule source de verite, ici, pour ce qui est declare aux moteurs.

import type { WCProduct, WCVariation } from "./woocommerce";
import { toPlainText } from "./woocommerce";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

const BUSINESS_ID = `${SITE_URL}/#business`;

export function localBusinessSchema() {
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
      latitude: 14.541922560749377,
      longitude: -60.82981741961289,
    },
    hasMap:
      "https://www.google.com/maps/dir/?api=1&destination=14.541922560749377,-60.82981741961289",
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
    sameAs: ["https://www.instagram.com/airfly972", "https://www.facebook.com/airfly972"],
    sport: ["Kitesurfing", "Wing foiling", "Kitefoiling"],
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
    // Pas de champ "brand" : WooCommerce n'expose pas la marque ici, et un
    // brand inference a partir du nom produirait de fausses declarations.
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
 * Les prestations de l'ecole. Tarifs repris de EcoleTarifs.tsx : toute
 * evolution des prix doit etre repercutee ici, sinon Google affichera
 * une offre perimee.
 */
export function schoolServiceSchema() {
  const lessons = [
    { name: "Cours de kitesurf collectif", description: "3 h, 3 élèves maximum", price: "115" },
    { name: "Cours de kitesurf solo", description: "2 h, encadrement exclusif", price: "200" },
    { name: "Cours de kitefoil solo", description: "2 h, encadrement exclusif", price: "150" },
    { name: "Cours de kitefoil duo", description: "2 h, 2 élèves", price: "135" },
    { name: "Initiation wingfoil", description: "1 h 30, paddle avec une aile de wing, tous niveaux", price: "90" },
    { name: "Départ de plage", description: "Technique de lancement autonome", price: "85" },
  ];

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
