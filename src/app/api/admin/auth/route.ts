import { NextRequest, NextResponse } from "next/server";
import { safeEqual } from "@/lib/adminAuth";
import { clientIp, rateLimit, resetRateLimit, tooManyRequests } from "@/lib/rateLimit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

export async function POST(req: NextRequest) {
  const key = `admin-login:${clientIp(req)}`;
  const limit = rateLimit(key, MAX_ATTEMPTS, WINDOW_MS);
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const expectedPassword = process.env.ADMIN_PASSWORD;
  const token = process.env.ADMIN_SECRET_TOKEN;

  // Sans secrets configures, aucune connexion possible.
  // (Avant ce garde-fou, un ADMIN_PASSWORD absent laissait passer un corps vide.)
  if (!expectedPassword || !token) {
    console.error("[admin/auth] ADMIN_PASSWORD ou ADMIN_SECRET_TOKEN manquant");
    return NextResponse.json({ error: "Authentification indisponible" }, { status: 503 });
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
  }

  if (typeof password !== "string" || !safeEqual(password, expectedPassword)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  resetRateLimit(key);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_token");
  return res;
}
