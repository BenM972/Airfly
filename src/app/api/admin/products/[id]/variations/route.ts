import { NextRequest, NextResponse } from "next/server";

const wcBase = () => `${process.env.WC_URL}/wp-json/wc/v3`;
const wcParams = (extra: Record<string, string> = {}) =>
  new URLSearchParams({
    consumer_key: process.env.WC_CONSUMER_KEY!,
    consumer_secret: process.env.WC_CONSUMER_SECRET!,
    ...extra,
  }).toString();

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${wcBase()}/products/${id}/variations?${wcParams({ per_page: "100" })}`, { cache: "no-store" });
  return NextResponse.json(await res.json());
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${wcBase()}/products/${id}/variations?${wcParams()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
