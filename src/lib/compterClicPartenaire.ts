/**
 * Enregistre un clic sortant vers un partenaire.
 *
 * Le depart du visiteur prime : pas de preventDefault, pas d'await avant la
 * navigation. `keepalive` assure l'envoi pendant l'ouverture du nouvel onglet.
 * Un echec de comptage ne doit jamais remonter au visiteur.
 *
 * Cette fonction existe parce que le comptage vivait auparavant en clair dans
 * PartnerCard : la refonte visuelle de la carte l'a emporte sans que rien ne le
 * signale, et le compteur du back office est reste muet. Toute carte qui mene
 * chez un partenaire doit appeler ceci.
 */
export function compterClicPartenaire(slug: string): void {
  try {
    fetch("/api/partners/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Volontairement muet.
  }
}
