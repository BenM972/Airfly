# Section Partenaires — plan d'implémentation

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE — utiliser superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour dérouler ce plan tâche par tâche. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** Afficher sur la page d'accueil un bloc présentant les partenaires d'Airfly, à commencer par Salty Lodge, avec redirection vers leur site.

**Architecture :** Une section serveur (`PartnersSection`) alimentée par une liste de données statique (`src/data/partners.ts`), qui rend une carte client animée par partenaire (`PartnerCard`). La section ne se rend pas quand la liste est vide, ce qui permet de livrer le code avant de disposer des visuels.

**Pile technique :** Next.js 16 (App Router, Server Components), React 19, Tailwind CSS 4, framer-motion, next/image.

## Contraintes globales

- **La police Mirloanne ne contient aucun glyphe accentué.** Tout texte affiché avec `style={{ fontFamily: "Mirloanne, serif" }}` doit être écrit sans accent — c'est la raison des libellés « Reserver un cours » et « Ecole » existants, et du `normalize("NFD")` dans `src/components/shop/ProductDetail.tsx`. Le corps de texte utilise Cormorant ou la police système et accepte les accents normalement.
- **Fond de section :** `bg-[#f5f0e8]`, identique à `AboutSection`, `SpotSection` et `MeteoSection`.
- **Animation d'apparition :** `useInView(ref, { once: true, margin: "-80px" })` + `framer-motion`, comme les sections existantes.
- **Aucun framework de test dans ce projet.** La vérification passe par `npx tsc --noEmit`, `npm run lint`, `npm run build` et des assertions `curl` sur le HTML servi par `npm start`. Ne pas installer de framework de test.
- **Liens sortants :** `target="_blank"` et `rel="noopener noreferrer"`. **Pas** de `rel="sponsored"` — le partenariat est éditorial, sans contrepartie financière.
- **Aucune donnée structurée décrivant un partenaire.** Décision de conception documentée dans la spec.
- Spec de référence : `docs/superpowers/specs/2026-08-13-partenariat-salty-lodge-design.md`

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `src/data/partners.ts` (créer) | Type `Partner` et liste `partners`. Seule source de vérité du contenu. |
| `src/components/PartnerCard.tsx` (créer) | Rendu d'un partenaire. Client, pour l'animation au scroll. |
| `src/components/PartnersSection.tsx` (créer) | Enveloppe de section : fond, titre, itération. Serveur. |
| `src/app/page.tsx` (modifier) | Insertion de la section entre `SpotSection` et `MeteoSection`. |
| `public/partners/` (créer) | Visuels fournis par le partenaire. |

---

### Tâche 1 : Module de données

**Fichiers :**
- Créer : `src/data/partners.ts`

**Interfaces :**
- Produit : le type `Partner` (champs `slug`, `name`, `tagline`, `description`, `href`, `location` en `string` ; `image` optionnel sous la forme `{ src: string; alt: string }`, indissociable de son texte alternatif ; `logo` en `string` optionnel) et la constante `partners: Partner[]`, consommés par les tâches 2 et 3.

La liste démarre **vide**. Elle sera garnie en tâche 4, à réception des visuels. C'est ce qui permet de livrer les tâches 1 à 3 sans rien afficher de cassé en production.

- [ ] **Étape 1 : Créer le fichier**

```ts
// src/data/partners.ts

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
};

export const partners: Partner[] = [];
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY" && npx tsc --noEmit
```

Attendu : aucune sortie, code de retour 0.

- [ ] **Étape 3 : Commit**

```bash
git add src/data/partners.ts
git commit -m "feat(partenaires): type Partner et liste de partenaires"
```

---

### Tâche 2 : Carte partenaire

**Fichiers :**
- Créer : `src/components/PartnerCard.tsx`

**Interfaces :**
- Consomme : le type `Partner` de `src/data/partners.ts` (tâche 1).
- Produit : le composant par défaut `PartnerCard`, qui reçoit `{ partner: Partner; index: number }`. Consommé par la tâche 3. `index` sert uniquement à alterner le sens de la grille.

Composant client : `useInView` et `motion` en ont besoin. Il ne fait pas d'appel réseau et ne porte aucun état — son balisage est donc bien présent dans le HTML rendu côté serveur.

- [ ] **Étape 1 : Créer le composant**

