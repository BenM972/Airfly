import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://airfly972.com";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/shop`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/ecole`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  },
];

async function fetchProductSlugs(): Promise<string[]> {
  const url = process.env.WC_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (!url || !key || !secret) return [];

  try {
    const params = new URLSearchParams({
      consumer_key: key,
      consumer_secret: secret,
      per_page: "100",
      status: "publish",
      _fields: "slug",
    });

    const res = await fetch(`${url}/wp-json/wc/v3/products?${params}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const products: { slug: string }[] = await res.json();
    return products.map((p) => p.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await fetchProductSlugs();

  const productPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/shop/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...STATIC_PAGES, ...productPages];
}
