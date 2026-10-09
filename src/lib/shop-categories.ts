// Les univers du shop (onglets du catalogue, parametre ?cat=).
//
// Ce type etait recopie dans quatre fichiers ; ajouter un univers obligeait a
// les modifier tous. Une seule source ici.

import type { WCProduct } from "./woocommerce";

export const UNIVERS = ["textile", "materiel", "soins", "occasion"] as const;
export type Univers = (typeof UNIVERS)[number];

/** Slugs WooCommerce rattaches a chaque univers. */
export const CATEGORY_MAP: Record<Univers, string[]> = {
  textile: ["textile", "tee-shirts", "hoodies", "shorts", "pantalons", "lycras", "casquettes-chapeaux", "chaussures", "homme", "femme"],
  materiel: ["materiel", "kitesurf", "ailes-de-kitesurf", "planches-de-kitesurf", "harnais", "accessoires", "kite-wing-foil", "foils", "planches-de-kite-wing-foil", "accessoires-kite-wing-foil"],
  soins: ["soins-solaires", "go-wild", "sun-kissed", "feel-good"],
  occasion: ["occasion"],
};

/**
 * Le materiel de l'ecole revendu, et les fins de serie. Un produit porte cette
 * categorie EN PLUS de sa categorie technique : il apparait donc aussi dans
 * Materiel, avec un badge.
 */
export const SLUG_OCCASION = "occasion";

/**
 * Etiquette WooCommerce interne, jamais affichee : marque une fin de serie
 * rangee dans Occasion mais vendue neuve. Elle ne sert qu'a l'etat declare a
 * Google, qui refuse un produit neuf annonce d'occasion et inversement.
 */
export const ETIQUETTE_NEUF = "neuf";

export function lireUnivers(cat: string | undefined): Univers | null {
  return UNIVERS.includes(cat as Univers) ? (cat as Univers) : null;
}

type AvecCategories = Pick<WCProduct, "categories"> & Partial<Pick<WCProduct, "tags">>;

export function estOccasion(product: AvecCategories): boolean {
  return product.categories?.some((c) => c.slug === SLUG_OCCASION) ?? false;
}

/**
 * Univers vers lequel renvoie le fil d'Ariane d'une fiche. Occasion passe en
 * premier : une aile d'occasion est aussi du materiel, mais le client qui la
 * consulte vient de la rubrique Occasion.
 */
export function universDuProduit(product: AvecCategories): Univers | null {
  if (estOccasion(product)) return "occasion";
  const slugs = product.categories?.map((c) => c.slug) ?? [];
  return UNIVERS.find((u) => CATEGORY_MAP[u].some((s) => slugs.includes(s))) ?? null;
}

export function etatDuProduit(product: AvecCategories): string {
  const neuf = product.tags?.some((t) => t.slug === ETIQUETTE_NEUF) ?? false;
  return estOccasion(product) && !neuf
    ? "https://schema.org/UsedCondition"
    : "https://schema.org/NewCondition";
}
