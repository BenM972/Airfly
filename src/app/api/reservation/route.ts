import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { guardFormSubmission } from "@/lib/formGuard";
import { isHoneypotFilled } from "@/lib/honeypot";
import { getResend, mailBcc, mailFrom, mailTo } from "@/lib/email";
import { ecoleAccuse, ecoleInterne } from "@/lib/emails/modeles";
import { requireAdmin } from "@/lib/adminAuth";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SubmissionRow {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  discipline: string;
  prestation: string;
  niveau: string;
  date_souhaitee: string | null;
  creneau: string;
  message: string;
  ip: string;
}

// Ces identifiants servent de cles primaires Supabase : Date.now()+Math.random()
// n'offre aucune garantie d'unicite, randomUUID en donne une.
function generateId(): string {
  return crypto.randomUUID();
}

// ─── Handler POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const blocked = guardFormSubmission(req, "reservation");
  if (blocked) return blocked;

  try {
    const body = await req.json();

    // Champ leurre rempli : on renvoie la meme reponse qu'un succes, sans rien
    // enregistrer. Un bot a qui l'on repond "erreur" adapte son prochain envoi.
    if (isHoneypotFilled(body)) {
      console.warn("[reservation] honeypot declenche, soumission ignoree");
      return NextResponse.json({ success: true, id: generateId() });
    }

    const { prenom, nom, email, telephone, discipline, prestation, niveau, date_souhaitee, creneau, message } = body;

    // Validation
    if (!prenom || !nom || !email || !discipline || !prestation) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const submissionId = generateId();
    const now = new Date().toISOString();

    const submission: SubmissionRow = {
      id: submissionId,
      created_at: now,
      prenom: String(prenom).trim(),
      nom: String(nom).trim(),
      email: String(email).trim().toLowerCase(),
      telephone: String(telephone ?? "").trim(),
      discipline: String(discipline).trim(),
      prestation: String(prestation).trim(),
      niveau: String(niveau ?? "").trim(),
      date_souhaitee: date_souhaitee ? String(date_souhaitee).trim() : null,
      creneau: String(creneau ?? "").trim(),
      message: String(message ?? "").trim(),
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    };

    // 1. Insérer la submission brute
    const { error: subError } = await getSupabase().from("submissions").insert(submission);
    if (subError) throw subError;

    // 2. Tags automatiques
    const autoTags = ["prospect"];
    if (submission.discipline) autoTags.push(submission.discipline.toLowerCase());
    if (submission.niveau) autoTags.push(submission.niveau.toLowerCase());

    // 3. Upsert client (dedup par email)
    const { data: existingClients } = await getSupabase()
      .from("clients")
      .select("*")
      .eq("email", submission.email)
      .limit(1);

    let clientId: string;

    if (existingClients && existingClients.length > 0) {
      const client = existingClients[0];
      clientId = client.id;

      const updatedDisciplines = Array.from(new Set([...client.disciplines, submission.discipline]));
      const updatedTags = Array.from(new Set([...client.tags, ...autoTags]));
      const newCount = client.nb_reservations + 1;
      if (newCount >= 3 && !updatedTags.includes("fidèle")) updatedTags.push("fidèle");

      const { error: updateError } = await getSupabase()
        .from("clients")
        .update({
          updated_at: now,
          last_contact: now,
          telephone: submission.telephone || client.telephone,
          disciplines: updatedDisciplines,
          tags: updatedTags,
          nb_reservations: newCount,
        })
        .eq("id", clientId);
      if (updateError) throw updateError;
    } else {
      clientId = generateId();
      const { error: insertError } = await getSupabase().from("clients").insert({
        id: clientId,
        created_at: now,
        updated_at: now,
        prenom: submission.prenom,
        nom: submission.nom,
        email: submission.email,
        telephone: submission.telephone,
        disciplines: submission.discipline ? [submission.discipline] : [],
        tags: autoTags,
        nb_reservations: 1,
        last_contact: now,
      });
      if (insertError) throw insertError;
    }

    // 4. Insérer la réservation liée au client
    const { error: resError } = await getSupabase().from("reservations").insert({
      id: generateId(),
      client_id: clientId,
      submission_id: submissionId,
      created_at: now,
      discipline: submission.discipline,
      prestation: submission.prestation,
      niveau: submission.niveau,
      date_souhaitee: submission.date_souhaitee,
      message: submission.message,
    });
    if (resError) throw resError;

    // 5. Notifications
    //
    // Deux envois : le bordereau vers la boutique, l'accuse de reception vers
    // le client. Chacun dans son propre try — une adresse client qui rebondit
    // ne doit pas priver la boutique de sa notification.
    //
    // Un echec n'interrompt rien : la demande est deja enregistree, et faire
    // echouer la requete ici pousserait le visiteur a resoumettre, donc a
    // creer un doublon.
    const recuLe = new Date(now).toLocaleString("fr-FR", { timeZone: "America/Martinique" });
    const pourModele = { ...submission, id: submissionId };

    try {
      const copiesCachees = mailBcc();
      await getResend().emails.send({
        from: mailFrom(),
        to: mailTo(),
        // Champ omis si aucune copie n'est configuree : Resend refuse un tableau vide.
        ...(copiesCachees.length ? { bcc: copiesCachees } : {}),
        replyTo: submission.email,
        subject: `Nouvelle demande — ${submission.discipline} — ${submission.prenom} ${submission.nom}`,
        html: ecoleInterne(pourModele, recuLe),
      });
    } catch (emailErr) {
      console.error("[reservation] email interne:", emailErr);
    }

    try {
      await getResend().emails.send({
        from: mailFrom(),
        to: submission.email,
        subject: "Votre demande de cours — Airfly",
        html: ecoleAccuse(pourModele),
      });
    } catch (emailErr) {
      console.error("[reservation] accuse client:", emailErr);
    }


    return NextResponse.json({ success: true, id: submissionId });
  } catch (err) {
    console.error("[reservation] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// ─── Handler GET — stats rapides (back office uniquement) ────────────────────
export async function GET(req: NextRequest) {
  // Ces chiffres sont des donnees commerciales : nombre de demandes, de clients,
  // repartition par discipline. Aucun appel public ne les consomme.
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const [{ count: totalSubmissions }, { count: totalClients }, { data: disciplineRows }, { count: fideles }] =
      await Promise.all([
        getSupabase().from("submissions").select("*", { count: "exact", head: true }),
        getSupabase().from("clients").select("*", { count: "exact", head: true }),
        getSupabase().from("submissions").select("discipline"),
        getSupabase().from("clients").select("*", { count: "exact", head: true }).contains("tags", ["fidèle"]),
      ]);

    const disciplineCount = (disciplineRows ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.discipline] = (acc[r.discipline] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      total_submissions: totalSubmissions ?? 0,
      total_clients: totalClients ?? 0,
      disciplines: disciplineCount,
      fideles: fideles ?? 0,
    });
  } catch (err) {
    console.error("[reservation] GET error:", err);
    return NextResponse.json({ error: "Erreur lecture données." }, { status: 500 });
  }
}
