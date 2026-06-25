"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ShopEntry from "@/components/shop/ShopEntry";
import ShopCatalogue from "@/components/shop/ShopCatalogue";
import SunSticksHero from "@/components/shop/SunSticksHero";

type Category = "textile" | "materiel" | "soins";

const VALID_CATS: Category[] = ["textile", "materiel", "soins"];

function ShopContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const initialCat = VALID_CATS.includes(catParam as Category) ? (catParam as Category) : null;
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCat);

  useEffect(() => {
    if (initialCat) setSelectedCategory(initialCat);
  }, [initialCat]);

  return (
    <main>
      <ShopEntry onSelect={setSelectedCategory} />
      <SunSticksHero onShopSoins={() => setSelectedCategory("soins")} />
      <ShopCatalogue initialCategory={selectedCategory} />
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