```tsx
// src/components/PartnerCard.tsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import type { Partner } from "@/data/partners";

type Props = {
  partner: Partner;
  /** Position dans la liste : les index impairs inversent le sens de la grille. */
  index: number;
};

export default function PartnerCard({ partner, index }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reversed = index % 2 === 1;

  return (
    <motion.article
      ref={ref}
      className="md:grid md:grid-cols-2 md:gap-16 items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Photo — le ratio explicite evite tout decalage de mise en page */}
      {partner.image && (
        <div
          className={`relative aspect-[4/3] overflow-hidden shadow-xl mb-8 md:mb-0 ${
            reversed ? "md:order-2" : ""
          }`}
        >
          <Image
            src={partner.image}
            alt={`${partner.name}, ${partner.location}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}

      <div>
        {/* Hauteur fixe : n'importe quel ratio de logo s'y insere sans
            deformer ni decaler les cartes entre elles */}
        {partner.logo && (
          <div className="relative h-12 w-40 mb-6">
            <Image
              src={partner.logo}
              alt={partner.name}
              fill
              sizes="160px"
              className="object-contain object-left"
            />
          </div>
        )}

        <h3
          className="text-gray-900 text-2xl md:text-3xl font-light mb-2"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.name}
        </h3>

        <p
          className="text-gray-900 text-lg mb-3"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {partner.tagline}
        </p>

        {/* Mirloanne : le contenu de location doit etre sans accent */}
        <p
          className="text-xs uppercase tracking-widest text-gray-500 mb-6"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          {partner.location}
        </p>

        <p className="text-gray-700 text-base leading-relaxed mb-8">
          {partner.description}
        </p>

        {/* Libelle en Mirloanne : sans accent, d'ou "Decouvrir" */}
        <a
          href={partner.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-gray-900 text-gray-900 uppercase tracking-widest text-xs px-8 py-3 hover:bg-gray-900 hover:text-white transition-colors duration-300"
          style={{ fontFamily: "Mirloanne, serif" }}
        >
          Decouvrir {partner.name}
        </a>
      </div>
    </motion.article>
  );
}
```

- [ ] **Étape 2 : Vérifier compilation et lint**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY" && npx tsc --noEmit && npm run lint
```

Attendu : `tsc` sans sortie ; `npm run lint` termine sur `0 errors` (des avertissements préexistants sont normaux, il y en a 28 sur ce projet).

- [ ] **Étape 3 : Commit**

```bash
git add src/components/PartnerCard.tsx
git commit -m "feat(partenaires): carte partenaire animee"
```

---

### Tâche 3 : Section et intégration

**Fichiers :**
- Créer : `src/components/PartnersSection.tsx`
- Modifier : `src/app/page.tsx`

**Interfaces :**
- Consomme : `partners` (tâche 1), `PartnerCard` (tâche 2), et `SectionTitle` existant depuis `src/components/SectionTitle.tsx`.
- Produit : le composant par défaut `PartnersSection`, sans props.

La section et son insertion vont ensemble : le composant n'est observable qu'une fois monté dans la page, et un relecteur ne rejetterait pas l'un en acceptant l'autre.

- [ ] **Étape 1 : Créer la section**

```tsx
// src/components/PartnersSection.tsx
import SectionTitle from "./SectionTitle";
import PartnerCard from "./PartnerCard";
import { partners } from "@/data/partners";

/**
 * Composant serveur : contenu statique, indexable, sans etat.
 * Ne rend rien tant qu'aucun partenaire n'est renseigne, ce qui permet de
 * livrer le code avant de disposer des visuels.
 */
export default function PartnersSection() {
  if (partners.length === 0) return null;

  return (
    <section id="partenaires" className="bg-[#f5f0e8] py-24 px-10 md:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionTitle title="Partenaires" className="mb-12" />

        <div className="space-y-20">
          {partners.map((partner, i) => (
            <PartnerCard key={partner.slug} partner={partner} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Étape 2 : Insérer dans la page d'accueil**

Dans `src/app/page.tsx`, ajouter l'import puis le composant **entre `<SpotSection />` et `<MeteoSection />`**. Le fichier complet après modification :

```tsx
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import SpotSection from "@/components/SpotSection";
import PartnersSection from "@/components/PartnersSection";
import MeteoSection from "@/components/MeteoSection";
import JsonLd from "@/components/JsonLd";
import { localBusinessSchema } from "@/lib/schema";

export default function Home() {
  return (
    <main>
      <JsonLd data={localBusinessSchema()} />
      <Hero />
      <AboutSection />
      <SpotSection />
      <PartnersSection />
      <MeteoSection />
    </main>
  );
}
```

- [ ] **Étape 3 : Vérifier que la section est bien absente quand la liste est vide**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY" && npx tsc --noEmit && npm run lint && npm run build
pkill -f "next start"; (npm start > /tmp/partners-check.log 2>&1 &) ; sleep 14
curl -s http://localhost:3000/ | grep -c 'id="partenaires"'
```

Attendu : `tsc` sans sortie, lint à `0 errors`, build réussi, et le `grep -c` renvoie **0** — la liste est vide, donc la section ne doit pas apparaître.

- [ ] **Étape 4 : Arrêter le serveur**

```bash
pkill -f "next start"; pkill -f "next-server"
```

- [ ] **Étape 5 : Commit**

```bash
git add src/components/PartnersSection.tsx src/app/page.tsx
git commit -m "feat(partenaires): section sur la page d'accueil"
```

---

### Tâche 4 : Activation avec Salty Lodge

**Bloquée** tant que les visuels ne sont pas reçus de Salty Lodge.

