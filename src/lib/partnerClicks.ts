import { partners } from "@/data/partners";
import { debutDuMoisMartinique } from "./dates";
import { getSupabase } from "./supabase";

const TABLE = "partner_clicks";

/** Compteurs par slug de partenaire. Un slug absent = lecture impossible. */
export type PartnerClickStats = Record<string, { mois: number; total: number }>;

export async function recordPartnerClick(slug: string): Promise<void> {
  const { error } = await getSupabase().from(TABLE).insert({
    id: crypto.randomUUID(),
    partner_slug: slug,
  });
  if (error) throw error;
}

/**
 * Deux requetes `count` par partenaire, jamais de rapatriement de lignes.
 * Un partenaire dont la lecture echoue est absent du resultat : l'affichage
 * distingue ainsi "aucun clic" (0) de "compteur indisponible" (absent).
 */
export async function getPartnerClickStats(): Promise<PartnerClickStats> {
  const debut = debutDuMoisMartinique().toISOString();
  const stats: PartnerClickStats = {};

  for (const partenaire of partners) {
    try {
      const sb = getSupabase();
      const base = () =>
        sb.from(TABLE).select("*", { count: "exact", head: true }).eq("partner_slug", partenaire.slug);

      const [total, mois] = await Promise.all([base(), base().gte("created_at", debut)]);

      if (total.error || mois.error) {
        console.error(`[partner-clicks] lecture impossible pour ${partenaire.slug}:`, total.error ?? mois.error);
        continue;
      }
      stats[partenaire.slug] = { total: total.count ?? 0, mois: mois.count ?? 0 };
    } catch (err) {
      console.error(`[partner-clicks] lecture impossible pour ${partenaire.slug}:`, err);
    }
  }

  return stats;
}
