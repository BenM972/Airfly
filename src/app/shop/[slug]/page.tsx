"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { WCProduct, WCVariation } from "@/components/shop/ShopCatalogue";
import VariantSelector from "@/components/shop/VariantSelector";
import { useCart } from "@/context/CartContext";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<WCProduct | null>(null);
  const [variations, setVariations] = useState<WCVariation[]>([]);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lbZoom, setLbZoom] = useState(1);
  const [lbPan, setLbPan] = useState({ x: 0, y: 0 });
  const lbDragging = useRef(false);
  const lbLastPos = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { add } = useCart();
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(async (data: WCProduct[]) => {
        const found = data.find((p) => p.slug === slug) ?? null;
        setProduct(found);
        if (found?.type === "variable") {
          const vars = await fetch(`/api/products/${found.id}/variations`).then((r) => r.json());
          setVariations(Array.isArray(vars) ? vars : []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Variation active selon la sélection
  const activeVariation: WCVariation | null = variations.length > 0
    ? variations.find((v) =>
        v.attributes.every((a) => selectedAttrs[a.name] === a.option)
      ) ?? null
    : null;

  // Couleur sélectionnée (attribut couleur/color/colour)
  const colorAttrName = product?.attributes.find((a) =>
    ["couleur", "color", "colour"].includes(a.name.toLowerCase()) && a.variation
  )?.name;
  const selectedColor = colorAttrName ? selectedAttrs[colorAttrName] : null;

  // Variations qui correspondent à la couleur sélectionnée
  const colorVariations = selectedColor
    ? variations.filter((v) => v.attributes.some(
        (a) => ["couleur", "color", "colour"].includes(a.name.toLowerCase()) && a.option === selectedColor
      ))
    : [];

  // Images : si couleur sélectionnée → uniquement les images des variations de cette couleur
  // sinon toutes les images du produit
  const images = (() => {
    if (selectedColor && colorVariations.length > 0) {
      const varImages = colorVariations
        .map((v) => v.image)
        .filter((img): img is { src: string; alt: string } => !!img?.src);
      // Déduplique par src
      const seen = new Set<string>();
      return varImages.filter((img) => seen.has(img.src) ? false : (seen.add(img.src), true));
    }
    return product?.images ?? [];
  })();

  // Reset à 0 quand les images changent (changement de variation)
  useEffect(() => { setActiveImage(0); }, [activeVariation?.id]);

  const startInterval = useCallback((total: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (total <= 1) return;
    intervalRef.current = setInterval(() => {
      if (!isHovering.current) setActiveImage((i) => (i + 1) % total);
    }, 6000);
  }, []);

  useEffect(() => {
    startInterval(images.length);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [images.length, startInterval]);

  const varianteLabel = activeVariation
    ? activeVariation.attributes.map((a) => a.option).join(" / ")
    : null;

  const handleAddToCart = () => {
    if (!product) return;
    const itemId = `${product.id}-${varianteLabel ?? "simple"}`;
    add({
      id: itemId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variante: varianteLabel,
      image: images[0]?.src ?? "",
      price: displayPrice ?? "",
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleAttrChange = (attrName: string, value: string | null) => {
    setSelectedAttrs((prev) => {
      const next = { ...prev };
      if (value === null) delete next[attrName];
      else next[attrName] = value;
      return next;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const openLightbox = () => {
    setLightboxOpen(true);
    setLbZoom(1);
    setLbPan({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLbZoom(1);
    setLbPan({ x: 0, y: 0 });
  };

  const handleLbWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setLbZoom((z) => {
      const next = Math.min(4, Math.max(1, z - e.deltaY * 0.002));
      if (next === 1) setLbPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleLbPointerDown = (e: React.PointerEvent) => {
    if (lbZoom <= 1) return;
    lbDragging.current = true;
    lbLastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleLbPointerMove = (e: React.PointerEvent) => {
    if (!lbDragging.current) return;
    setLbPan((p) => ({
      x: p.x + (e.clientX - lbLastPos.current.x),
      y: p.y + (e.clientY - lbLastPos.current.y),
    }));
    lbLastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleLbPointerUp = () => { lbDragging.current = false; };

  const lbPrev = () => {
    setActiveImage((i) => (i - 1 + images.length) % images.length);
    setLbZoom(1);
    setLbPan({ x: 0, y: 0 });
  };

  const lbNext = () => {
    setActiveImage((i) => (i + 1) % images.length);
    setLbZoom(1);
    setLbPan({ x: 0, y: 0 });
  };

  // Prix affiché
  const displayPrice = activeVariation
    ? activeVariation.on_sale && activeVariation.sale_price
      ? activeVariation.sale_price
      : activeVariation.regular_price || activeVariation.price
    : product?.on_sale && product?.sale_price
      ? product.sale_price
      : product?.regular_price || product?.price;

  const displayRegularPrice = activeVariation?.on_sale ? activeVariation.regular_price
    : product?.on_sale ? product.regular_price : null;

  const isOnSale = activeVariation ? activeVariation.on_sale : product?.on_sale;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          className="w-6 h-6 border-2 border-[#FF0080] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
        <p className="text-gray-500" style={{ fontFamily: "var(--font-cormorant)" }}>Produit introuvable.</p>
        <Link href="/shop" className="text-xs uppercase tracking-widest text-gray-900 border-b border-gray-300 hover:border-[#FF0080] hover:text-[#FF0080] transition-colors" style={{ fontFamily: "Mirloanne, serif" }}>
          Retour au shop
        </Link>
      </div>
    );
  }

  const categoryRaw = product.categories?.[product.categories.length - 1]?.name ?? "";
  // Strip accents for Mirloanne font compatibility
  const category = categoryRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Map product category slugs to shop ?cat= param
  const BREADCRUMB_MAP: Record<string, string[]> = {
    textile: ["textile", "tee-shirts", "hoodies", "shorts", "pantalons", "lycras", "casquettes-chapeaux", "chaussures", "homme", "femme"],
    materiel: ["materiel", "kitesurf", "ailes-de-kitesurf", "planches-de-kitesurf", "harnais", "accessoires", "kite-wing-foil", "foils", "planches-de-kite-wing-foil", "accessoires-kite-wing-foil"],
    soins: ["soins-solaires", "go-wild", "sun-kissed", "feel-good"],
  };
  const productSlugs = product.categories?.map((c) => c.slug) ?? [];
  const shopCat = (Object.entries(BREADCRUMB_MAP).find(([, slugs]) =>
    productSlugs.some((s) => slugs.includes(s))
  ) ?? [])[0] ?? null;

  return (
    <main className="bg-white min-h-screen pt-24 pb-24 px-6 md:px-16">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <motion.div
          className="flex items-center gap-2 mb-12 text-xs uppercase tracking-widest text-gray-400"
          style={{ fontFamily: "Mirloanne, serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/shop" className="hover:text-[#FF0080] transition-colors">Shop</Link>
          <span>›</span>
          {shopCat ? (
            <Link href={`/shop?cat=${shopCat}`} className="text-gray-600 hover:text-[#FF0080] transition-colors">{category}</Link>
          ) : (
            <span className="text-gray-600">{category}</span>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">

          {/* Galerie */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Image principale */}
            <div className="flex md:gap-3">
              {/* Miniatures colonne gauche — desktop uniquement */}
              {images.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImage(i); startInterval(images.length); }}
                      onMouseEnter={() => { isHovering.current = true; }}
                      onMouseLeave={() => { isHovering.current = false; }}
                      className={`relative w-16 h-20 overflow-hidden border-2 transition-colors duration-200 shrink-0 ${
                        activeImage === i ? "border-[#FF0080]" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image src={img.src} alt={img.alt || ""} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}

            <div className="flex-1">
              <div
                className="relative aspect-[3/4] overflow-hidden bg-gray-100 md:cursor-zoom-in"
                onClick={() => { if (window.innerWidth >= 768) openLightbox(); }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => { isHovering.current = true; setZoomed(true); }}
                onMouseLeave={() => { isHovering.current = false; setZoomed(false); }}
              >
                <AnimatePresence mode="wait">
                  {images[activeImage] ? (
                    <motion.div
                      key={`${activeVariation?.id ?? "base"}-${activeImage}`}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Image
                        src={images[activeImage].src}
                        alt={images[activeImage].alt || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-200"
                        style={zoomed ? {
                          transform: "scale(2)",
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        } : {}}
                        priority
                      />
                    </motion.div>
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </AnimatePresence>

                {isOnSale && (
                  <span
                    className="absolute top-4 left-4 z-10 bg-[#FF0080] text-white text-[10px] uppercase tracking-widest px-2 py-1"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    Promo
                  </span>
                )}
              </div>
            </div>
            </div>

            {/* Miniatures en bas — mobile uniquement */}
            {images.length > 1 && (
              <div className="flex md:hidden gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImage(i); startInterval(images.length); }}
                    className={`relative w-14 h-18 shrink-0 overflow-hidden border-2 transition-colors duration-200 ${
                      activeImage === i ? "border-[#FF0080]" : "border-transparent"
                    }`}
                    style={{ height: "72px" }}
                  >
                    <Image src={img.src} alt={img.alt || ""} fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Infos produit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            <p
              className="text-[#FF0080] text-xs uppercase tracking-widest mb-3"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              {category}
            </p>

            <h1
              className="text-gray-900 text-3xl md:text-4xl font-light mb-6 leading-tight"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {product.name}
            </h1>


            {/* Description courte */}
            {product.short_description && (
              <div
                className="text-gray-600 text-base leading-relaxed mb-8 prose prose-sm max-w-none"
                style={{ fontFamily: "var(--font-cormorant)" }}
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {/* Sélecteurs de variations */}
            {product.type === "variable" && (
              <VariantSelector
                product={product}
                variations={variations}
                selected={selectedAttrs}
                onChange={handleAttrChange}
                activeVariation={activeVariation}
                priceSlot={displayPrice ? (
                  <span className="flex items-baseline gap-2">
                    <span className="text-2xl text-gray-900" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {displayPrice}&nbsp;€
                    </span>
                    {isOnSale && displayRegularPrice && (
                      <span className="text-base text-gray-400 line-through" style={{ fontFamily: "var(--font-cormorant)" }}>
                        {displayRegularPrice}&nbsp;€
                      </span>
                    )}
                  </span>
                ) : undefined}
              />
            )}

            {/* Attributs simples (non-variation) */}
            {product.attributes.filter((a) => !a.variation).map((attr) => (
              <div key={attr.id} className="mb-6">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-3" style={{ fontFamily: "Mirloanne, serif" }}>
                  {attr.name}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {attr.options.map((opt) => (
                    <span
                      key={opt}
                      className="border border-gray-200 px-4 py-2 text-sm text-gray-700"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Prix (produits simples uniquement) + CTA Panier */}
            <div className="mt-auto">
              {product.type !== "variable" && displayPrice && (
                <div className="mb-4 flex items-baseline gap-3">
                  <span
                    className="text-2xl text-gray-900"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {displayPrice}&nbsp;€
                  </span>
                  {isOnSale && displayRegularPrice && (
                    <span
                      className="text-base text-gray-400 line-through"
                      style={{ fontFamily: "var(--font-cormorant)" }}
                    >
                      {displayRegularPrice}&nbsp;€
                    </span>
                  )}
                </div>
              )}

              {(() => {
                const stockStatus = activeVariation ? activeVariation.stock_status : product.stock_status;
                const outOfStock = stockStatus === "outofstock";
                const needsOption = product.type === "variable" && !activeVariation;
                return (
                  <button
                    onClick={handleAddToCart}
                    disabled={needsOption || outOfStock}
                    className="w-full bg-gray-900 text-white uppercase tracking-widest text-sm py-4 hover:bg-[#FF0080] transition-colors duration-300 disabled:opacity-40"
                    style={{ fontFamily: "Mirloanne, serif" }}
                  >
                    {needsOption ? "Choisir une option" : outOfStock ? "Rupture de stock" : addedFeedback ? "Ajoute !" : "Ajouter au panier"}
                  </button>
                );
              })()}

              {(() => {
                const qty = activeVariation ? activeVariation.stock_quantity : product.stock_quantity ?? null;
                const status = activeVariation ? activeVariation.stock_status : product.stock_status;
                if (status === "outofstock") {
                  return (
                    <p className="mt-2 text-center text-gray-400 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>
                      Ce produit est en rupture de stock — n&apos;hesitez pas a passer en magasin, nous avons peut-etre un equivalent pour vous.
                    </p>
                  );
                }
                if (status === "instock" && qty !== null && qty > 0) {
                  return (
                    <p className="mt-2 text-center text-gray-400 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {qty} en stock · Retrait a Pointe Faula · Sans prepaiement
                    </p>
                  );
                }
                return (
                  <p className="mt-2 text-center text-gray-400 text-xs" style={{ fontFamily: "var(--font-cormorant)" }}>
                    Retrait en boutique a Pointe Faula · Sans prepaiement
                  </p>
                );
              })()}

              <button
                onClick={() => window.open("/shop/guide-des-tailles.jpg", "_blank")}
                className="mt-4 text-xs uppercase tracking-widest text-gray-400 hover:text-[#FF0080] transition-colors duration-200"
                style={{ fontFamily: "Mirloanne, serif" }}
              >
                Guide des tailles →
              </button>
            </div>

            {/* Description longue */}
            {product.description && (
              <details className="mt-10 border-t border-gray-100 pt-6" open>
                <summary
                  className="text-xs uppercase tracking-widest text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
                  style={{ fontFamily: "Mirloanne, serif" }}
                >
                  Description complete
                </summary>
                <div
                  className="mt-4 text-gray-600 text-base leading-relaxed prose prose-sm max-w-none"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </details>
            )}
          </motion.div>

        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white text-3xl leading-none w-10 h-10 flex items-center justify-center transition-colors"
              aria-label="Fermer"
            >
              ✕
            </button>

            {/* Counter */}
            {images.length > 1 && (
              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest" style={{ fontFamily: "Mirloanne, serif" }}>
                {activeImage + 1} / {images.length}
              </span>
            )}

            {/* Prev / Next */}
            {images.length > 1 && (
              <>
                <button
                  onClick={lbPrev}
                  className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-50 text-white/60 hover:text-white text-2xl w-10 h-10 flex items-center justify-center transition-colors"
                  aria-label="Precedent"
                >
                  ‹
                </button>
                <button
                  onClick={lbNext}
                  className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-50 text-white/60 hover:text-white text-2xl w-10 h-10 flex items-center justify-center transition-colors"
                  aria-label="Suivant"
                >
                  ›
                </button>
              </>
            )}

            {/* Image container */}
            <div
              className="relative w-full h-full flex items-center justify-center overflow-hidden select-none"
              onWheel={handleLbWheel}
              onPointerDown={handleLbPointerDown}
              onPointerMove={handleLbPointerMove}
              onPointerUp={handleLbPointerUp}
              style={{ cursor: lbZoom > 1 ? "grab" : "default", touchAction: "none" }}
            >
              {images[activeImage] && (
                <Image
                  src={images[activeImage].src}
                  alt={images[activeImage].alt || product.name}
                  fill
                  sizes="100vw"
                  className="object-contain pointer-events-none transition-transform duration-100"
                  style={{
                    transform: `scale(${lbZoom}) translate(${lbPan.x / lbZoom}px, ${lbPan.y / lbZoom}px)`,
                  }}
                  priority
                />
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setActiveImage(i); setLbZoom(1); setLbPan({ x: 0, y: 0 }); }}
                    className={`relative w-12 h-14 overflow-hidden border-2 transition-colors duration-200 ${
                      activeImage === i ? "border-white" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image src={img.src} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
