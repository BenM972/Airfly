/**
 * La Martinique est a UTC-4 toute l'annee : le territoire n'observe pas
 * l'heure d'ete. Sans ce decalage, un clic du 31 a 21h locales (soit le 1er
 * a 01h UTC) serait compte sur le mois suivant.
 */
const DECALAGE_MARTINIQUE_MS = 4 * 60 * 60 * 1000;

/** Instant correspondant au 1er du mois courant, 00h00 en Martinique. */
export function debutDuMoisMartinique(now: Date = new Date()): Date {
  const local = new Date(now.getTime() - DECALAGE_MARTINIQUE_MS);
  const debutLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1);
  return new Date(debutLocal + DECALAGE_MARTINIQUE_MS);
}
