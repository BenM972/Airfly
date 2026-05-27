import { NextRequest, NextResponse } from "next/server";

const wcBase = () => `${process.env.WC_URL}/wp-json/wc/v3`;
const wcAuth = () => ({
  consumer_key: process.env.WC_CONSUMER_KEY!,
  consumer_secret: process.env.WC_CONSUMER_SECRET!,
});

function wcParams(extra: Record<string, string> = {}) {
  const p = new URLSearchParams({ ...wcAuth(), ...extra });
  return p.toString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? "20";
  const search = searchParams.get("search") ?? "";

  const params = wcParams({ page, per_page, status: "any", ...(search ? { search } : {}) });
  const res = await fetch(`${wcBase()}/products?${params}`, { cache: "no-store" });
  const data = await res.json();
  const total = res.headers.get("X-WP-Total") ?? "0";
  const totalPages = res.headers.get("X-WP-TotalPages") ?? "1";

  return NextResponse.json({ products: data, total: Number(total), totalPages: Number(totalPages) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${wcBase()}/products?${wcParams()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