**Fichiers :**
- Créer : `public/partners/salty-lodge.jpg`, `public/partners/salty-lodge-logo.png`
- Modifier : `src/data/partners.ts`

**Interfaces :**
- Consomme : le type `Partner` (tâche 1) et le rendu des tâches 2 et 3. Aucun code de composant n'est modifié.

- [ ] **Étape 1 : Déposer les visuels**

Placer les fichiers reçus dans `public/partners/`. Contrat à respecter :

| Fichier | Format | Dimensions | Poids |
|---|---|---|---|
| `salty-lodge.jpg` | JPEG ou WebP, paysage | ~1600 × 1200 | < 400 Ko |
| `salty-lodge-logo.png` | PNG transparent ou SVG | hauteur ≥ 200 px | < 100 Ko |

Contrôler le poids :

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY" && ls -lh public/partners/
```

Si la photo dépasse 400 Ko, la recompresser avant de continuer.

- [ ] **Étape 2 : Renseigner le partenaire**

Remplacer `export const partners: Partner[] = [];` dans `src/data/partners.ts` par :

```ts
export const partners: Partner[] = [
  {
    slug: "salty-lodge",
    name: "Salty Lodge",
    tagline: "Villas et bungalows à deux pas du lagon",
    description:
      "À deux cents mètres du lagon de Pointe Faula, Salty Lodge propose des villas avec piscine privée et des bungalows neufs. De quoi poser ses sacs à cinq minutes du spot, et n'avoir plus qu'à traverser la plage le matin.",
    image: {
      src: "/partners/salty-lodge.jpg",
      alt: "Villa avec piscine privée, Salty Lodge, Pointe Faula",
    },
    logo: "/partners/salty-lodge-logo.png",
    href: "https://saltylodge.fr/",
    location: "Pointe Faula, Le Vauclin",
  },
];
```

`location` est affiché en Mirloanne : il reste sans accent. `tagline`, `description` et `image.alt` utilisent la police du corps de texte et gardent leurs accents.

`image.alt` doit décrire **ce que montre la photo**, pas répéter le nom du partenaire — celui-ci est déjà lu juste à côté par un lecteur d'écran. Ajuster le texte à la photo réellement reçue.

Ce texte est une proposition rédigée dans le ton du site. Le faire relire par le client et par Salty Lodge avant mise en ligne.

- [ ] **Étape 3 : Vérifier le rendu serveur**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY" && npx tsc --noEmit && npm run lint && npm run build
pkill -f "next start"; (npm start > /tmp/partners-check.log 2>&1 &) ; sleep 14
curl -s http://localhost:3000/ > /tmp/home-partners.html
echo "section        : $(grep -c 'id="partenaires"' /tmp/home-partners.html)"
echo "nom partenaire : $(grep -c 'Salty Lodge' /tmp/home-partners.html)"
echo "lien sortant   : $(grep -c 'href="https://saltylodge.fr/"' /tmp/home-partners.html)"
echo "rel correct    : $(grep -c 'rel="noopener noreferrer"' /tmp/home-partners.html)"
echo "pas sponsored  : $(grep -c 'sponsored' /tmp/home-partners.html)"
echo "h3 present     : $(grep -c '<h3' /tmp/home-partners.html)"
```

Attendu : `section` = 1, `nom partenaire` ≥ 1, `lien sortant` = 1, `rel correct` ≥ 1, `pas sponsored` = **0**, `h3 present` ≥ 1.

Le contenu doit être présent dans ce HTML **sans exécution de JavaScript** : c'est la preuve que la section est indexable.

- [ ] **Étape 4 : Contrôler le rendu visuel**

Ouvrir `http://localhost:3000/#partenaires` dans un navigateur et vérifier :

- Le logo est visible sur le fond beige `#f5f0e8`. **S'il est clair et disparaît**, envelopper le conteneur du logo dans `PartnerCard.tsx` avec `bg-white px-4 py-2` et refaire le contrôle.
- Sur mobile (largeur < 768 px), la photo passe au-dessus du texte et rien ne déborde horizontalement.
- Aucun décalage de mise en page au chargement de la photo.

- [ ] **Étape 5 : Arrêter le serveur**

```bash
pkill -f "next start"; pkill -f "next-server"
```

- [ ] **Étape 6 : Commit**

```bash
git add public/partners src/data/partners.ts
git commit -m "feat(partenaires): activation de Salty Lodge"
```

---

## Hors périmètre

Ne pas implémenter, même si l'occasion semble se présenter :

- Tunnel ou formulaire de réservation de séjour
- Page dédiée `/sejour` ou `/partenaires`
- Données structurées décrivant Salty Lodge
- Entrée « Partenaires » dans le menu de navigation
- Toute offre tarifaire commune aux deux marques
- Installation d'un framework de test

## À signaler au client après implémentation

Salty Lodge cite déjà Airfly parmi ses partenaires. Vérifier que leur lien vers airfly972.com n'est pas en `nofollow`, faute de quoi l'échange de notoriété est à sens unique.
