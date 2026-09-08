import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getVariations, toPlainText } from "@/lib/woocommerce";
import ProductDetail from "@/components/shop/ProductDetail";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/schema";
import ProduitsSimilaires, { choisirSimilaires } from "@/components/shop/ProduitsSimilaires";

type Props = { params: Promise<{ slug: string }> };

/**
 * Pas de generateStaticParams, volontairement.
 *
 * Pre-rendre les cinquante-six fiches au build demandait plus de cent dix
 * appels a WooCommerce en quelques secondes. Le WordPress est sur un
 * hebergement mutualise qui repond 500 sous cette charge, et un seul echec
 * arrete le build : trois deploiements de suite ont echoue ainsi. Plafonner
 * les processus a quatre puis les appels simultanes a quatre n'a pas suffi,
 * alors que les memes requetes, passees une par une, repondent toutes 200 en
 * moins d'une seconde. Le probleme est la rafale, pas les donnees.
 *
 * Les fiches sont donc rendues a la premiere visite puis mises en cache selon
 * le `revalidate` des appels WooCommerce, soit cinq minutes. Le visiteur qui
 * essuie les platres attend environ une seconde de plus ; en echange le build
 * ne touche presque plus a WooCommerce et ne peut plus echouer pour cette
 * raison. Les moteurs recoivent du HTML complet dans les deux cas.
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produit introuvable", robots: { index: false, follow: true } };
  }

  const name = toPlainText(product.name, 90);
  const description =
    toPlainText(product.short_description || product.description, 155) ||
    `${name} — disponible chez Airfly, surf shop à Pointe Faula, Le Vauclin (Martinique). Retrait en boutique sans prépaiement.`;

  return {
    title: name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: name,
      description,
      url: `/shop/${product.slug}`,
      type: "website",
      // Repli sur le visuel du site quand la fiche n'a pas de photo : trois
      // produits sont dans ce cas et n'avaient aucun apercu au partage. Ce
      // repli ne vaut que pour l'apercu social — le `Product.image` du JSON-LD
      // reste vide, car y mettre une photo qui n'est pas celle du produit
      // serait une fausse declaration.
      images: product.images?.[0]?.src
        ? [{ url: product.images[0].src, alt: product.images[0].alt || name }]
        : [{ url: "/hero_materiel.jpg", width: 1200, height: 630, alt: "Airfly, surf shop a Pointe Faula, Martinique" }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Un slug inconnu renvoyait 200 avec "Produit introuvable" : soft 404 pour Google.
  if (!product) notFound();

  const variations = product.type === "variable" ? await getVariations(product.id) : [];

  // `getProducts` partage le cache de la page catalogue (revalidate 300) :
  // proposer des fiches liees ne multiplie donc pas les appels a WooCommerce,
  // dont la fragilite sous rafale est documentee plus haut.
  const similaires = choisirSimilaires(product, await getProducts());

  const category = product.categories?.[product.categories.length - 1];

  return (
    <>
      <JsonLd data={productSchema(product, variations)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Shop", url: "/shop" },
          ...(category ? [{ name: toPlainText(category.name, 60), url: `/shop?cat=${category.slug}` }] : []),
          { name: toPlainText(product.name, 90), url: `/shop/${product.slug}` },
        ])}
      />
      <ProductDetail product={product} variations={variations} />
      <ProduitsSimilaires produits={similaires} marque={product.brands?.[0]?.name} />
    </>
  );
}
