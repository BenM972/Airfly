# Avancement — site Airfly

Journal de travail de BM Consulting sur le site Next.js d'Airfly.
Couvre la période du 12 au 21 août 2026. Le site lui-même a été construit en
mai 2026 ; ce document part de l'audit qui a ouvert la reprise.

Les mesures SEO détaillées vivent à part, dans `../../airfly972-audit/` :
`FULL-AUDIT-REPORT.md`, `PHASE-1-RESULTS.md`, `CORRECTIFS-COMPLETS.md`.

---

## État au 21/08/2026

Site déployé sur `honeydew-yak-792807.hostingersite.com`, commit `ac45454`.
Vérifié en ligne : toutes les pages en 200, les 27 fiches produit liées depuis
la boutique en 200, feuille de style servie correctement.

Score de santé SEO : **34 → 81 / 100** (protocole dans `PHASE-1-RESULTS.md`).

---

## Sécurité

| | |
|---|---|
| `/api/admin/*` et `/api/chat` | fermées ; `proxy.ts` remplace `middleware.ts`, comparaison à temps constant dans `src/lib/adminAuth.ts` |
| Limitation de débit | sur les deux formulaires (`src/lib/rateLimit.ts`) |
| Pot de miel | sur les deux formulaires (`src/lib/honeypot.ts`) |
| Tables Supabase | RLS activée sans aucune politique, donc fermées à la clé anon ; seule `heartbeat` est lisible |
| En-têtes | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS |

Pas de Content-Security-Policy : le widget Windguru et les styles en ligne
imposent une passe dédiée, page par page.

**Découverte au passage** : `src/app/api/admin/media/route.ts` n'avait jamais
été commité — la règle `media/` du `.gitignore` l'avalait. Le durcissement de
sécurité n'était donc pas dans le dépôt.

## SEO

Refonte des fiches produit en composants serveur avec `generateMetadata`,
JSON-LD (LocalBusiness, Product+Offer, BreadcrumbList, Service, CollectionPage),
sitemap, robots, canoniques, textes alternatifs, hiérarchie des titres.

Un slug inconnu renvoie désormais 404 et non 200 : les soft 404 trompaient
Google.

## Fonctionnalités ajoutées

**Partenaires** (13/08, 20/08) — Salty Lodge en grande carte photo, Le Village
de la Pointe en carte compacte. Le champ `niveau` de `src/data/partners.ts`
décide du rendu, pas la position dans le tableau.

**Compteur de clics partenaires** (13/08) — table `partner_clicks`, route
`/api/partners/click`, affichage dans `/admin`. Le mois court à l'heure de
Martinique (UTC−4). Un compteur indisponible affiche `—` et non `0`.

**Maintien Supabase** (15/08) — le projet gratuit se mettait en pause. Un
workflow GitHub lit la table `heartbeat` toutes les 72 heures. Seule la clé
anon est dans les secrets, et uniquement parce que les tables sont fermées.

**Pages légales** (18/08, 20/08) — mentions légales et politique de
confidentialité, liées depuis les deux variantes du pied de page, en
`noindex, follow` et hors sitemap. La politique ne décrit que les traitements
réels : pas de paiement en ligne, pas de mesure d'audience.

**Bandeau d'annonce** (18/08) — défilement à 65 s par cycle, durée centralisée
dans `--duree-defilement`. Contenu dans `src/data/annonce.ts`, `null` pour le
retirer.

**Soldes −30 %** (18/08) — appliquées via `AIRFLY/soldes/appliquer-soldes.mjs`.
Les prix d'origine sont sauvegardés dans `prix-avant-soldes.json`.
**Pour lever les soldes : `node annuler-soldes.mjs --appliquer`.**

**Courriels** (18/08) — tous les formulaires vers `info@airfly972.com`, copie à
`contact@bmconsultingfwi.fr` le temps de la vérification.

## Bugs corrigés

**`submissions.creneau` n'existait pas en base.** Chaque demande de
réservation échouait en erreur 42703 depuis mai 2026, et était perdue. Le
fichier de schéma décrivait une colonne que la base n'avait pas ;
`CREATE TABLE IF NOT EXISTS` ne l'aurait jamais rattrapée.

**Prix soldés faux dans la grille boutique.** Les produits variables portent
leur prix sur les variantes : la grille affichait 359 € là où la fiche
affichait 251,30 €.

