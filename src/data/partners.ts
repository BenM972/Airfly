/**
 * Partenaires affiches sur la page d'accueil.
 * Ajouter un partenaire = ajouter une entree ici, aucun composant a modifier.
 *
 * `image` et `logo` sont des chemins sous /public. Les fichiers sont heberges
 * localement et non appeles chez le partenaire : next.config.mjs restreint
 * remotePatterns, et un lien direct casserait a la premiere reorganisation
 * de leur site.
 */
export type Partner = {
  /** Identifiant stable, sert de cle React */
  slug: string;
  name: string;
  /** Accroche courte, une ligne */
  tagline: string;
  /** 2 a 3 phrases */
  description: string;
  /** Chemin sous /public, ex "/partners/salty-lodge.jpg". Vide = pas de photo. */
  image: string;
  /** Chemin sous /public. Vide = pas de logo, le nom sert de repli. */
  logo: string;
  href: string;
  /** Affiche en Mirloanne : ecrire sans accent. */
  location: string;
};

export const partners: Partner[] = [];
