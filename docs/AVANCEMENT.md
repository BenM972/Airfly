# Avancement — site Airfly

Journal de travail de BM Consulting sur le site Next.js d'Airfly.
Couvre la période du 12 au 25 août 2026. Le site lui-même a été construit en
mai 2026 ; ce document part de l'audit qui a ouvert la reprise.

Les mesures SEO détaillées vivent à part, dans `../../airfly972-audit/` :
`FULL-AUDIT-REPORT.md`, `PHASE-1-RESULTS.md`, `CORRECTIFS-COMPLETS.md`.

---

## État au 25/08/2026

Site en ligne sur **`airfly972.com`**, en HTTPS, certificat valide.
Vérifié : toutes les pages en 200, les 27 fiches produit en 200, canoniques et
sitemap sur le domaine définitif, redirection `www` vers l'apex.
Formulaires opérationnels, notifications envoyées depuis `info@airfly972.com`.

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


## Migration du domaine — 25/08/2026

Transfert d'`airfly972.com` d'IONOS vers Hostinger, bascule du site sur le
domaine définitif, et mise en service des notifications par courriel. Journée
difficile : deux coupures de messagerie et une indisponibilité partielle du
site. Tout est rétabli. Les causes valent d'être connues.

### Coupure 1 — IONOS supprime la zone au transfert

Les serveurs de noms avaient été volontairement conservés chez IONOS pendant
le transfert, pour ne rien changer au DNS. IONOS a néanmoins **supprimé la
zone** en perdant le domaine : ses serveurs répondaient `REFUSED` alors que la
délégation pointait toujours vers eux. Plus de MX, plus de site, environ deux
heures.

**Conserver les serveurs de noms ne protège que si l'ancien hébergeur continue
de servir la zone.** IONOS ne le fait pas. La zone a été recréée chez
Hostinger, MX en premier, puis la délégation basculée.

### Coupure 2 — une boîte mail Hostinger écrase les MX Google

Créer `hello@airfly972.com` dans hPanel a remplacé les trois MX Google par
ceux d'Hostinger. Le courrier de `info@` a cessé d'arriver jusqu'au
rétablissement manuel.

**Un domaine n'a qu'un seul jeu de MX, donc un seul serveur de réception.**
Les adresses `@airfly972.com` vivent chez Google Workspace : toute boîte créée
ailleurs sur ce domaine est soit inutile, soit destructrice. La boîte a été
supprimée et la copie de surveillance déplacée vers
`contact@bmconsultingfwi.fr`.

### Indisponibilité partielle — CNAME avec descendants

Resend a d'abord été vérifié sur `send.airfly972.com`, puis sur l'apex. Le
second jeu a transformé `send` en CNAME, alors qu'il portait déjà les
enregistrements du premier. **Un nom porteur d'un CNAME ne peut avoir aucun
descendant** (RFC 1034) : la zone est devenue invalide et les résolveurs
stricts ont répondu `SERVFAIL`, ce que les navigateurs affichent en
`DNS_PROBE_FINISHED_NXDOMAIN`.

Les trois enregistrements sous `send` ont été supprimés. S'y est ajouté un
défaut d'Hostinger : leur flotte anycast a servi jusqu'à **trois versions de
la zone simultanément** pendant plus d'une heure, dont l'ancienne. Résolu
après ticket.

### Ce qui restait ensuite, et n'était plus un défaut

Orange, Quad9 et OpenDNS ont continué d'échouer après remise en état. Cause :
le registre `.com` publie la délégation avec un **TTL de 172 800 secondes,
soit 48 heures**. Ces résolveurs avaient mémorisé l'ancienne délégation vers
IONOS avant la bascule et continuaient de l'interroger.

Rien à corriger : cela se résout seul, au plus tard 48 h après le changement
de serveurs de noms. Contournement pendant ce délai : `1.1.1.1` sur les
postes concernés.

### Notifications par courriel

Resend refuse d'envoyer depuis un domaine qu'il n'a pas vérifié et répond 403.
La demande est alors enregistrée en base mais la notification meurt là, sans
que rien ne le signale au visiteur. `airfly972.com` et `send.airfly972.com`
sont désormais vérifiés tous les deux.

**L'apex a été ajouté avec « receiving » DÉSACTIVÉ**, ce qui limite Resend à
des CNAME et un TXT de DKIM, sans aucun MX. C'est ce qui rend l'opération
sans danger. La règle n'est pas « jamais l'apex », c'est **« jamais un MX sur
l'apex »**.

### Zone de référence au 25/08/2026

```
@                    A/ALIAS  airfly972.com.cdn.hstgr.net
@                    MX       1 aspmx.l.google.com
                              5 alt1.aspmx.l.google.com
                              5 alt2.aspmx.l.google.com
www                  CNAME    www.airfly972.com.cdn.hstgr.net
mail                 CNAME    ghs.google.com
send                 CNAME    send.forge.rmta.net
rsend                CNAME    rsend.forge.rmta.net
resend._domainkey    TXT      p=MIGfMA0... (clé DKIM Resend)
_dmarc               TXT      v=DMARC1; p=none
ftp                  A        82.25.114.133
```

**Ne jamais recréer** `send.send`, `rsend.send`, `resend._domainkey.send` :
tout nom contenant deux fois `send` casse la zone.

### Commandes de contrôle

```bash
# Les MX doivent toujours renvoyer les trois lignes Google
host -t MX airfly972.com

# Les deux serveurs doivent annoncer le même numéro de série
for ns in byte pixel; do
  echo "$ns : $(dig @$ns.dns-parking.com airfly972.com SOA +short | awk '{print $3}')"
done
```

---

## Reste à faire

**Sécurité, prioritaire.** La clé WooCommerce a fuité dans une trace d'erreur,
puis a été passée en écriture. **À régénérer et à révoquer.**

**Fait le 25/08** — transfert du domaine, bascule du site, notifications par
courriel. Voir la section Migration.

**Reste**
- Plan de redirections depuis les anciennes URL Squarespace
- DKIM Google Workspace : absent. À activer dans `admin.google.com` avant
  d'envisager de durcir le DMARC au-delà de `p=none`

**Divers**
- Confirmer au Village de la Pointe l'usage de leur photo
- Lever les soldes en fin de saison
- Vérifier la région Supabase pour la clause de transfert hors UE
- Différés : `?cat=soins` non lié, `ChatBot.tsx` code mort, descriptions
  produits, section FAQ, fiche Google Business, passe CSP