**Widgets Windguru muets après navigation** (18/08, 20/08). Deux causes
distinctes : le script de prévisions est une fonction auto-exécutée que
`next/script` dédoublonnait par son URL, et `WgsWidget()` est protégée par une
garde jamais effacée. Chaque montage crée désormais un conteneur au nom neuf,
ce qui ne dépend plus du fonctionnement interne des scripts tiers.

**Six fiches produit en 404** (20/08). `wcGet` rattrapait toute erreur et
renvoyait un tableau vide : un produit absent et un WooCommerce injoignable
donnaient le même résultat, et la page traduisait ce vide en 404 gravé dans la
sortie statique. `wcFetch` lève désormais, et `getProductBySlug` ne renvoie
`null` que sur une réponse effectivement vide.

**Comptage de clics disparu** (20/08). La refonte visuelle de la carte
partenaire (`93594ea`) avait emporté le `onClick` et l'appel à l'API. La route
et la table étaient intactes mais plus rien ne les alimentait : le compteur ne
pouvait qu'afficher zéro. L'appel vit maintenant dans
`src/lib/compterClicPartenaire.ts`.

## Déploiement — deux pièges coûteux

Trois déploiements ont échoué avant de comprendre. À lire avant toute mise en
ligne.

**Le WordPress WooCommerce ne tient pas les rafales du build.** Hébergement
mutualisé : il répond 500 dès qu'on l'interroge en parallèle, alors que les
mêmes requêtes passées une par une répondent 200 en moins d'une seconde.
Plafonner les processus puis les appels simultanés n'a pas suffi. Le prérendu
des fiches produit a donc été supprimé : elles sont générées à la première
visite puis mises en cache 5 minutes — 1,9 s la première fois, 5 à 9 ms
ensuite. **Ne pas réintroduire `generateStaticParams` sur `/shop/[slug]`.**

**Le cache CDN doit être purgé après chaque déploiement.** Next posait
`s-maxage=31536000` sur les pages prérendues, soit un an de cache partagé —
il écrit cela en supposant que la plateforme purge, ce que fait Vercel et pas
Hostinger. Or chaque build renomme les fichiers CSS et JS et supprime les
précédents : un nœud qui sert l'ancien HTML réclame des fichiers disparus, et
la page s'affiche entièrement sans style. Le symptôme est **intermittent**,
une visite sur deux selon le nœud atteint, ce qui le rend très trompeur.

`next.config.mjs` pose désormais `public, max-age=0, must-revalidate` sur les
documents publics — `_next/`, `/api` et `/admin` exclus. La revalidation
s'appuie sur l'ETag : 304 et zéro octet. Cela évite la récidive mais ne vide
pas un cache déjà rempli.

Pour vérifier une mise en ligne, compter les versions sur dix requêtes :

```bash
for i in $(seq 1 10); do
  curl -s https://honeydew-yak-792807.hostingersite.com/ \
    | grep -o '/_next/static/chunks/[^"]*\.css' | head -1
done | sort | uniq -c
```

Une seule ligne = purge réussie. Une URL avec chaîne de requête contourne le
cache et joint l'origine, ce qui distingue un problème de CDN d'un problème de
build.

---

## Reste à faire

**Sécurité, prioritaire.** La clé WooCommerce a fuité dans une trace d'erreur,
puis a été passée en écriture. **À régénérer et à révoquer.**

**Avant la bascule du nom de domaine**
- Resend : nouveau compte, vérifier `send.airfly972.com` — **sous-domaine, jamais l'apex**, sinon les MX Google sont écrasés et le courriel est perdu
- Reporter les 15 variables de `.env.example` chez Hostinger ; `WC_URL`,
  `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` et `NEXT_PUBLIC_SITE_URL` sont lues
  **pendant** le build
- Abaisser le TTL de 3600 à 300, puis changer l'enregistrement A et le CNAME
  www. **Ne jamais toucher aux MX.** Script de contrôle dans
  `AIRFLY/dns-airfly972/verifier-bascule.sh`
- Plan de redirections depuis les anciennes URL Squarespace

**Divers**
- Confirmer au Village de la Pointe l'usage de leur photo
- Lever les soldes en fin de saison
- Vérifier la région Supabase pour la clause de transfert hors UE
- Différés : `?cat=soins` non lié, `ChatBot.tsx` code mort, descriptions
  produits, section FAQ, fiche Google Business, passe CSP
