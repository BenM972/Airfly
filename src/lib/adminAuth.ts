import { NextRequest, NextResponse } from "next/server";

/**
 * Comparaison a temps constant, en JS pur pour rester compatible
 * avec le runtime Edge (middleware) comme avec Node (routes API).
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isAdmin(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  const expected = process.env.ADMIN_SECRET_TOKEN;
  if (!token || !expected) return false;
  return safeEqual(token, expected);
}

/**
 * A appeler en tete de chaque handler /api/admin/*.
 * Renvoie une reponse 401 si la requete n'est pas authentifiee, sinon null.
 * Double barriere avec le middleware : si le matcher casse, les routes tiennent.
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  if (isAdmin(req)) return null;
  return NextResponse.json({ error: "Non autorise" }, { status: 401 });
}
