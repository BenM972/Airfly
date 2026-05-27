import { NextRequest, NextResponse } from "next/server";

const wcBase = () => `${process.env.WC_URL}/wp-json/wc/v3`;
const wcParams = (extra: Record<string, string> = {}) =>
  new URLSearchParams({
    consumer_key: process.env.WC_CONSUMER_KEY!,
    consumer_secret: process.env.WC_CONSUMER_SECRET!,
    ...extra,
  }).toString();

export async function GET() {
  const res = await fetch(`${wcBase()}/products/categories?${wcParams({ per_page: "100" })}`, { cache: "no-store" });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${wcBase()}/products/categories?${wcParams()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
