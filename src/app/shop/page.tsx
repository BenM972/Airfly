"use client";

import { useState } from "react";
import ShopEntry from "@/components/shop/ShopEntry";
import ShopCatalogue from "@/components/shop/ShopCatalogue";
import SunSticksHero from "@/components/shop/SunSticksHero";

type Category = "textile" | "materiel" | "soins";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  return (
    <main>
      <ShopEntry onSelect={setSelectedCategory} />
      <SunSticksHero onShopSoins={() => setSelectedCategory("soins")} />
      <ShopCatalogue initialCategory={selectedCategory} />
    </main>
  );
}
