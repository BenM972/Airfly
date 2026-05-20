import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

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
  message: string;
  ip: string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Handler POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prenom, nom, email, telephone, discipline, prestation, niveau, date_souhaitee, message } = body;

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

    return NextResponse.json({ success: true, id: submissionId });
  } catch (err) {
    console.error("[reservation] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// ─── Handler GET — stats rapides ─────────────────────────────────────────────
export async function GET() {
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
