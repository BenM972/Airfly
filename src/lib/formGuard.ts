import { clientIp, isSameOrigin, rateLimit, tooManyRequests } from "./rateLimit";

const PER_WINDOW = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 min
const PER_DAY = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Repli quand le proxy ne transmet pas l'IP du client : on applique un plafond
 * global au lieu d'un quota par IP. Sinon tous les visiteurs partageraient le
 * meme compteur et le 4e formulaire de la journee serait refuse a tout le monde.
 */
const UNKNOWN_IP_PER_WINDOW = 60;
let unknownIpWarned = false;

function forbidden() {
  return new Response(JSON.stringify({ error: "Origine non autorisee" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Garde-fou anti-spam pour les formulaires publics qui ecrivent en base
 * et declenchent un email. Renvoie une reponse d'erreur, ou null si la
 * requete peut continuer.
 */
export function guardFormSubmission(req: Request, scope: string): Response | null {
  if (!isSameOrigin(req)) return forbidden();

  const ip = clientIp(req);

  if (ip === "unknown") {
    if (!unknownIpWarned) {
      unknownIpWarned = true;
      console.warn(`[${scope}] IP client introuvable (x-forwarded-for absent) — plafond global applique.`);
    }
    const global = rateLimit(`${scope}:unknown`, UNKNOWN_IP_PER_WINDOW, WINDOW_MS);
    return global.ok ? null : tooManyRequests(global.retryAfter);
  }

  const short = rateLimit(`${scope}:w:${ip}`, PER_WINDOW, WINDOW_MS);
  if (!short.ok) return tooManyRequests(short.retryAfter);

  const daily = rateLimit(`${scope}:d:${ip}`, PER_DAY, DAY_MS);
  if (!daily.ok) return tooManyRequests(daily.retryAfter);

  return null;
}
