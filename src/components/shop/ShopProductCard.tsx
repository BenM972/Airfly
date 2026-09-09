"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { WCProduct } from "./ShopCatalogue";

type Props = {
  product: WCProduct;
  index: number;
  /** Masquee par le filtre : montee dans le DOM, mais retiree de l'affichage. */
  hidden?: boolean;
  /** Precharge l'image : reservee aux toutes premieres cartes visibles. */
  priority?: boolean;
};

export default function ShopProductCard({ product, index, hidden = false, priority = false }: Props) {
  const image = product.images?.[0];
  const imageHover = product.images?.[1];
  // En promotion, c'est le prix soldé qui doit s'afficher, le prix normal barré
  // à côté. Auparavant la carte montrait toujours regular_price : la grille
  // annonçait 359 € avec un badge « Promo » quand la fiche produit affichait
  // 251,30 €. Deux prix pour le même article, et le mauvais en vitrine.
  const enPromo = product.on_sale && !!product.sale_price;
  const price = enPromo ? product.sale_price : product.regular_price || product.price;
  const prixBarre = enPromo ? product.regular_price : null;

  return (
    <Link href={`/shop/${product.slug}`} hidden={hidden}>
      {/* L'animation d'entree ne doit pas retarder la peinture de ce qui est
          au-dessus de la ligne de flottaison.
       
          Chaque carte partait de `opacity: 0` avec un delai de 50 ms multiplie
          par son rang : la vingtieme attendait une seconde avant d'etre
          peinte. Un element a `opacity: 0` n'est pas peint, donc le LCP ne
          pouvait pas se declencher avant. Mesure du 9 septembre sur /shop :
          LCP a 2 908 ms, pour un TTFB de 518 ms.
       
          Les trois premieres cartes visibles apparaissent donc immediatement.
          Les suivantes gardent l'animation, avec un delai plafonne : au-dela
          d'un tiers de seconde, l'effet ne se remarque plus et ne fait que
          repousser la peinture. */}
      <motion.div
        className="group cursor-pointer"
        initial={index < 3 ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      >
        {/* Image */}
        {/* Cadre blanc et non gris : cinq photos sur douze ont un fond blanc
            massif, qui dessinait un rectangle clair sur le gris. Les sept
            autres sont deja transparentes et se posent aussi bien sur blanc.
            Aucune bordure : le cadre doit disparaitre entierement, sinon on
            remplace un rectangle visible par un autre. */}
        <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4 p-3">
          {/* Le bandeau "Voir le produit" est toujours visible sur mobile et
              recouvre le bas du cadre. L'image, centree sur la hauteur totale,
              paraissait donc poussee vers le bas. On lui retire cette hauteur
              pour qu'elle se centre dans la zone REELLEMENT visible.
              `inset-0` d'une image `fill` se cale sur la boite de rembourrage :
              un padding sur le parent ne la decalerait pas, il faut donc
              positionner ce conteneur explicitement. */}
          <div className="absolute inset-x-3 top-3 bottom-14 md:bottom-3">
          {image ? (
            <>
              <Image
                src={image.src}
                alt={image.alt || product.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                priority={priority}
                loading={priority ? undefined : "lazy"}
                className={`object-contain transition-opacity duration-500 ${imageHover ? "group-hover:opacity-0" : "group-hover:scale-105 transition-transform"}`}
              />
              {imageHover && (
                <Image
                  src={imageHover.src}
                  alt={imageHover.alt || product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          </div>
          {product.on_sale && (
            <span
              className="absolute top-3 left-3 bg-[#FF0080] text-white text-[10px] uppercase tracking-widest px-2 py-1"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Promo
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 bg-gray-900/90 py-3 text-center">
            <span
              className="text-white text-xs uppercase tracking-widest"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              Voir le produit
            </span>
          </div>
        </div>

        {/* Info */}
        {/* Empiles sur mobile, cote a cote a partir de sm.
            Sur une demi-largeur de telephone, mettre le titre et le prix sur la
            meme ligne comprimait le titre sur trois lignes et tronquait le
            prix. Un prix a moitie lisible est pire que pas de prix. */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
          <p
            className="text-gray-900 text-base leading-snug"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {product.name}
          </p>
          {price && (
            <p
              className="text-sm flex items-baseline gap-2 whitespace-nowrap sm:shrink-0"
              style={{ fontFamily: "Mirloanne, serif" }}
            >
              {prixBarre && (
                <span className="text-gray-400 line-through">
                  {parseFloat(prixBarre).toFixed(2).replace(".", ",")} €
                </span>
              )}
              <span className={enPromo ? "text-[#FF0080]" : "text-gray-900"}>
                {parseFloat(price).toFixed(2).replace(".", ",")} €
              </span>
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
