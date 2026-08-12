"use client";

import { useEffect, useState } from "react";
import type { WCCategory, WCProduct } from "@/lib/woocommerce";
import ShopEntry from "./ShopEntry";
import ShopCatalogue from "./ShopCatalogue";

type Category = "textile" | "materiel" | "soins";

type Props = {
  initialCategory: Category | null;
  products: WCProduct[];
  categories: WCCategory[];
};

/**
 * Porte l'etat partage entre l'entree en deux panneaux et le catalogue.
 * Les donnees arrivent en props depuis le Server Component : ce composant est
 * donc rendu, grille produits comprise, dans le HTML initial.
 */
export default function ShopClient({ initialCategory, products, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory]);

  return (
    <main>
      <h1 className="sr-only">
        Surf shop Airfly — matériel de kitesurf, wingfoil et textile de glisse à Pointe Faula, Le Vauclin (Martinique)
      </h1>
      <ShopEntry onSelect={setSelectedCategory} />
      <ShopCatalogue initialCategory={selectedCategory} products={products} categories={categories} />
    </main>
  );
}
