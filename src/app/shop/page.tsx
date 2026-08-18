import type { Metadata } from "next";
import { getCategories, getProducts, toCatalogueProduct } from "@/lib/woocommerce";
import ShopClient from "@/components/shop/ShopClient";
import JsonLd from "@/components/JsonLd";
import { shopCollectionSchema } from "@/lib/schema";

type Category = "textile" | "materiel" | "soins";
const VALID_CATS: Category[] = ["textile", "materiel", "soins"];

const CAT_LABELS: Record<Category, { title: string; description: string }> = {
  textile: {
    title: "Textile — T-shirts, hoodies et lycras de glisse",
    description:
      "Textile surf et glisse chez Airfly, Pointe Faula au Vauclin : t-shirts, hoodies, shorts, lycras et casquettes. Retrait en boutique en Martinique.",
  },
  materiel: {
    title: "Matériel — Kitesurf, wingfoil et accessoires",
    description:
      "Matériel de kitesurf et de wingfoil chez Airfly, Pointe Faula au Vauclin : ailes, planches, foils, harnais et accessoires. Retrait en boutique en Martinique.",
  },
  soins: {
    title: "Soins solaires — Protection pour les sports nautiques",
    description:
      "Sticks et soins solaires adaptés aux sports de glisse, sélectionnés par Airfly au Vauclin, Martinique. Retrait en boutique à Pointe Faula.",
  },
};

type Props = { searchParams: Promise<{ cat?: string }> };

function readCategory(cat: string | undefined): Category | null {
  return VALID_CATS.includes(cat as Category) ? (cat as Category) : null;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cat } = await searchParams;
  const category = readCategory(cat);

  const copy = category
    ? CAT_LABELS[category]
    : {
        title: "Shop — Surf shop kitesurf & wingfoil en Martinique",
        description:
          "Le surf shop Airfly à Pointe Faula, Le Vauclin : matériel de kitesurf et wingfoil, textile de glisse et soins solaires. Retrait en boutique, sans prépaiement.",
      };

  return {
    title: copy.title,
    description: copy.description,
    // Les variantes ?cat= pointent toutes vers /shop : une seule page a indexer.
    alternates: { canonical: "/shop" },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: "/shop",
      type: "website",
    },
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const { cat } = await searchParams;
  const category = readCategory(cat);

  // Chargement cote serveur : la grille produits et ses liens internes sont
  // presents dans le HTML initial, la ou ils etaient invisibles auparavant.
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <>
      <JsonLd data={shopCollectionSchema(products)} />
      <ShopClient
      initialCategory={category}
      products={toCatalogueProduct(products)}
        categories={categories}
      />
    </>
  );
}
