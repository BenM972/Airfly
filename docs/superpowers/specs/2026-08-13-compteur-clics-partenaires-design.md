# Compteur de clics sortants vers les partenaires

**Date** : 13 août 2026
**Statut** : conception validée

## Objectif

Savoir combien de visiteurs quittent airfly972.com pour aller chez un partenaire, et le lire depuis le back office.

Le succès se mesure à une chose : à la connexion au back office, on voit d'un coup d'œil si le partenariat génère du trafic, et si ça monte ou descend d'un mois sur l'autre.

## Décisions

| Décision | Choix | Raison |
|---|---|---|
| Granularité | Une ligne par clic, horodatée | Le volume est dérisoire et l'historique est irrécupérable a posteriori |
| Captation | Requête au clic, `href` inchangé | Une redirection maison détruirait la valeur SEO du lien éditorial |
| Données stockées | Slug du partenaire + date, rien d'autre | Aucune donnée personnelle, donc aucune obligation RGPD |
| Stockage | Table Supabase | Déjà en place, clé service role côté serveur, quatre tables suivent ce modèle |
| Affichage | Carte sur le tableau de bord, deux lignes | Se lit sans changer de page |

## Ce que ce compteur n'est pas

**Le chiffre est indicatif, pas comptable.**

La route d'écriture est publique par nécessité : c'est un visiteur anonyme qui l'appelle. Le contrôle same-origin, la limitation de débit et la validation du slug écartent l'essentiel, mais quelqu'un de déterminé peut gonfler le compteur. À l'inverse, les bloqueurs de publicité, le JavaScript désactivé et le clic-molette le font sous-compter.

Une tendance de 40 à 120 est réelle. Un écart de 118 à 121 ne veut rien dire. Ne pas fonder de facturation ni de négociation commerciale sur ce nombre.

## Données

Table à ajouter dans `docs/supabase-schema.sql` :

```sql
CREATE TABLE IF NOT EXISTS partner_clicks (
  id           uuid PRIMARY KEY,
  partner_slug text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_clicks_slug_date
  ON partner_clicks(partner_slug, created_at DESC);
```

Trois colonnes. Pas d'IP, pas d'agent utilisateur, pas de référent : rien qui puisse identifier un visiteur. L'index sert les deux seules questions posées.

`id` est généré par l'application avec `crypto.randomUUID()`, comme les autres tables depuis le correctif du 12/08.

**Cette table doit être créée manuellement** dans l'éditeur SQL de Supabase. L'implémentation n'a pas d'accès DDL. Tant que ce n'est pas fait, l'écriture échoue silencieusement et la carte affiche `—`.

## Écriture

### `POST /api/partners/click`

Publique — c'est un visiteur anonyme qui l'appelle.

Corps attendu : `{ "slug": "salty-lodge" }`.

Traitement, dans cet ordre :

1. Contrôle same-origin via `isSameOrigin` de `src/lib/rateLimit.ts` → `403` si échec.
2. Limitation de débit par IP, 30 clics par 15 minutes, via `rateLimit` du même module → `429` si dépassement. L'IP sert de clé en mémoire vive, elle n'est jamais écrite.
3. Validation du slug **contre la liste `partners`** de `src/data/partners.ts` → `400` si inconnu. Sans cette validation, n'importe qui pourrait remplir la table de valeurs arbitraires.
4. Insertion d'une ligne.
5. Réponse `204`, sans contenu.

Une erreur d'insertion est journalisée côté serveur et renvoie tout de même `204` : le visiteur n'a rien à faire de ce résultat, et la route ne doit jamais donner d'information exploitable sur l'état de la base.

### Déclenchement dans `PartnerCard`

Un `onClick` sur le lien sortant qui appelle la route en `fetch` avec `keepalive: true`, dans un `try/catch` silencieux.

Contraintes absolues : **pas de `preventDefault`, pas d'`await` avant la navigation**. Le comptage ne doit jamais retarder ni empêcher le départ du visiteur. Si l'API est en panne, personne ne s'en aperçoit.

`keepalive` garantit l'envoi même si le navigateur s'occupe d'ouvrir le nouvel onglet.

## Lecture

Module `src/lib/partnerClicks.ts` :

```ts
export function recordPartnerClick(slug: string): Promise<void>
export function getPartnerClickStats(): Promise<Record<string, { mois: number; total: number }>>
```

