import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getSupabase } from "@/lib/supabase";
import { getResend, mailFrom } from "@/lib/email";
import { tablePour, type Statut } from "@/lib/demandes";
import {
  boutiqueAnnulee,
  boutiquePrete,
  ecoleAnnulee,
  ecoleConfirmee,
  dateEnClair,
} from "@/lib/emails/modeles";

/**
 * Traitement d'une demande depuis le back office.
 *
 * C'est le seul endroit qui fait passer une demande de `en_attente` a
 * `confirmee` ou `annulee`, et c'est ce changement qui declenche le courriel au
 * client. Les deux vont ensemble : confirmer sans prevenir n'aurait aucun sens
 * pour le client, qui attend justement cette reponse.
 *
 * L'ecriture en base precede l'envoi. Si le courriel echoue, la demande reste
 * traitee et la boutique le voit dans la reponse : elle peut appeler le client.
 * L'inverse — envoyer puis echouer a enregistrer — laisserait un client
 * confirme et une demande toujours en attente.
 */

type Corps = {
  origine: "ecole" | "boutique";
  id: string;
  statut: Statut;
  /** Ecole uniquement : date et creneau REELLEMENT retenus. */
  date_confirmee?: string | null;
  creneau_confirme?: string | null;
};

export async function POST(req: NextRequest) {
  const refus = requireAdmin(req);
  if (refus) return refus;

  let corps: Corps;
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
  }

  const { origine, id, statut, date_confirmee, creneau_confirme } = corps;

  if (origine !== "ecole" && origine !== "boutique") {
    return NextResponse.json({ error: "Origine inconnue" }, { status: 400 });
  }
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  }
  if (statut !== "confirmee" && statut !== "annulee" && statut !== "en_attente") {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }
  // Confirmer un cours sans date n'a pas de sens : le courriel envoye au client
  // annoncerait une confirmation vide.
  if (origine === "ecole" && statut === "confirmee" && !date_confirmee) {
    return NextResponse.json({ error: "Date de confirmation requise" }, { status: 400 });
  }

  const table = tablePour(origine);
  const sb = getSupabase();

  // On relit la demande avant d'ecrire : il faut ses coordonnees pour le
  // courriel, et son etat precedent pour distinguer une premiere confirmation
  // d'une reprogrammation.
  const { data: avant, error: erreurLecture } = await sb.from(table).select("*").eq("id", id).single();
  if (erreurLecture || !avant) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  const reprogrammation =
    origine === "ecole" &&
    statut === "confirmee" &&
    avant.statut === "confirmee" &&
    (avant.date_confirmee !== date_confirmee || avant.creneau_confirme !== creneau_confirme);

  const misAJour: Record<string, unknown> = {
    statut,
    traite_le: new Date().toISOString(),
  };
  if (origine === "ecole") {
    misAJour.date_confirmee = statut === "confirmee" ? date_confirmee : null;
    misAJour.creneau_confirme = statut === "confirmee" ? creneau_confirme ?? null : null;
  }

  const { error: erreurEcriture } = await sb.from(table).update(misAJour).eq("id", id);
  if (erreurEcriture) {
    console.error("[admin/demandes] ecriture:", erreurEcriture);
    return NextResponse.json({ error: "Enregistrement impossible" }, { status: 500 });
  }

  // Repasser en attente est une correction interne : le client n'a rien a en
  // savoir, et recevrait un message incomprehensible.
  if (statut === "en_attente") {
    return NextResponse.json({ ok: true, courriel: "aucun" });
  }

  const { sujet, html } = composerCourriel({
    origine,
    statut,
    demande: avant,
    dateConfirmee: date_confirmee ?? null,
    creneauConfirme: creneau_confirme ?? null,
    reprogrammation,
  });

  try {
    await getResend().emails.send({
      from: mailFrom(),
      to: String(avant.email),
      subject: sujet,
      html,
    });
  } catch (err) {
    console.error("[admin/demandes] envoi au client:", err);
    // La demande EST traitee : on le dit, tout en signalant que le client n'a
    // pas ete prevenu. Renvoyer une erreur laisserait croire que rien n'a ete
    // enregistre, et la boutique recommencerait.
    return NextResponse.json({ ok: true, courriel: "echec" });
  }

  return NextResponse.json({ ok: true, courriel: "envoye" });
}

function composerCourriel({
  origine,
  statut,
  demande,
  dateConfirmee,
  creneauConfirme,
  reprogrammation,
}: {
  origine: "ecole" | "boutique";
  statut: "confirmee" | "annulee";
  demande: Record<string, unknown>;
  dateConfirmee: string | null;
  creneauConfirme: string | null;
  reprogrammation: boolean;
}): { sujet: string; html: string } {
  if (origine === "ecole") {
    const d = demande as unknown as Parameters<typeof ecoleConfirmee>[0];
    if (statut === "annulee") {
      return { sujet: "Votre demande de cours — Airfly", html: ecoleAnnulee(d) };
    }
    return {
      sujet: reprogrammation
        ? `Votre cours est reprogramme — ${dateEnClair(dateConfirmee)}`
        : `Cours confirme — ${dateEnClair(dateConfirmee)}`,
      html: ecoleConfirmee(d, dateConfirmee ?? "", creneauConfirme ?? "", reprogrammation),
    };
  }

  const d = demande as unknown as Parameters<typeof boutiquePrete>[0];
  return statut === "annulee"
    ? { sujet: "Votre reservation — Airfly", html: boutiqueAnnulee(d) }
    : { sujet: "Votre commande vous attend — Airfly", html: boutiquePrete(d) };
}
