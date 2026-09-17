/**
 * Fermeture temporaire de la boutique.
 *
 * `jusquAu` est le DERNIER jour de fermeture, pas le jour de reouverture :
 * c'est ce qu'attend `validThrough` dans les donnees structurees. La boutique
 * rouvre donc le lendemain, et le libelle le dit explicitement — "jusqu'au 16"
 * seul laisserait hesiter sur le jour de reprise.
 *
 * `jusquAu` est une date ISO, utilisee telle quelle par les donnees
 * structurees. `libelle` est la phrase lue par le visiteur et s'affiche telle
 * quelle : les deux doivent designer le meme jour.
 *
 * Mettre `FERMETURE` a `null` supprime l'annonce partout. Ce n'est plus
 * indispensable : passe `jusquAu`, `getFermeture()` renvoie `null` de lui-meme.
 */
const FERMETURE: { motif: string; libelle: string; jusquAu: string } | null = {
  motif: "Vacances annuelles",
  libelle: "Fermée jusqu'au 16 octobre — réouverture le 17",
  jusquAu: "2026-10-16",
};

/**
 * La fermeture en cours, ou `null` si la date de reouverture est passee.
 *
 * C'est une fonction, et pas une constante, pour une raison precise : une
 * constante evaluee a l'import reste figee tant que le processus vit. Le
 * serveur aurait continue d'annoncer "fermee jusqu'au 16 octobre" le 17, et
 * `/llms.txt` — un fichier fait pour etre mis en cache par des modeles — aurait
 * pu le repeter longtemps apres. Ici la comparaison se refait a chaque rendu.
 *
 * Les pages statiques qui l'affichent declarent `revalidate` pour que la
 * bascule se produise sans redeploiement.
 *
 * Comparaison en chaines ISO : `jusquAu` est de la forme AAAA-MM-JJ, et l'ordre
 * lexicographique de ce format est l'ordre chronologique. Cela evite un fuseau
 * horaire implicite, qui aurait fait basculer la date a 20 h aux Antilles.
 */
export function getFermeture() {
  if (!FERMETURE) return null;
  const aujourdhui = new Date().toLocaleDateString("en-CA", { timeZone: "America/Martinique" });
  return aujourdhui > FERMETURE.jusquAu ? null : FERMETURE;
}