`getPartnerClickStats` fait deux requêtes `count: "exact", head: true` par partenaire — jamais de rapatriement de lignes. Un partenaire donne deux requêtes, cinq en donnent dix, toutes servies par l'index. Au-delà d'une dizaine de partenaires, il faudrait une vue Postgres ; le projet n'y est pas.

### Frontière du mois

« Ce mois » signifie **depuis le 1er du mois courant à 00h00, heure de Martinique** — pas les 30 derniers jours, et pas UTC.

Sans cette précision, un clic du 31 à 21h en Martinique (soit le 1er à 01h UTC) serait compté sur le mois suivant. Le projet a déjà ce précédent : `src/app/api/reservation/route.ts` formate ses dates avec `timeZone: "America/Martinique"`.

L'instant de début de mois est calculé en JavaScript dans ce fuseau, puis passé en filtre `created_at >= instant`.

## Affichage

### Passage du tableau de bord en composant serveur

`src/app/admin/page.tsx` est aujourd'hui un composant client, uniquement à cause du bouton de déconnexion. Il passe en composant serveur, et ce bouton part dans `src/components/admin/AdminLogoutButton.tsx`.

Ce n'est pas cosmétique. La page lit alors Supabase directement, ce qui permet de **ne créer aucune route de lecture**. Le compteur n'est pas « protégé par une authentification » : aucune URL ne l'expose. C'est la garantie la plus solide pour l'exigence « visible uniquement en back office ».

C'est aussi le motif déjà appliqué à `/shop` : Server Component parent, interactivité isolée dans un enfant client.

### La carte

Troisième bloc du tableau de bord, au style des deux existants (`bg-gray-900`, bordure `border-gray-800`, titre en Mirloanne sans accent), mais **sans `Link`** : il n'y a nulle part où aller.

Pour chaque partenaire, son nom puis exactement deux lignes :

```
Salty Lodge
Clics ce mois     12
Clics totaux      47
```

**Résolution d'ambiguïté** : les deux lignes sont **par partenaire**, pas agrégées. Avec le seul partenaire actuel, la carte affiche donc exactement deux lignes, conformément à la demande. Un second partenaire ajouterait son propre bloc de deux lignes.

Si `partners` est vide, la carte ne s'affiche pas — même règle que la section publique.

## Cas d'erreur

| Situation | Comportement |
|---|---|
| API de comptage en panne ou bloquée | Le visiteur part chez le partenaire normalement, le clic est perdu silencieusement |
| Table `partner_clicks` inexistante | L'écriture échoue et est journalisée ; la carte affiche `—` |
| Supabase injoignable à la lecture | La carte affiche `—`, le reste du tableau de bord fonctionne |
| Slug inconnu | `400`, aucune ligne écrite |
| Requête d'une autre origine | `403` |
| Dépassement de débit | `429` |
| Table vide | Zéros affichés, pas d'erreur |

## Vérifications

Ce projet n'a aucun framework de test et n'en veut pas. La vérification passe par `npx tsc --noEmit`, `npm run lint`, `npm run build` et des assertions `curl` :

- `POST /api/partners/click` avec `{"slug":"salty-lodge"}` et une origine légitime → `204`
- Le même appel avec `{"slug":"nexiste-pas"}` → `400`
- Le même appel avec une origine étrangère → `403`
- Trente-et-un appels successifs depuis la même IP → `429` au dernier
- `/admin` sans cookie → redirection ; avec cookie → le HTML contient « Clics ce mois » et « Clics totaux »
- Aucune route publique ne renvoie de compteur : `curl` sur `/api/partners/click` en `GET` ne doit pas exposer de total

Le décompte réel en base se vérifie par `GET` du total avant et après un `POST`, via le client Supabase côté serveur — pas par une route exposée.

## Hors périmètre

- Répartition par mois, graphique, export
- Page `/admin/partenaires` dédiée
- Comptage des visiteurs uniques, cookie ou empreinte
- Filtrage des bots au-delà de la limitation de débit
- Comptage d'autres liens sortants (Instagram, Facebook, WhatsApp, Google Maps)
- Purge automatique des anciennes lignes

## Dépendance côté client

Aucune. Le module réutilise `getSupabase` de `src/lib/supabase.ts`, `isSameOrigin` et `rateLimit` de `src/lib/rateLimit.ts`, et la liste `partners` de `src/data/partners.ts`.
