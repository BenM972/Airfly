import { tarifs } from "./tarifs";

/**
 * Questions frequentes de l'ecole — source unique de la page et du JSON-LD.
 *
 * Pourquoi ce fichier existe. L'audit GEO du 17 septembre 2026 a mesure que
 * aucun passage du site n'atteignait la longueur qu'un moteur conversationnel
 * reprend : le paragraphe le plus long faisait 73 mots, la mediane 25. Le
 * contenu n'etait pas trop court en volume, il etait trop fragmente — une suite
 * d'etiquettes et de puces, rien qui se cite seul. Les reponses ci-dessous font
 * 40 a 60 mots et se suffisent a elles-memes : chacune nomme son sujet plutot
 * que de dire "il" ou "ici", parce qu'un extrait cite arrive sans son contexte.
 *
 * Regle de redaction : rien n'est invente. Chaque affirmation vient soit d'une
 * page deja publiee, soit d'une reponse directe de l'ecole. Les quatre
 * questions que seule l'ecole pouvait trancher — age minimum, savoir nager,
 * nombre de cours pour etre autonome, location de materiel — ont ete posees et
 * repondues le 17 septembre 2026, et ajoutees ensuite.
 *
 * La reponse sur la location ne donne aucun tarif : la grille n'existe pas
 * encore. Elle renvoie au telephone et au formulaire, et ne promet pas de date
 * de publication — une promesse datee vieillit mal, comme l'a montre la ligne
 * de fermeture ecrite en dur dans /llms.txt. Quand la grille sera connue, la
 * location meritera sa propre section, pas seulement une reponse.
 *
 * Les prix sont lus dans `tarifs.ts` pour la meme raison qu'ailleurs : un prix
 * recopie a la main finit par contredire la grille affichee, et le balisage
 * doit decrire ce que le visiteur voit.
 */

const prix = (discipline: keyof typeof tarifs, label: string) =>
  tarifs[discipline].find((t) => t.label === label)?.price ?? "sur demande";

export type QuestionFrequente = { question: string; reponse: string };

export const questionsFrequentes: QuestionFrequente[] = [
  {
    question: "Où se trouve l'école de kitesurf Airfly en Martinique ?",
    reponse:
      "Airfly se trouve sur la plage de Pointe Faula, au Vauclin (97280), sur la côte atlantique de la Martinique. L'école navigue sur les hauts fonds de Massy Massy, au large de la plage. Le surf shop est sur le même site, en bord de plage.",
  },
  {
    question: "Quels sports Airfly enseigne-t-il ?",
    reponse:
      "Airfly enseigne trois disciplines à Pointe Faula : le kitesurf, le wingfoil et le kitefoil. Chacune dispose de ses propres formules — cours collectif, cours solo, cours duo — ainsi que de séances tractées derrière bateau ou sur simulateur, qui permettent de progresser même sans vent.",
  },
  {
    question: "Combien coûte un cours de kitesurf à la Martinique chez Airfly ?",
    reponse: `Chez Airfly, un cours collectif de kitesurf de 3 heures coûte ${prix("Kitesurf", "Cours collectif")}, avec trois élèves au maximum. Le cours solo de 2 heures, en encadrement exclusif, est à ${prix("Kitesurf", "Cours solo")}. Le cours duo revient à ${prix("Kitesurf", "Cours duo")}, pour un groupe déjà constitué.`,
  },
  {
    question: "Combien d'élèves y a-t-il par cours ?",
    reponse:
      "Le cours collectif de kitesurf d'Airfly est limité à trois élèves, et le cours collectif de wingfoil à deux élèves. Cette limite est la règle de l'école : elle permet au moniteur de suivre chacun individuellement sur l'eau et de garder le groupe en sécurité.",
  },
  {
    question: "Y a-t-il un âge minimum pour apprendre le kitesurf ?",
    reponse:
      "Airfly n'impose pas d'âge minimum pour apprendre le kitesurf, le wingfoil ou le kitefoil. La seule condition est de savoir nager. Le kitesurf est un sport de finesse et de technique plutôt que de force : la condition physique n'est pas un prérequis, et le moniteur adapte son enseignement à chaque élève.",
  },
  {
    question: "Combien de cours faut-il pour être autonome en kitesurf ?",
    reponse:
      "Il n'y a pas de nombre de cours fixe : l'autonomie dépend de la progression de chacun. Certains élèves avancent vite, d'autres ont besoin de plus de temps sur l'eau, et les conditions de vent du jour comptent aussi. Le moniteur fait le point avec vous à chaque session.",
  },
  {
    question: "Le matériel est-il fourni pendant les cours ?",
    reponse:
      "Oui. Airfly fournit l'ensemble de l'équipement nécessaire au cours : casque radio, gilet, chaussons, planche et aile. L'élève n'a rien à apporter ni à louer. Un bateau de sécurité accompagne chaque session sur le spot de Pointe Faula.",
  },
  {
    question: "Faut-il une licence ou une assurance pour prendre un cours ?",
    reponse:
      "Une licence FFVL ou FFV est requise pour suivre un cours chez Airfly ; elle inclut l'assurance en responsabilité civile. Une assurance personnelle couvrant la pratique du kitesurf est également acceptée à la place de la licence. Les moniteurs de l'école sont diplômés FFVL et FFV.",
  },
  {
    question: "Faut-il une combinaison pour naviguer en Martinique ?",
    reponse:
      "Non. L'eau de Pointe Faula est chaude toute l'année et l'on navigue en short et lycra, sans combinaison néoprène. C'est l'une des particularités du spot martiniquais par rapport aux spots métropolitains, où la combinaison est indispensable une grande partie de l'année.",
  },
  {
    question: "Quelle est la meilleure saison pour le kitesurf en Martinique ?",
    reponse:
      "Le vent souffle régulièrement entre 12 et 20 nœuds sur le spot de Pointe Faula, avec une saison forte de novembre à mai portée par les alizés. Airfly enseigne toute l'année, et les séances tractées derrière bateau permettent de progresser même lorsque le vent manque.",
  },
  {
    question: "Le spot de Pointe Faula convient-il aux débutants ?",
    reponse:
      "Oui, et c'est ce qui en fait un spot d'apprentissage reconnu. La barrière de corail au large casse la houle et crée une eau plate, sans vague. Le banc de sable permet d'avoir pied sur une grande partie de la zone école, et les zones de navigation sont balisées par arrêté préfectoral.",
  },
  {
    question: "Airfly loue-t-il du matériel de kitesurf ou de wingfoil ?",
    reponse:
      "Oui, Airfly propose de la location de matériel sur le spot de Pointe Faula. Les tarifs et les disponibilités varient selon la saison et le matériel demandé : ils sont communiqués sur demande, par téléphone au +596 596 76 25 31 ou depuis le formulaire de contact du site.",
  },
  {
    question: "Comment acheter du matériel dans le surf shop Airfly ?",
    reponse:
      "Le surf shop Airfly fonctionne en retrait sur place, à Pointe Faula : les articles se règlent et se retirent en boutique, sans prépaiement. Il n'y a pas de vente en ligne. Une demande passée depuis le site réserve l'article, elle ne le paie pas.",
  },
];
