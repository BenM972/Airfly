import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { prenom, nom, email, telephone, date_retrait, creneau, produit, variante } = data;

  if (!prenom || !nom || !email || !produit) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    await supabase.from("shop_reservations").insert({
      prenom,
      nom,
      email,
      telephone: telephone ?? null,
      produit,
      variante: variante ?? null,
      date_retrait: date_retrait ?? null,
      creneau: creneau ?? null,
    });

    await resend.emails.send({
      from: "Airfly <onboarding@resend.dev>",
      to: "contact@bmconsultingfwi.fr",
      subject: `Nouvelle reservation click & collect — ${produit}`,
      html: `
        <h2>Nouvelle reservation click &amp; collect</h2>
        <p><strong>Produit :</strong> ${produit}${variante ? ` — ${variante}` : ""}</p>
        <hr/>
        <p><strong>Client :</strong> ${prenom} ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Tel :</strong> ${telephone ?? "—"}</p>
        <p><strong>Date souhaitee :</strong> ${date_retrait ?? "—"}</p>
        <p><strong>Creneau :</strong> ${creneau ?? "—"}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
