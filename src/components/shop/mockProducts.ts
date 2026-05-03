export type Product = {
  id: number;
  name: string;
  price: string;
  category: "textile" | "materiel";
  subcategory: string;
  image: string;
  badge?: string;
};

export const products: Product[] = [
  // Textile
  { id: 1, name: "T-shirt Airfly Logo", price: "35 €", category: "textile", subcategory: "T-shirts", image: "/shop/tshirt-logo.jpg", badge: "Nouveau" },
  { id: 2, name: "T-shirt Vague", price: "35 €", category: "textile", subcategory: "T-shirts", image: "/shop/tshirt-vague.jpg" },
  { id: 3, name: "Hoodie Airfly", price: "75 €", category: "textile", subcategory: "Hoodies", image: "/shop/hoodie.jpg", badge: "Bestseller" },
  { id: 4, name: "Hoodie Zip Martinique", price: "80 €", category: "textile", subcategory: "Hoodies", image: "/shop/hoodie-zip.jpg" },
  { id: 5, name: "Short de plage", price: "45 €", category: "textile", subcategory: "Shorts", image: "/shop/short.jpg" },
  { id: 6, name: "Short Technique", price: "55 €", category: "textile", subcategory: "Shorts", image: "/shop/short-tech.jpg" },
  { id: 7, name: "Casquette Airfly", price: "28 €", category: "textile", subcategory: "Casquettes", image: "/shop/casquette.jpg" },
  { id: 8, name: "Bonnet Logo", price: "25 €", category: "textile", subcategory: "Casquettes", image: "/shop/bonnet.jpg" },

  // Matériel
  { id: 9, name: "Kite Delta 12m", price: "1 490 €", category: "materiel", subcategory: "Kites", image: "/shop/kite-delta.jpg", badge: "Populaire" },
  { id: 10, name: "Kite Bow 9m", price: "1 290 €", category: "materiel", subcategory: "Kites", image: "/shop/kite-bow.jpg" },
  { id: 11, name: "Board Twin Tip 138", price: "680 €", category: "materiel", subcategory: "Planches", image: "/shop/board-twintip.jpg" },
  { id: 12, name: "Board Directionnelle", price: "720 €", category: "materiel", subcategory: "Planches", image: "/shop/board-dir.jpg" },
  { id: 13, name: "Wing Foil 5m", price: "890 €", category: "materiel", subcategory: "Ailes Wing", image: "/shop/wing.jpg", badge: "Nouveau" },
  { id: 14, name: "Wing Foil 4m", price: "820 €", category: "materiel", subcategory: "Ailes Wing", image: "/shop/wing-4m.jpg" },
  { id: 15, name: "Harnais Ceinture", price: "190 €", category: "materiel", subcategory: "Harnais", image: "/shop/harnais.jpg" },
  { id: 16, name: "Harnais Coque", price: "280 €", category: "materiel", subcategory: "Harnais", image: "/shop/harnais-coque.jpg" },
  { id: 17, name: "Leash de sécurité", price: "45 €", category: "materiel", subcategory: "Accessoires", image: "/shop/leash.jpg" },
  { id: 18, name: "Pompe double action", price: "65 €", category: "materiel", subcategory: "Accessoires", image: "/shop/pompe.jpg" },
];

export const subcategories: Record<"textile" | "materiel", string[]> = {
  textile: ["T-shirts", "Hoodies", "Shorts", "Casquettes"],
  materiel: ["Kites", "Planches", "Ailes Wing", "Harnais", "Accessoires"],
};
