/**
 * Bandeau d'annonce affiche en haut de toutes les pages.
 *
 * `null` = aucun bandeau, et la navbar reprend sa place d'elle-meme : la
 * hauteur reservee vient de la variable CSS --h-annonce, pas d'une valeur
 * ecrite dans les composants.
 *
 * Pour le remettre, renseigner l'objet ci-dessous. Le texte defile en boucle,
 * `href` est facultatif et rend le bandeau cliquable :
 *
 *   export const annonce = {
 *     titre: "Reouverture le 17 octobre",
 *     detail: "L equipe vous attend a Pointe Faula",
 *     href: "/shop",
 *   };
 */
export const annonce: { titre: string; detail: string; href?: string } | null = null;
