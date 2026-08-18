import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Type de fichier non autorise" }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (10 Mo max)" }, { status: 413 });
  }

  const user = process.env.WP_APP_USER!;
  const pass = process.env.WP_APP_PASSWORD!;
  const credentials = Buffer.from(`${user}:${pass}`).toString("base64");

  const bytes = await file.arrayBuffer();

  // Nettoie le nom de fichier : pas de chemin, pas de guillemet dans l'en-tete.
  const safeName = file.name.replace(/[^\w.\-]/g, "_").slice(-100) || "upload";

  const res = await fetch(`${process.env.WC_URL}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Content-Type": file.type,
    },
    body: bytes,
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.message ?? "Upload failed" }, { status: res.status });

  return NextResponse.json({ id: data.id, src: data.source_url, alt: data.alt_text ?? "" });
}
