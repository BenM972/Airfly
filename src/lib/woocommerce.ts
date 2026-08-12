// Acces WooCommerce cote serveur, pour les Server Components.
// Les routes /api/products et /api/categories restent en place : elles servent
// encore le back office et le rafraichissement cote client.

export type WCVariation = {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  stock_quantity: number | null;
  image: { src: string; alt: string } | null;
  attributes: { name: string; option: string }[];
};

export type WCProduct = {
  id: number;
  name: string;
  slug: string;
  type: "simple" | "variable";
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
  stock_quantity: number | null;
  short_description: string;
  description: string;
  categories: { id: number; name: string; slug: string }[];
  images: { src: string; alt: string }[];
  attributes: { id: number; name: string; variation: boolean; options: string[] }[];
};

export type WCCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
};

const REVALIDATE = 300; // 5 min : le catalogue bouge peu, la SERP veut du stable

function wcUrl(path: string, extra: Record<string, string> = {}): string | null {
  const base = process.env.WC_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  if (!base || !key || !secret) return null;

  const params = new URLSearchParams({ consumer_key: key, consumer_secret: secret, ...extra });
  return `${base}/wp-json/wc/v3/${path}?${params}`;
}

async function wcGet<T>(path: string, extra: Record<string, string> = {}, fallback: T): Promise<T> {
  const url = wcUrl(path, extra);
  if (!url) {
    console.error("[woocommerce] variables d'environnement manquantes");
    return fallback;
  }
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (!res.ok) {
      console.error(`[woocommerce] ${path} -> HTTP ${res.status}`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[woocommerce] ${path} injoignable:`, err);
    return fallback;
  }
}

export function getProducts(perPage = 100): Promise<WCProduct[]> {
  return wcGet<WCProduct[]>("products", { per_page: String(perPage), status: "publish" }, []);
}

export function getCategories(): Promise<WCCategory[]> {
  return wcGet<WCCategory[]>("products/categories", { per_page: "100" }, []);
}

/**
 * La grille du catalogue n'affiche ni description courte ni description longue,
 * mais WooCommerce les renvoie en HTML volumineux. Les retirer avant de passer
 * les produits au composant client allege d'autant le payload envoye au navigateur.
 */
export function stripDescriptions(products: WCProduct[]): WCProduct[] {
  return products.map((p) => ({ ...p, description: "", short_description: "" }));
}

/** Un seul produit, au lieu des 100 que chargeait la page avant. */
export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const rows = await wcGet<WCProduct[]>("products", { slug, status: "publish" }, []);
  return rows[0] ?? null;
}

export function getVariations(productId: number): Promise<WCVariation[]> {
  return wcGet<WCVariation[]>(`products/${productId}/variations`, { per_page: "100" }, []);
}

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  eacute: "é",
  egrave: "è",
  agrave: "à",
  ccedil: "ç",
  deg: "°",
  euro: "€",
};

/** WooCommerce renvoie du HTML : on en tire un texte propre pour les meta. */
export function toPlainText(html: string, maxLength = 160): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED_ENTITIES[name.toLowerCase()] ?? match)
    // &amp; en dernier, sinon "&amp;lt;" se decoderait deux fois en "<"
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  // Coupe sur le dernier espace pour ne pas tronquer un mot
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}
