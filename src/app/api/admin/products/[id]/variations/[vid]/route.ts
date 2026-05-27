import { NextRequest, NextResponse } from "next/server";

const wcBase = () => `${process.env.WC_URL}/wp-json/wc/v3`;
const wcParams = (extra: Record<string, string> = {}) =>
  new URLSearchParams({
    consumer_key: process.env.WC_CONSUMER_KEY!,
    consumer_secret: process.env.WC_CONSUMER_SECRET!,
    ...extra,
  }).toString();

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; vid: string }> }) {
  const { id, vid } = await params;
  const body = await req.json();
  const res = await fetch(`${wcBase()}/products/${id}/variations/${vid}?${wcParams()}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; vid: string }> }) {
  const { id, vid } = await params;
  const res = await fetch(`${wcBase()}/products/${id}/variations/${vid}?${wcParams({ force: "true" })}`, {
    method: "DELETE",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
