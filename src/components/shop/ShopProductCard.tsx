"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { WCProduct } from "./ShopCatalogue";

type Props = {
  product: WCProduct;
  index: number;
};

export default function ShopProductCard({ product, index }: Props) {
  const image = product.images?.[0];
  const imageHover = product.images?.[1];
  const subcategory = product.categories?.[product.categories.length - 1]?.name ?? "";
  const price = product.regular_price || product.price;

  return (
    <Link href={`/shop/${product.slug}`}>
      <motion.div
        className="group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
          {image ? (
            <>
              <Image
                src={image.src}
                alt={image.alt || product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={`object-cover transition-opacity duration-500 ${imageHover ? "group-hover:opacity-0" : "group-hover:scale-105 transition-transform"}`}
              />
              {imageHover && (
                <Image
                  src={imageHover.src}
                  alt={imageHover.alt || product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          {product.on_sale && (
            <span
              className="absolute top-3 left-3 bg-[#FF0080] text-white text-[10px] uppercase tracking-widest px-2 py-1"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Promo
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gray-900/90 py-3 text-center">
            <span
              className="text-white text-xs uppercase tracking-widest"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Voir le produit
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-baseline justify-between gap-2">
          <p
            className="text-gray-900 text-base leading-snug"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {product.name}
          </p>
          {price && (
            <div className="flex items-baseline gap-2 shrink-0">
              <p className="text-gray-900 text-lg" style={{ fontFamily: "var(--font-cormorant)" }}>
                {product.on_sale && product.sale_price ? product.sale_price : price} €
              </p>
              {product.on_sale && product.sale_price && (
                <p className="text-gray-400 text-sm line-through" style={{ fontFamily: "var(--font-cormorant)" }}>
                  {product.regular_price} €
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
