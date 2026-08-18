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
  /**
   * Identifiant stable, sert de cle React.
   * Sert aussi de cle d'historique dans la table `partner_clicks` :
   * le renommer remet le compteur de ce partenaire a zero, sans erreur visible.
   */
  slug: string;
  name: string;
  /** Accroche courte, une ligne */
  tagline: string;
  /** 2 a 3 phrases */
  description: string;
  /**
   * Photo du partenaire. Optionnelle, mais indissociable de son texte
   * alternatif : le type interdit d'en fournir une sans l'autre.
   * `src` est un chemin sous /public, ex "/partners/salty-lodge.jpg".
   * `alt` decrit ce que montre la photo, il ne repete pas le nom du
   * partenaire, deja porte par le titre juste a cote.
   */
  image?: { src: string; alt: string };
  /** Chemin sous /public. Absent = pas de logo, seul le nom en titre est affiche. */
  logo?: string;
  href: string;
  /** Affiche en Mirloanne : ecrire sans accent. */
  location: string;
  /**
   * Trois atouts au maximum, phrases courtes. Au-dela, le bloc perd sa
   * lisibilite et concurrence la description.
   */
  atouts?: string[];
  /**
   * URL d'integration du calendrier de disponibilites (Lodgify pour Salty
   * Lodge). Absente = aucun calendrier affiche.
   *
   * Le widget n'est charge qu'au clic du visiteur : un moteur de reservation
   * tiers depose des cookies des son chargement, et le site n'a ni bandeau de
   * consentement ni politique de confidentialite.
   */
  calendrierUrl?: string;
};

export const partners: Partner[] = [
  {
    slug: "salty-lodge",
    name: "Salty Lodge",
    tagline: "Villas et bungalows à deux pas du lagon",
    description:
      "À deux cents mètres du lagon de Pointe Faula, Salty Lodge propose des villas avec piscine privée et des bungalows neufs, tout équipés. De quoi poser ses sacs à cinq minutes du spot, et n'avoir plus qu'à traverser la plage le matin.",
    image: {
      src: "/partners/salty-lodge.webp",
      alt: "Bungalow en bois bleu avec terrasse couverte, deux transats sur la pelouse et palmiers",
    },
    logo: "/partners/salty-lodge-logo.webp",
    href: "https://saltylodge.fr/",
    location: "Pointe Faula, Le Vauclin",
    atouts: [
      "200 m du lagon",
      "Villas avec piscine privée",
      "Bungalows neufs tout équipés",
    ],
  },
];
