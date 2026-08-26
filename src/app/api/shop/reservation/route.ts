import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { guardFormSubmission } from "@/lib/formGuard";
import { isHoneypotFilled } from "@/lib/honeypot";
import { getResend, mailBcc, mailFrom, mailTo } from "@/lib/email";
import { boutiqueAccuse, boutiqueInterne } from "@/lib/emails/modeles";

type CartItem = { name: string; variante: string | null; qty: number };

export async function POST(req: NextRequest) {
  const blocked = guardFormSubmission(req, "shop-reservation");
  if (blocked) return blocked;

  const data = await req.json();

  // Champ leurre rempli : reponse identique a un succes, aucune ecriture.
  if (isHoneypotFilled(data)) {
    console.warn("[shop-reservation] honeypot declenche, soumission ignoree");
    return NextResponse.json({ ok: true });
  }

  const { prenom, nom, email, telephone, date_retrait, creneau, items } = data;

  if (!prenom || !nom || !email || !items?.length) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  const articlesText = (items as CartItem[])
    .map((i) => `${i.qty}× ${i.name}${i.variante ? ` — ${i.variante}` : ""}`)
    .join("\n");

  try {
    const { error: insertError } = await getSupabase().from("shop_reservations").insert({
      prenom,
      nom,
      email,
      telephone: telephone ?? null,
      articles: articlesText,
      date_retrait: date_retrait || null,
      creneau: creneau || null,
    });
    if (insertError) throw insertError;
  } catch (err) {
    console.error("[shop-reservation] erreur enregistrement:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Notifications. La reservation est enregistree : un echec d'envoi ne doit
  // plus la faire passer pour perdue, sinon le client resoumet et cree un
  // doublon. Chaque envoi est isole — une adresse client qui rebondit ne doit
  // pas priver la boutique de sa notification.
  const recuLe = new Date().toLocaleString("fr-FR", { timeZone: "America/Martinique" });
  const pourModele = {
    prenom: String(prenom),
    nom: String(nom),
    email: String(email),
    telephone: telephone ? String(telephone) : null,
    articles: articlesText,
    date_retrait: date_retrait || null,
    creneau: creneau || null,
  };

  try {
    const copiesCachees = mailBcc();
    await getResend().emails.send({
      from: mailFrom(),
      to: mailTo(),
      // Champ omis si aucune copie n'est configuree : Resend refuse un tableau vide.
      ...(copiesCachees.length ? { bcc: copiesCachees } : {}),
      replyTo: String(email),
      subject: `Nouvelle reservation click & collect — ${prenom} ${nom}`,
      html: boutiqueInterne(pourModele, recuLe),
    });
  } catch (emailErr) {
    console.error("[shop-reservation] email interne:", emailErr);
  }

  try {
    await getResend().emails.send({
      from: mailFrom(),
      to: String(email),
      subject: "Votre reservation click & collect — Airfly",
      html: boutiqueAccuse(pourModele),
    });
  } catch (emailErr) {
    console.error("[shop-reservation] accuse client:", emailErr);
  }


  return NextResponse.json({ ok: true });
}
