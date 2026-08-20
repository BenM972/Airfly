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
  /** Rendu HTML du prix par WooCommerce. Seule source du prix initial d'un produit variable en promo. */
  price_html?: string;
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

/** Levee quand WooCommerce n'a pas repondu, par opposition a une reponse vide. */
export class WooCommerceIndisponible extends Error {
  constructor(path: string, cause: string) {
    super(`[woocommerce] ${path} : ${cause}`);
    this.name = "WooCommerceIndisponible";
  }
}

const TENTATIVES = 3;
const ATTENTE_MS = 400;

/**
 * Appel WooCommerce qui LEVE en cas d'echec, au lieu de renvoyer un repli.
 *
 * La distinction est le coeur du probleme que ce module a connu : une reponse
 * vide veut dire "ce produit n'existe pas", une absence de reponse veut dire
 * "je ne sais pas". Les confondre a fait prerendre six fiches produit en 404
 * lors d'un build ou WooCommerce avait bafouille ; ces 404 sont ensuite restees
 * figees dans la sortie statique alors que les produits existaient toujours.
 *
 * Les echecs transitoires (reseau, 429, 5xx) sont retentes : un hoquet isole ne
 * doit pas faire echouer un build, mais une panne reelle doit se voir.
 */
async function wcFetch<T>(path: string, extra: Record<string, string> = {}): Promise<T> {
  const url = wcUrl(path, extra);
  if (!url) throw new WooCommerceIndisponible(path, "variables d'environnement manquantes");

  let dernier = "";
  for (let essai = 1; essai <= TENTATIVES; essai++) {
    try {
      const res = await fetch(url, { next: { revalidate: REVALIDATE } });
      // 4xx hors 429 : la requete est fautive, la reessayer ne changera rien.
      if (!res.ok && res.status !== 429 && res.status < 500) {
        throw new WooCommerceIndisponible(path, `HTTP ${res.status}`);
      }
      if (!res.ok) {
        dernier = `HTTP ${res.status}`;
      } else {
        return (await res.json()) as T;
      }
    } catch (err) {
      if (err instanceof WooCommerceIndisponible) throw err;
      dernier = err instanceof Error ? err.message : String(err);
    }
    if (essai < TENTATIVES) await new Promise((r) => setTimeout(r, ATTENTE_MS * essai));
  }
  throw new WooCommerceIndisponible(path, `${dernier} apres ${TENTATIVES} tentatives`);
}

/**
 * Variante tolerante, pour les appels ou une donnee absente degrade la page
 * sans la rendre fausse : une liste vide s'affiche comme un catalogue vide,
 * ce qui est passager et se corrige au rechargement suivant.
 */
async function wcGet<T>(path: string, extra: Record<string, string> = {}, fallback: T): Promise<T> {
  try {
    return await wcFetch<T>(path, extra);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
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
 * Reduit chaque produit a ce que la grille du catalogue affiche reellement :
 * vignette, vignette de survol, nom, prix, categories. Les descriptions HTML,
 * les attributs et les images au-dela de la deuxieme sont ecartes — ils
 * pesaient lourd dans le payload serialise vers le navigateur sans etre lus.
 */
/**
 * Sur un produit variable, WooCommerce laisse `regular_price` et `sale_price`
 * vides au niveau parent : le prix vit dans les variations. La grille n'a donc
 * aucun moyen d'afficher le prix barre, alors que `price_html` contient les
 * deux valeurs dans une balise <del>.
 *
 * En cas d'echec d'extraction on ne devine rien : le produit s'affiche au bon
 * prix, simplement sans prix barre.
 */
function prixInitialDepuisHtml(html: string | undefined): string | null {
  if (!html) return null;
  const del = html.match(/<del[^>]*>([\s\S]*?)<\/del>/);
  if (!del) return null;
  const nombre = del[1].replace(/<[^>]+>/g, "").match(/([0-9]+(?:[.,][0-9]{1,2})?)/);
  return nombre ? nombre[1].replace(",", ".") : null;
}

export function toCatalogueProduct(products: WCProduct[]): WCProduct[] {
  return products.map((p) => {
    // Produit variable en promo : on reconstitue les deux prix pour que la
    // grille affiche le prix solde avec l'initial barre, comme les simples.
    const initial =
      p.type === "variable" && p.on_sale && !p.sale_price ? prixInitialDepuisHtml(p.price_html) : null;

    return {
      ...p,
      description: "",
      short_description: "",
      attributes: [],
      images: p.images?.slice(0, 2) ?? [],
      price_html: undefined, // inutile au client, et volumineux
      ...(initial ? { regular_price: initial, sale_price: p.price } : {}),
    };
  });
}

/**
 * Un seul produit, au lieu des 100 que chargeait la page avant.
 *
 * Renvoie null UNIQUEMENT quand WooCommerce a repondu qu'aucun produit ne porte
 * ce slug. Si WooCommerce n'a pas repondu, la fonction leve : l'appelant
 * transforme un null en 404, et un 404 prerendu au build ne se corrige plus.
 */
export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
  const rows = await wcFetch<WCProduct[]>("products", { slug, status: "publish" });
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
