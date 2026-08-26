import { getSupabase } from "@/lib/supabase";

/**
 * Lecture des demandes pour le back office.
 *
 * Deux tables, deux formes, un seul cycle de vie : en attente, puis confirmee
 * ou annulee. Le type `Demande` les reunit pour que la page n'ait pas a savoir
 * de laquelle vient chaque ligne, sauf la ou l'affichage differe reellement.
 */

export type Statut = "en_attente" | "confirmee" | "annulee";

export type DemandeEcole = {
  origine: "ecole";
  id: string;
  created_at: string;
  statut: Statut;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  discipline: string;
  prestation: string;
  niveau: string | null;
  date_souhaitee: string | null;
  creneau: string | null;
  message: string | null;
  date_confirmee: string | null;
  creneau_confirme: string | null;
  traite_le: string | null;
};

export type DemandeBoutique = {
  origine: "boutique";
  id: string;
  created_at: string;
  statut: Statut;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  articles: string;
  date_retrait: string | null;
  creneau: string | null;
  traite_le: string | null;
};

export type Demande = DemandeEcole | DemandeBoutique;

/**
 * Les demandes des deux tables, les plus recentes en tete.
 *
 * Les deux lectures sont menees de front : les enchainer doublerait l'attente
 * pour rien, elles ne dependent pas l'une de l'autre.
 *
 * En cas d'erreur sur une table, on renvoie ce qu'on a et on le signale. Une
 * page de back office a demi remplie reste utile ; une page en erreur ne l'est
 * pas. `partiel` permet a l'appelant de le dire au lecteur plutot que de lui
 * laisser croire que la liste est complete.
 */
export async function getDemandes(limite = 100): Promise<{ demandes: Demande[]; partiel: boolean }> {
  const sb = getSupabase();
  const [ecole, boutique] = await Promise.all([
    sb.from("submissions").select("*").order("created_at", { ascending: false }).limit(limite),
    sb.from("shop_reservations").select("*").order("created_at", { ascending: false }).limit(limite),
  ]);

  if (ecole.error) console.error("[demandes] lecture submissions:", ecole.error);
  if (boutique.error) console.error("[demandes] lecture shop_reservations:", boutique.error);

  const demandes: Demande[] = [
    ...(ecole.data ?? []).map((d) => ({ ...d, origine: "ecole" as const })),
    ...(boutique.data ?? []).map((d) => ({ ...d, origine: "boutique" as const })),
  ] as Demande[];

  demandes.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return { demandes, partiel: Boolean(ecole.error || boutique.error) };
}

/** Nom de la table portant une origine donnee. */
export function tablePour(origine: Demande["origine"]): "submissions" | "shop_reservations" {
  return origine === "ecole" ? "submissions" : "shop_reservations";
}

/** Libelle lisible d'un statut, pour l'affichage. */
export const LIBELLE_STATUT: Record<Statut, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
};
