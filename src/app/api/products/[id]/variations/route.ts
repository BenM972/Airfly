import { NextRequest, NextResponse } from "next/server";

const WC_URL = process.env.WC_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const searchParams = new URLSearchParams({
    consumer_key: WC_CONSUMER_KEY!,
    consumer_secret: WC_CONSUMER_SECRET!,
    per_page: "100",
  });

  const res = await fetch(`${WC_URL}/wp-json/wc/v3/products/${id}/variations?${searchParams}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Variations not found" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
