"use client";

import { useState } from "react";
import ShopEntry from "@/components/shop/ShopEntry";
import ShopCatalogue from "@/components/shop/ShopCatalogue";

type Category = "textile" | "materiel";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  return (
    <main>
      <ShopEntry onSelect={setSelectedCategory} />
      <ShopCatalogue initialCategory={selectedCategory} />
    </main>
  );
}
