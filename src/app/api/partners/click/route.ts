import { NextRequest, NextResponse } from "next/server";
import { partners } from "@/data/partners";
import { recordPartnerClick } from "@/lib/partnerClicks";
import { clientIp, isSameOrigin, rateLimit, tooManyRequests } from "@/lib/rateLimit";

// Route publique par necessite : c'est un visiteur anonyme qui l'appelle.
const PAR_IP = 30;
const FENETRE_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine non autorisee" }, { status: 403 });
  }

  const limite = rateLimit(`partner-click:${clientIp(req)}`, PAR_IP, FENETRE_MS);
  if (!limite.ok) return tooManyRequests(limite.retryAfter);

  let slug: unknown;
  try {
    ({ slug } = await req.json());
  } catch {
    return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
  }

  // Sans cette validation, n'importe qui pourrait remplir la table de slugs arbitraires.
  if (typeof slug !== "string" || !partners.some((p) => p.slug === slug)) {
    return NextResponse.json({ error: "Partenaire inconnu" }, { status: 400 });
  }

  try {
    await recordPartnerClick(slug);
  } catch (err) {
    // Le visiteur n'a rien a faire de ce resultat, et la reponse ne doit rien
    // reveler de l'etat de la base.
    console.error("[partner-click] enregistrement impossible:", err);
  }

  return new NextResponse(null, { status: 204 });
}
