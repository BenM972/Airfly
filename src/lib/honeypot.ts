/**
 * Nom du champ leurre, partage entre les formulaires et les routes API.
 * Volontairement pas "website" / "url" : ces noms-la declenchent parfois
 * le remplissage automatique des navigateurs, ce qui piegerait de vrais clients.
 */
export const HONEYPOT_FIELD = "site_web";

/** Le champ est invisible pour un humain : s'il est rempli, c'est un bot. */
export function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const value = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}
