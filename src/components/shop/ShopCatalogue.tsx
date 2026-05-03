"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShopProductCard from "./ShopProductCard";

type Category = "textile" | "materiel";

export type WCVariation = {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: string;
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

const CATEGORY_MAP: Record<Category, string[]> = {
  textile: ["textile", "tee-shirts", "hoodies", "shorts", "lycras", "tops-techniques", "casquettes-chapeaux"],
  materiel: ["materiel", "kitesurf", "ailes-de-kitesurf", "planches-de-kitesurf", "harnais", "accessoires", "kite-wing-foil", "foils", "planches-de-kite-wing-foil", "accessoires-kite-wing-foil"],
};

// Catégories intermédiaires (groupes) dans l'arborescence matériel
const GROUP_SLUGS = ["kitesurf", "kite-wing-foil"];

type Props = {
  initialCategory: Category | null;
};

export default function ShopCatalogue({ initialCategory }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory ?? "textile");
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
      setActiveSub(null);
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [initialCategory]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: WCCategory[]) => setCategories(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: WCProduct[]) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const slugs = CATEGORY_MAP[activeCategory];

  // Catégories visibles pour l'univers actif (hors racine textile/materiel)
  const visibleCats = categories.filter(
    (c) => slugs.includes(c.slug) && c.slug !== activeCategory
  );

  // Groupes de premier niveau (kitesurf, kite-wing-foil pour matériel — rien pour textile)
  const groups = visibleCats.filter((c) => GROUP_SLUGS.includes(c.slug));

  // Renvoie les enfants d'un groupe (par parent id)
  const childrenOf = (parentId: number) =>
    visibleCats.filter((c) => c.parent === parentId && !GROUP_SLUGS.includes(c.slug));

  // Catégories "à plat" (textile n'a pas de groupes intermédiaires)
  const flatCats = visibleCats.filter(
    (c) => !GROUP_SLUGS.includes(c.slug) && groups.every((g) => c.parent !== g.id) === false
      ? false
      : !GROUP_SLUGS.includes(c.slug) && groups.length === 0
  );

  // Pour textile : toutes les sous-cats directement
  const directCats = visibleCats.filter((c) => !GROUP_SLUGS.includes(c.slug) && groups.length === 0);

  // Filtrage produits
  const filtered = products.filter((p) => {
    const catSlugs = p.categories.map((c) => c.slug);
    const inUniverse = catSlugs.some((s) => slugs.includes(s));
    if (!inUniverse) return false;
    if (activeSub) return catSlugs.includes(activeSub);
    return true;
  });

  const switchCategory = (cat: Category) => {
    setActiveCategory(cat);
    setActiveSub(null);
  };

  const navButtonClass = (slug: string | null) =>
    `text-left transition-colors duration-200 ${
      activeSub === slug
        ? "text-[#FF0080]"
        : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <section id="catalogue" ref={ref} className="bg-white py-16 px-6 md:px-16">
      <div className="max-w-7xl mx-auto">

        {/* Toggle Textile / Matériel */}
        <div className="flex justify-center gap-0 mb-12">
          {(["textile", "materiel"] as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => switchCategory(cat)}
              className={`uppercase tracking-widest text-sm px-10 py-3 border transition-colors duration-300 ${
                activeCategory === cat
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "border-gray-300 text-gray-400 hover:border-gray-600 hover:text-gray-700"
              }`}
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Layout sidebar + grille */}
        <div className="flex gap-12">

          {/* Sidebar */}
          <AnimatePresence mode="wait">
            <motion.aside
              key={activeCategory}
              className="hidden md:block w-48 shrink-0"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tout */}
              <button
                onClick={() => setActiveSub(null)}
                className={`${navButtonClass(null)} uppercase tracking-widest text-xs mb-5 block`}
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                Tout
              </button>

              {/* Textile : liste plate */}
              {directCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveSub(cat.slug === activeSub ? null : cat.slug)}
                  className={`${navButtonClass(cat.slug)} text-sm block mb-3`}
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {cat.name}
                </button>
              ))}

              {/* Matériel : groupes avec enfants */}
              {groups.map((group) => (
                <div key={group.id} className="mb-5">
                  <p
                    className="uppercase tracking-widest text-xs text-gray-900 mb-2"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    {group.name}
                  </p>
                  {childrenOf(group.id).map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setActiveSub(child.slug === activeSub ? null : child.slug)}
                      className={`${navButtonClass(child.slug)} text-sm block mb-2 pl-3 border-l border-gray-200`}
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              ))}
            </motion.aside>
          </AnimatePresence>

          {/* Bouton filtres mobile */}
          <div className="md:hidden flex-1">
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 border border-gray-200 px-4 py-2 mb-8 hover:border-gray-900 hover:text-gray-900 transition-colors duration-200"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filtrer
              {activeSub && <span className="w-1.5 h-1.5 bg-[#FF0080] rounded-full" />}
            </button>
          </div>

          {/* Grille produits */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-24">
                <motion.div
                  className="w-6 h-6 border-2 border-[#FF0080] border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCategory}-${activeSub}`}
                  className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {filtered.map((product, i) => (
                    <ShopProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {!loading && filtered.length === 0 && (
              <p className="text-gray-400 py-24" style={{ fontFamily: "var(--font-cormorant)" }}>
                Aucun produit dans cette catégorie.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Drawer filtres mobile */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[80] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[90] bg-white px-6 pt-6 pb-10 md:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-900" style={{ fontFamily: "Mirloanne, serif" }}>Filtres</p>
                {activeSub && (
                  <button
                    onClick={() => { setActiveSub(null); setFilterOpen(false); }}
                    className="text-xs text-[#FF0080] uppercase tracking-widest"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Tout */}
              <button
                onClick={() => { setActiveSub(null); setFilterOpen(false); }}
                className={`block w-full text-left py-3 border-b border-gray-100 text-sm uppercase tracking-widest transition-colors duration-200 ${activeSub === null ? "text-[#FF0080]" : "text-gray-500"}`}
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                Tout
              </button>

              {/* Textile : liste plate */}
              {directCats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveSub(cat.slug === activeSub ? null : cat.slug); setFilterOpen(false); }}
                  className={`block w-full text-left py-3 border-b border-gray-100 transition-colors duration-200 ${activeSub === cat.slug ? "text-[#FF0080]" : "text-gray-500"}`}
                  style={{ fontFamily: "var(--font-cormorant)", fontSize: "1rem" }}
                >
                  {cat.name}
                </button>
              ))}

              {/* Matériel : groupes */}
              {groups.map((group) => (
                <div key={group.id}>
                  <p className="py-3 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-900" style={{ fontFamily: "Mirloanne, serif" }}>
                    {group.name}
                  </p>
                  {childrenOf(group.id).map((child) => (
                    <button
                      key={child.id}
                      onClick={() => { setActiveSub(child.slug === activeSub ? null : child.slug); setFilterOpen(false); }}
                      className={`block w-full text-left py-3 pl-4 border-b border-gray-100 transition-colors duration-200 ${activeSub === child.slug ? "text-[#FF0080]" : "text-gray-500"}`}
                      style={{ fontFamily: "var(--font-cormorant)", fontSize: "1rem" }}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}
