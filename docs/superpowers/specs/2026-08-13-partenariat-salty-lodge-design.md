# Section Partenaires — partenariat Salty Lodge

**Date** : 13 août 2026
**Statut** : conception validée

## Contexte

Salty Lodge (saltylodge.fr) héberge à Pointe Faula, Le Vauclin — le même spot qu'Airfly. Villas et bungalows avec piscine à 200 m du lagon, positionnement haut de gamme. Ils citent déjà Airfly parmi leurs partenaires et proposent un « KiteSurf Camp ».

La complémentarité est directe : ils ont les lits, Airfly a l'école et le matériel. Un élève venu de métropole se pose la question de l'hébergement ; aucune réponse n'existe aujourd'hui sur le site.

## Objectif

Présenter Salty Lodge comme partenaire hébergement officiel et renvoyer vers leur site. **Aucun tunnel de réservation côté Airfly.**

Le succès se mesure à une chose : un visiteur de la page d'accueil comprend qu'il peut dormir à deux pas du spot et sait où cliquer.

## Décisions

| Décision | Choix | Raison |
|---|---|---|
| Rôle | Vitrine + redirection | Pas de tunnel à construire ni à maintenir |
| Emplacement | Bloc sur la page d'accueil | Le trafic passe par l'accueil ; évite une page mince |
| Ton | Institutionnel | Partenaire officiel, sobre, sans offre commune engageante |
| Structure | Pilotée par une liste de données | D'autres partenaires suivront |
| Forme | Carte pleine largeur par partenaire, sens alterné | Seule forme qui tient avec un partenaire comme avec trois |
| Lien | Suivi, `rel="noopener noreferrer"` | Échange éditorial sans contrepartie financière |
| Menu | Pas de 5ᵉ entrée | La navbar desktop porte déjà 8 éléments |

## Architecture

### Données — `src/data/partners.ts`

```ts
export type Partner = {
  slug: string;        // "salty-lodge"
  name: string;        // "Salty Lodge"
  tagline: string;     // "Villas & bungalows à 200 m du lagon"
  description: string; // 2 à 3 phrases
  image?: { src: string; alt: string }; // photo optionnelle, indissociable de son alt
  logo?: string;       // "/partners/salty-lodge-logo.png", absent = pas de logo
  href: string;        // "https://saltylodge.fr/"
  location: string;    // "Pointe Faula, Le Vauclin"
};

export const partners: Partner[] = [ /* ... */ ];
```

Ajouter un partenaire = une entrée dans le tableau. Le composant ne change pas.

### Composants

**`src/components/PartnersSection.tsx`** — composant serveur. Rend `null` si `partners` est vide. Reprend le gabarit d'`AboutSection` et `SpotSection` : `<section id="partenaires" className="bg-[#f5f0e8] py-24 px-10 md:px-16">`, conteneur `max-w-7xl mx-auto`, `<SectionTitle title="Partenaires" className="mb-12" />`, puis la liste des cartes.

**`src/components/PartnerCard.tsx`** — composant client, pour l'animation d'apparition (`useInView` avec `{ once: true, margin: "-80px" }`, comme les autres sections).

Chaque carte est une grille `md:grid md:grid-cols-2 md:gap-16 items-center` :

- **Colonne visuelle** — photo en `next/image`, conteneur `relative aspect-[4/3] overflow-hidden shadow-xl`. L'aspect ratio explicite évite tout décalage de mise en page.
- **Colonne contenu** — logo dans un conteneur de hauteur fixe `h-12` (48 px), largeur automatique, image en `object-contain` : n'importe quel ratio de logo s'y insère sans déformation ni saut de hauteur d'une carte à l'autre. Puis le nom en `<h3>`, la localisation en petites capitales espacées (Mirloanne), la description, et le lien sortant au style des CTA du site (bordure fine, majuscules espacées, inversion au survol).

L'alternance du sens se fait par `md:order-2` appliqué à la colonne visuelle des index impairs. Sur mobile, tout s'empile avec la photo en premier.

### Intégration — `src/app/page.tsx`

`<PartnersSection />` entre `<SpotSection />` et `<MeteoSection />`.

L'enchaînement raconte une progression : voici le spot, voici où dormir à côté, voici le vent.

## Hiérarchie des titres

La page d'accueil porte un `<h1>` en `sr-only` et des `<h2>` via `SectionTitle`. La section suit : `<h2>Partenaires</h2>`, puis un `<h3>` par partenaire. Aucun niveau sauté.

## Référencement

**Pas de JSON-LD `LodgingBusiness` pour Salty Lodge.** Décrire l'entreprise d'un tiers en données structurées sur le domaine Airfly reviendrait à déclarer à Google des informations dont Airfly n'est pas la source — adresse, horaires, disponibilités non maîtrisées. Ces données appartiennent à leur site. Schema.org ne propose par ailleurs aucune relation « partenaire » exploitée par Google.

Le gain SEO vient d'ailleurs : contenu unique supplémentaire sur l'accueil, et vocabulaire que le site ne couvre pas encore — « hébergement », « villa », « bungalow », « séjour ».

## Accessibilité

- `alt` descriptif sur la photo (« Villa avec piscine, Salty Lodge, Pointe Faula »). Le logo est décoratif : son `alt` est vide, le nom étant déjà porté par le `<h3>`.
- Le lien sortant annonce sa destination dans son libellé, pas un « en savoir plus » nu.
- Contraste vérifié sur le fond `#f5f0e8`.

## Contrat sur les visuels

| Fichier | Format | Dimensions | Poids |
|---|---|---|---|
| `public/partners/salty-lodge.jpg` | JPEG ou WebP, paysage | ~1600 × 1200 | < 400 Ko |
| `public/partners/salty-lodge-logo.png` | PNG transparent ou SVG | hauteur ≥ 200 px | < 100 Ko |

Les fichiers sont hébergés localement, pas appelés chez le partenaire : `next.config.mjs` restreint désormais `remotePatterns`, et un lien direct vers leurs serveurs casserait à la première réorganisation de leur site.

**Si le logo est clair**, il disparaîtra sur le fond beige. À vérifier à réception ; le cas échéant, le placer sur un conteneur blanc.

## Gestion des cas limites

| Cas | Comportement |
|---|---|
| `partners` vide | La section ne se rend pas. Le code peut donc être mergé avant réception des visuels. |
| Photo manquante | La carte se rend sans la colonne visuelle plutôt que d'afficher une image cassée. |
| Logo manquant | Absent = pas de logo, seul le nom en titre est affiché. |

## Vérifications

- Le HTML serveur de `/` contient le nom du partenaire, sa description et le lien sortant.
- La section disparaît complètement quand `partners` est vide.
- Aucun décalage de mise en page : le conteneur photo porte un ratio explicite.
- `npm run lint` et `npx tsc --noEmit` passent.
- Le lien porte `target="_blank"` et `rel="noopener noreferrer"`, sans `sponsored`.

## Hors périmètre

- Tunnel ou formulaire de réservation de séjour
- Page dédiée `/sejour` ou `/partenaires`
- Données structurées décrivant le partenaire
- Entrée supplémentaire dans le menu
- Toute offre tarifaire commune

## À vérifier côté partenaire

Salty Lodge cite déjà Airfly. Vérifier que leur lien n'est pas en `nofollow` : sans quoi l'échange est à sens unique.
