import Image from "next/image";
import Link from "next/link";
import type { WCProduct } from "@/lib/woocommerce";
import { toPlainText } from "@/lib/woocommerce";

/**
 * Produits lies, rendus cote serveur.
 *
 * L'audit du 8 septembre 2026 a compte exactement sept liens internes,
 * identiques, sur chacune des cinquante-six fiches produit : la navigation et
 * le pied de page, rien d'autre. Aucune fiche ne menait a une autre, alors que
 * le catalogue compte huit marques et des gammes coherentes — trois harnais
 * Ion, quatre ailes Duotone, une vingtaine de pieces Salty Crew.
 *
 * Deux consequences. Un visiteur arrive par la recherche sur une fiche precise
 * n'avait aucun chemin vers le reste de la boutique. Et vingt-neuf des
 * cinquante-six fiches n'etaient atteignables que par le sitemap, la page
 * `/shop` n'en liant que vingt-sept en HTML brut.
 *
 * Les liens sont de vraies balises `<a href>` rendues par le serveur : c'est ce
 * que suivent les moteurs, y compris ceux qui n'executent pas JavaScript.
 */

const MAX = 4;

/**
 * Choisit les fiches a proposer : d'abord la meme categorie, puis la meme
 * marque pour completer. Sans invention — si le catalogue ne fournit rien de
 * proche, le bloc ne s'affiche pas plutot que de proposer au hasard.
 */
export function choisirSimilaires(courant: WCProduct, tous: WCProduct[]): WCProduct[] {
  const autres = tous.filter((p) => p.id !== courant.id);
  const categorie = courant.categories?.[courant.categories.length - 1]?.slug;
  const marque = courant.brands?.[0]?.slug;

  const memeCategorie = categorie
    ? autres.filter((p) => p.categories?.some((c) => c.slug === categorie))
    : [];

  const memeMarque = marque
    ? autres.filter(
        (p) => p.brands?.[0]?.slug === marque && !memeCategorie.some((m) => m.id === p.id),
      )
    : [];

  return [...memeCategorie, ...memeMarque].slice(0, MAX);
}

export default function ProduitsSimilaires({
  produits,
  marque,
}: {
  produits: WCProduct[];
  marque?: string;
}) {
  if (produits.length === 0) return null;

  return (
    <section className="border-t border-gray-100 bg-white px-6 md:px-16 py-16">
      <div className="max-w-6xl mx-auto">
        <h2
          className="text-gray-900 text-2xl font-light mb-8"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {marque ? `Dans la meme gamme` : `A voir aussi`}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {produits.map((p) => {
            const image = p.images?.[0];
            return (
              <Link key={p.id} href={`/shop/${p.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3">
                  {image ? (
                    <Image
                      src={image.src}
                      alt={image.alt || toPlainText(p.name, 90)}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs uppercase tracking-widest">
                      Photo a venir
                    </div>
                  )}
                </div>
                <p
                  className="text-gray-900 text-sm leading-snug group-hover:text-[#FF0080] transition-colors"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {toPlainText(p.name, 70)}
                </p>
                {p.price && (
                  <p
                    className="text-gray-500 text-sm mt-1"
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {p.price} €
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
