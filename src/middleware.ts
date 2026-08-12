import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes API admin : 401 JSON, jamais de redirection.
  // /api/admin/auth est le point d'entree (connexion / deconnexion), il reste ouvert.
  if (pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/auth") return NextResponse.next();
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Pages admin : redirection vers le formulaire de connexion.
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAdmin(req)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
