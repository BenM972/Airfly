import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

/**
 * Ni `changeFrequency` ni `priority` : Google a annonce en 2015 ne pas s'en
 * servir, et l'audit du 8 septembre 2026 les trouvait poses sur les 59 URL sans
 * effet. Les retirer ne coute rien et allege le fichier.
 *
 * `lastModified` a en revanche un effet reel — a condition de dire la verite.
 * Les 59 URL portaient auparavant `new Date()`, c'est-a-dire l'heure du build :
 * deux horodatages distincts pour 59 pages, dont aucun ne correspondait a une
 * modification. Google devalue ce signal quand il le detecte, et un site qui
 * annonce 59 pages modifiees a chaque deploiement le lui apprend vite.
 *
 * Les fiches produit portent donc la date de modification que WooCommerce
 * connait. Les pages statiques n'en portent aucune : leur contenu change avec
 * le code, et aucune date fiable n'existe cote donnees. Une absence vaut mieux
 * qu'une date inventee — c'est precisement ce que Google reproche.
 */

type Produit = { slug: string; date_modified_gmt?: string };

async function fetchProducts(): Promise<Produit[]> {
  const url = process.env.WC_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (!url || !key || !secret) return [];

  try {
    const params = new URLSearchParams({
      consumer_key: key,
      consumer_secret: secret,
      per_page: "100",
      status: "publish",
      _fields: "slug,date_modified_gmt",
    });

    const res = await fetch(`${url}/wp-json/wc/v3/products?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    return (await res.json()) as Produit[];
  } catch {
    return [];
  }
}

/** WooCommerce renvoie du GMT sans suffixe de fuseau : "2026-07-14T09:12:33". */
function dateModifiee(produit: Produit): Date | undefined {
  if (!produit.date_modified_gmt) return undefined;
  const d = new Date(`${produit.date_modified_gmt}Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produits = await fetchProducts();

  const productPages: MetadataRoute.Sitemap = produits.map((p) => ({
    url: `${BASE_URL}/shop/${p.slug}`,
    lastModified: dateModifiee(p),
  }));

  // La page catalogue change quand un produit change : la plus recente des
  // dates produit est donc une date de modification honnete pour elle.
  const dates = produits.map(dateModifiee).filter((d): d is Date => d !== undefined);
  const dernierProduit = dates.length
    ? new Date(Math.max(...dates.map((d) => d.getTime())))
    : undefined;

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL },
    { url: `${BASE_URL}/shop`, lastModified: dernierProduit },
    { url: `${BASE_URL}/ecole` },
  ];

  return [...staticPages, ...productPages];
}
