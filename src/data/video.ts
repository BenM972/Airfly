/**
 * Video de presentation de l'ecole.
 *
 * Metadonnees verifiees le 17 septembre 2026 sur la chaine @airfly323 : titre
 * et auteur par oEmbed, date par le flux Atom de la chaine, duree par la page
 * de lecture (48 061 ms).
 *
 * `titre` est le titre YouTube, repris tel quel dans le balisage parce que
 * `VideoObject.name` doit designer la video telle qu'elle existe. `legende` est
 * ce que lit le visiteur : la video date de 2020 et le spot n'a pas change,
 * mais afficher "saison 2020" en gros sur une page qui vend des cours en 2026
 * vieillirait la page pour rien. La date reste dans le balisage, ou elle est
 * exacte et attendue.
 *
 * A remplacer par une capsule tournee a la reouverture : changer l'identifiant,
 * la date, la duree et la miniature suffit.
 */
export const videoEcole = {
  id: "M_2wGThLM4E",
  titre: "Teaser Airfly saison 2020",
  legende: "L'ecole et le spot de Pointe Faula, en images",
  description:
    "Presentation en images de l'ecole de kitesurf Airfly et du spot de Pointe Faula, au Vauclin (Martinique) : la zone ecole sur les hauts fonds de Massy Massy, l'eau plate derriere la barriere de corail, et les cours encadres avec bateau de securite.",
  /** Date de publication sur YouTube, au format ISO. */
  publieeLe: "2020-04-06",
  /** ISO 8601, comme l'attend `VideoObject.duration`. */
  duree: "PT48S",
  /** Miniature rapatriee dans /public : pas de dependance a i.ytimg.com. */
  miniature: "/video-teaser-airfly.jpg",
  miniatureLargeur: 1280,
  miniatureHauteur: 720,
} as const;
