// Tarifs de l'ecole — source unique.
//
// Ces valeurs etaient auparavant ecrites deux fois : dans EcoleTarifs.tsx pour
// l'affichage, et dans schema.ts pour le JSON-LD. Les deux listes avaient
// diverge. L'audit du 8 septembre 2026 a mesure l'ecart : six offres declarees
// aux moteurs pour treize affichees sur la page. Rien de faux, mais la moitie
// du catalogue restait invisible pour Google.
//
// Les deux consommateurs lisent desormais ce fichier. Un prix modifie ici l'est
// partout, et le JSON-LD ne peut plus contredire la page — ce qui est une regle
// Google, pas une preference : le balisage doit decrire ce que l'utilisateur voit.

export const disciplines = ["Kitesurf", "Wingfoil", "Kitefoil"] as const;
export type Discipline = (typeof disciplines)[number];

export type Tarif = {
  label: string;
  detail: string;
  /** Tel qu'affiche : "115 €", "135 € / pers." ou "Sur demande". */
  price: string;
  badge?: string;
  note?: string;
};

export const tarifs: Record<Discipline, Tarif[]> = {
  Kitesurf: [
    { label: "Cours collectif", detail: "3h · 3 eleves max", price: "115 €", badge: "Populaire" },
    { label: "Navigation encadree", detail: "Session sur le spot · meme creneau que le cours collectif", price: "85 €", note: "Prestation distincte du cours collectif — les deux se deroulent sur le meme creneau." },
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "200 €" },
    { label: "Cours duo", detail: "2h · groupe constitue uniquement", price: "135 € / pers.", note: "Uniquement pour un groupe deja forme — deux personnes seules ne peuvent pas composer un duo." },
    { label: "Tracte / Simulateur", detail: "Waterstart & equilibre en traction douce sans gestion du kite", price: "Sur demande", note: "Ideal pour progresser rapidement ou s'entrainer sans vent. Tracte par bateau ou simulateur a terre." },
  ],
  Wingfoil: [
    { label: "Cours collectif", detail: "2h · 2 eleves max · individuel", price: "135 € / pers.", badge: "Populaire", note: "Pas besoin de venir a deux — les places sont ouvertes a tous." },
    { label: "Cours trio", detail: "3h · groupe constitue uniquement", price: "100 € / pers.", note: "Session reservee a un groupe deja forme de 3 personnes." },
    { label: "Initiation wing", detail: "1h30 · paddle avec une aile de wing · tous niveaux", price: "90 € / pers." },
    { label: "Tracte / Simulateur", detail: "Foil tracte derriere bateau — equilibre sans gestion de l'aile", price: "Sur demande", note: "Progresser sur le foil en conditions controlees, vent ou pas. Ideal en debut de formation." },
  ],
  Kitefoil: [
    { label: "Cours solo", detail: "2h · encadrement exclusif", price: "150 €", badge: "Recommande" },
    { label: "Cours duo", detail: "2h · 2 eleves", price: "135 € / pers." },
    { label: "Tracte / Simulateur", detail: "Foil tracte bateau · simulateur mast fixe · apprentissage accelere", price: "Sur demande", note: "La methode la plus rapide pour apprendre le kitefoil : simulateur mast fixe sur bateau ou traction douce — concentration totale sur l'equilibre et le pilotage." },
  ],
};

export const kiteLoyaltyRates = [
  { label: "Cours collectif", before: "115 €", after: "100 €" },
  { label: "Cours solo", before: "200 €", after: "175 €" },
  { label: "Cours duo", before: "135 € / pers.", after: "115 € / pers." },
];

export const options: { label: string; detail: string; price?: string; note?: string }[] = [
  { label: "Navigation encadree", detail: "Session accompagnee sur le spot", price: "85 €", note: "Incluse avec le cours collectif" },
  { label: "Depart de plage", detail: "Technique de lancement autonome", price: "85 €" },
  { label: "Coaching perfection", detail: "Tricks & progression avancee" },
];

/** Offre destinee au JSON-LD : prix numerique, libelle qualifie par la discipline. */
export type OffreSchema = { name: string; description: string; price: string };

/** "135 € / pers." -> "135" ; "Sur demande" -> null. */
function montant(prix: string | undefined): string | null {
  if (!prix) return null;
  const m = prix.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const valeur = Number.parseFloat(m[1].replace(",", "."));
  return Number.isFinite(valeur) && valeur > 0 ? String(valeur) : null;
}

/**
 * Les offres a declarer aux moteurs, derivees de ce qui est affiche.
 *
 * Deux categories sont volontairement absentes, et il ne faut pas les ajouter
 * sans y reflechir :
 *
 * - Les prestations "Sur demande" (tracte, simulateur, coaching). Une `Offer`
 *   sans `price` n'est pas exploitable par Google, et en inventer un serait une
 *   fausse declaration.
 * - Les tarifs fidelite, qui ne s'appliquent qu'a partir du quatrieme cours.
 *   Les declarer comme des offres ordinaires laisserait croire qu'elles sont
 *   ouvertes a tous, ce qui contredirait la page.
 */
export function offresPourSchema(): OffreSchema[] {
  const offres: OffreSchema[] = [];
  // Cle de deduplication : libelle nu + prix, sans la discipline. "Navigation
  // encadree" a 85 € figure a la fois dans la grille kitesurf et dans les
  // options : c'est la meme prestation presentee deux fois sur la page, elle ne
  // doit etre declaree qu'une fois. En revanche "Cours duo" a 135 € existe
  // reellement en kitesurf ET en kitefoil, avec des conditions differentes : la
  // discipline entre donc dans la cle pour les grilles, pas pour les options.
  const vues = new Set<string>();

  const ajouter = (name: string, cle: string, detail: string, prix: string | undefined) => {
    const price = montant(prix);
    if (!price || vues.has(`${cle}|${price}`)) return;
    vues.add(`${cle}|${price}`);
    offres.push({
      name,
      description: prix?.includes("pers.") ? `${detail} · prix par personne` : detail,
      price,
    });
  };

  for (const discipline of disciplines) {
    for (const t of tarifs[discipline]) {
      // Le libelle affiche ("Cours collectif") ne dit pas la discipline : elle
      // est portee par l'onglet actif. Le JSON-LD n'a pas d'onglet, donc on la
      // qualifie, sans quoi trois "Cours collectif" a des prix differents
      // cohabiteraient sans qu'on puisse les distinguer.
      ajouter(`${t.label} — ${discipline}`, `${t.label}|${discipline}`, t.detail, t.price);
    }
  }

  for (const o of options) {
    // Une option deja listee dans une grille, au meme prix, n'est pas une offre
    // supplementaire : on la reconnait a son libelle nu.
    const deja = disciplines.some((d) =>
      tarifs[d].some((t) => t.label === o.label && montant(t.price) === montant(o.price)),
    );
    if (deja) continue;
    ajouter(o.label, o.label, o.detail, o.price);
  }

  return offres;
}
