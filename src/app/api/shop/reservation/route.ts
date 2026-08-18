import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { guardFormSubmission } from "@/lib/formGuard";
import { isHoneypotFilled } from "@/lib/honeypot";
import { escapeHtml, getResend, mailFrom, mailTo } from "@/lib/email";

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

  const articlesHTML = (items as CartItem[])
    .map((i) => `<li><strong>${escapeHtml(i.qty)}×</strong> ${escapeHtml(i.name)}${i.variante ? ` — <em>${escapeHtml(i.variante)}</em>` : ""}</li>`)
    .join("");

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

  // La reservation est enregistree : un echec d'email ne doit plus la faire
  // passer pour perdue, sinon le client resoumet et cree un doublon.
  try {
    await getResend().emails.send({
      from: mailFrom(),
      to: mailTo(),
      replyTo: String(email),
      subject: `Nouvelle reservation click & collect — ${prenom} ${nom}`,
      html: `
        <h2>Nouvelle reservation click &amp; collect</h2>
        <h3>Articles :</h3>
        <ul>${articlesHTML}</ul>
        <hr/>
        <p><strong>Client :</strong> ${escapeHtml(prenom)} ${escapeHtml(nom)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Tel :</strong> ${escapeHtml(telephone) || "—"}</p>
        <p><strong>Date souhaitee :</strong> ${escapeHtml(date_retrait) || "—"}</p>
        <p><strong>Creneau :</strong> ${escapeHtml(creneau) || "—"}</p>
      `,
    });
  } catch (emailErr) {
    console.error("[shop-reservation] erreur email:", emailErr);
  }

  return NextResponse.json({ ok: true });
}
