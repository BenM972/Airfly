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
 * Ecrire "Reouverture jusqu'au 17 octobre" dirait l'inverse de ce qu'on veut.
 * La formulation retenue leve aussi l'ambiguite du "jusqu'au", qui laisse
 * hesiter entre le 17 et le 18.
 */
export const fermeture: { motif: string; libelle: string; jusquAu: string } | null = {
  motif: "Vacances annuelles",
  libelle: "Fermée jusqu'au 17 octobre inclus",
  jusquAu: "2026-10-17",
};
