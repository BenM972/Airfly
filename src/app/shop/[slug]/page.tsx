import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts, getProductBySlug, getVariations, toPlainText } from "@/lib/woocommerce";
import ProductDetail from "@/components/shop/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

/**
 * Pre-rend les fiches au build : elles deviennent statiques au lieu d'appeler
 * WooCommerce a la premiere visite (~800 ms mesures a froid).
 * dynamicParams reste actif par defaut : un produit ajoute apres le build est
 * genere a la demande, puis mis en cache.
 */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

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
      images: product.images?.[0]?.src
        ? [{ url: product.images[0].src, alt: product.images[0].alt || name }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Un slug inconnu renvoyait 200 avec "Produit introuvable" : soft 404 pour Google.
  if (!product) notFound();

  const variations = product.type === "variable" ? await getVariations(product.id) : [];

  return <ProductDetail product={product} variations={variations} />;
}
