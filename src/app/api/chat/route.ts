import { NextRequest, NextResponse } from "next/server";
import { clientIp, isSameOrigin, rateLimit, tooManyRequests } from "@/lib/rateLimit";

// Garde-fous anti-abus : cette route consomme le quota Groq du site.
const MAX_MESSAGES = 20;
const MAX_CONTENT_CHARS = 1000;
const PER_MINUTE = 8;
const PER_HOUR = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

/** Valide la conversation envoyee par le client : pas de role "system" injecte, pas de payload geant. */
function parseMessages(input: unknown): ChatMessage[] | null {
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_MESSAGES) return null;

  const messages: ChatMessage[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) return null;
    const { role, content } = raw as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.length === 0 || content.length > MAX_CONTENT_CHARS) return null;
    messages.push({ role, content });
  }
  return messages;
}

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Airfly, une école de glisse et surf shop située à Pointe Faula, Vauclin, en Martinique.

Tu aides les visiteurs sur deux aspects :

## ÉCOLE DE GLISSE
- Disciplines : Kitesurf, Wingfoil, Kitefoil — tous niveaux, tous âges
- Spot : hauts fonds de Massy Massy / Pointe Faula, eau plate, fond sableux, alizés 12-20 nœuds
- Max 3 élèves par session, bateau de sécurité, radio, matériel fourni
- Moniteurs diplômés FFVL/FFV

Tarifs Kitesurf : Cours groupe 3h = 115€ | Solo 2h = 200€ | Duo 2h = 135€/pers | À partir du 4ème cours = 100€
Tarifs Wingfoil : Duo 2h = 135€/pers | Trio 3h = 100€/pers | Initiation paddle 1h30 = 90€/pers
Tarifs Kitefoil : Solo 2h = 150€ | Duo 2h = 135€/pers
Options : Navigation guidée = 85€ | Départ de plage = 85€ | Coaching perfection = 100€
Licence FFVL ou FFV requise (assurance RC incluse)

## SHOP
- Deux univers : Textile (t-shirts, hoodies, shorts, lycras, tops techniques, casquettes) et Matériel (kitesurf, kite/wing foil, planches, harnais, accessoires)
- Marques : Salty Crew et autres marques surf/glisse
- Livraison possible, paiement sécurisé

## CONTACT & INFOS
- Lieu : Pointe Faula, Vauclin, Martinique (97280)
- Pour réserver un cours : formulaire sur la page École
- Instagram : @airfly972

## COMPORTEMENT
- Réponds en français, de manière chaleureuse et décontractée, comme un passionné de glisse
- Sois concis et direct
- Si tu ne sais pas quelque chose de précis, oriente vers le formulaire de contact ou Instagram
- N'invente jamais de prix ou d'informations non listées ici
- Tu peux utiliser des emojis avec modération 🤙`;

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Origine non autorisee" }, { status: 403 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[chat] GROQ_API_KEY manquant");
    return NextResponse.json({ error: "Assistant indisponible" }, { status: 503 });
  }

  const ip = clientIp(req);
  const perMinute = rateLimit(`chat:m:${ip}`, PER_MINUTE, 60 * 1000);
  if (!perMinute.ok) return tooManyRequests(perMinute.retryAfter);
  const perHour = rateLimit(`chat:h:${ip}`, PER_HOUR, 60 * 60 * 1000);
  if (!perHour.ok) return tooManyRequests(perHour.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requete invalide" }, { status: 400 });
  }

  const messages = parseMessages((body as { messages?: unknown } | null)?.messages);
  if (!messages) {
    return NextResponse.json({ error: "Conversation invalide" }, { status: 400 });
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI error" }, { status: res.status });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "Désolé, je n'ai pas pu répondre.";
  return NextResponse.json({ reply });
}
