import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ─── Chemins des fichiers de données ────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const CLIENTS_FILE = path.join(DATA_DIR, "clients.json");

// ─── Types ───────────────────────────────────────────────────────────────────
interface Submission {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  discipline: string;
  prestation: string;
  niveau: string;
  date_souhaitee: string;
  message: string;
  ip: string;
}

interface Reservation {
  id: string;
  date: string;
  discipline: string;
  prestation: string;
  niveau: string;
  date_souhaitee: string;
  message: string;
}

interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  disciplines: string[];
  tags: string[];
  reservations: Reservation[];
  nb_reservations: number;
  last_contact: string;
}

// ─── Helpers fichiers ────────────────────────────────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Logique BDD clients ─────────────────────────────────────────────────────
function upsertClient(clients: Client[], submission: Submission): Client[] {
  const now = new Date().toISOString();
  const existing = clients.find(
    (c) => c.email.toLowerCase() === submission.email.toLowerCase()
  );

  const reservation: Reservation = {
    id: submission.id,
    date: submission.created_at,
    discipline: submission.discipline,
    prestation: submission.prestation,
    niveau: submission.niveau,
    date_souhaitee: submission.date_souhaitee,
    message: submission.message,
  };

  // Tags automatiques
  const tags: string[] = [];
  if (submission.discipline) tags.push(submission.discipline.toLowerCase());
  if (submission.niveau) tags.push(submission.niveau.toLowerCase());

  if (existing) {
    existing.updated_at = now;
    existing.last_contact = now;
    existing.telephone = submission.telephone || existing.telephone;
    existing.reservations.push(reservation);
    existing.nb_reservations += 1;
    if (!existing.disciplines.includes(submission.discipline)) {
      existing.disciplines.push(submission.discipline);
    }
    // Merge tags sans doublons
    for (const tag of tags) {
      if (!existing.tags.includes(tag)) existing.tags.push(tag);
    }
    // Tag fidélité
    if (existing.nb_reservations >= 3 && !existing.tags.includes("fidèle")) {
      existing.tags.push("fidèle");
    }
    return clients;
  }

  const newClient: Client = {
    id: generateId(),
    created_at: now,
    updated_at: now,
    prenom: submission.prenom,
    nom: submission.nom,
    email: submission.email,
    telephone: submission.telephone,
    disciplines: submission.discipline ? [submission.discipline] : [],
    tags: ["prospect", ...tags],
    reservations: [reservation],
    nb_reservations: 1,
    last_contact: now,
  };

  return [...clients, newClient];
}

// ─── Handler POST ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { prenom, nom, email, telephone, discipline, prestation, niveau, date_souhaitee, message } = body;

    if (!prenom || !nom || !email || !discipline || !prestation) {
      return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    const submission: Submission = {
      id: generateId(),
      created_at: new Date().toISOString(),
      prenom: String(prenom).trim(),
      nom: String(nom).trim(),
      email: String(email).trim().toLowerCase(),
      telephone: String(telephone ?? "").trim(),
      discipline: String(discipline).trim(),
      prestation: String(prestation).trim(),
      niveau: String(niveau ?? "").trim(),
      date_souhaitee: String(date_souhaitee ?? "").trim(),
      message: String(message ?? "").trim(),
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    };

    ensureDataDir();

    // 1. Log toutes les submissions
    const submissions = readJSON<Submission[]>(SUBMISSIONS_FILE, []);
    submissions.push(submission);
    writeJSON(SUBMISSIONS_FILE, submissions);

    // 2. Upsert BDD clients
    const clients = readJSON<Client[]>(CLIENTS_FILE, []);
    const updatedClients = upsertClient(clients, submission);
    writeJSON(CLIENTS_FILE, updatedClients);

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error("[reservation] error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

// ─── Handler GET — stats rapides ─────────────────────────────────────────────
export async function GET() {
  try {
    ensureDataDir();
    const submissions = readJSON<Submission[]>(SUBMISSIONS_FILE, []);
    const clients = readJSON<Client[]>(CLIENTS_FILE, []);

    const disciplineCount = submissions.reduce<Record<string, number>>((acc, s) => {
      acc[s.discipline] = (acc[s.discipline] ?? 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      total_submissions: submissions.length,
      total_clients: clients.length,
      disciplines: disciplineCount,
      fideles: clients.filter((c) => c.tags.includes("fidèle")).length,
    });
  } catch {
    return NextResponse.json({ error: "Erreur lecture données." }, { status: 500 });
  }
}
