import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.WC_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "";
  const per_page = searchParams.get("per_page") ?? "100";

  const params = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY!,
    consumer_secret: WC_CONSUMER_SECRET!,
    per_page,
    status: "publish",
    ...(category ? { category } : {}),
  });

  const res = await fetch(`${WC_URL}/wp-json/wc/v3/products?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "WooCommerce API error" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
