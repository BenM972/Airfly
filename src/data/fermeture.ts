/**
 * Fermeture temporaire de la boutique.
 *
 * Mettre a `null` a la reouverture — aucun composant a modifier. Les horaires
 * habituels restent declares dans le pied de page et dans les donnees
 * structurees : ils reprennent d'eux-memes.
 *
 * `jusquAu` est une date ISO, utilisee telle quelle par les donnees
 * structurees (`validThrough`). `libelle` est la phrase lue par le visiteur et
 * s'affiche telle quelle : les deux doivent designer le meme jour.
 *
 * `jusquAu` est le DERNIER jour de fermeture, pas le jour de reouverture :
 * c'est ce qu'attend `validThrough` dans les donnees structurees. La boutique
 * rouvre donc le lendemain, et le libelle le dit explicitement — "jusqu'au 16"
 * seul laisserait hesiter sur le jour de reprise.
 */
export const fermeture: { motif: string; libelle: string; jusquAu: string } | null = {
  motif: "Vacances annuelles",
  libelle: "Fermée jusqu'au 16 octobre — réouverture le 17",
  jusquAu: "2026-10-16",
};
