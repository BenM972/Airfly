# Maintien du projet Supabase et fermeture des tables

**Date** : 15 août 2026
**Statut** : conception validée

## Contexte

Le 13 août, le projet Supabase du site s'est mis en pause. Les projets de l'offre gratuite sont suspendus après 7 jours sans activité. Pendant la suspension, l'hôte ne résout plus en DNS : les deux formulaires de réservation écrivaient dans le vide et le compteur de clics n'enregistrait rien.

Le client a réactivé le projet manuellement. L'objectif est que cela ne se reproduise pas.

## Ce qui ne peut pas être garanti

**Aucun code ne peut empêcher Supabase de suspendre un projet.** La règle appartient à Supabase, s'applique sur leur définition de l'activité, et seule l'offre payante en dispense.

Ce document décrit un contournement qui rend la suspension très improbable, pas une garantie. Deux limites subsistent :

- Le maintien **ne peut pas réveiller** un projet déjà suspendu. Il prévient ; la réactivation reste un geste manuel dans le tableau de bord Supabase.
- **GitHub désactive les workflows planifiés après 60 jours sans activité dans le dépôt.** Le dispositif qui empêche Supabase de s'endormir peut donc s'endormir lui-même. GitHub envoie un mail avec un lien de réactivation.

## Le problème découvert en chemin

Le maintien doit s'authentifier auprès de Supabase, donc porter une clé dans les secrets GitHub. C'est en cherchant la clé la moins puissante possible qu'un défaut est apparu.

**Les quatre tables d'origine n'ont aucune sécurité au niveau ligne.** `docs/supabase-schema.sql` déclare `submissions`, `clients`, `reservations` et `shop_reservations` sans `ENABLE ROW LEVEL SECURITY` ; seule `partner_clicks`, ajoutée le 13 août, en a une.

La clé **anon** de Supabase est conçue pour être publique — elle vit normalement dans le code client. Sa sûreté repose entièrement sur la RLS. Sans RLS, elle équivaut à un accès complet en lecture : noms, emails et téléphones des clients compris.

Le risque est aujourd'hui théorique : l'application n'utilise que la clé service role, côté serveur, et aucune clé anon n'a jamais figuré dans le dépôt ni dans son historique. Il deviendrait réel dès qu'une clé anon serait publiée quelque part — ce que ce maintien allait précisément faire.

## Décisions

| Décision | Choix | Raison |
|---|---|---|
| Mécanique | Workflow GitHub Actions | Indépendant de l'hébergement, gratuit, versionné, fonctionne même si le site n'est pas déployé |
| Clé exposée | Clé anon, après fermeture des tables | Une clé publique dont le pire usage est de lire une date |
| Rythme | Toutes les 72 heures | Suspension à 7 jours : deux occasions de réussir avant l'échéance |
| Échec | Bruyant | GitHub envoie déjà un mail sur workflow rouge : l'alerte est gratuite |

## Partie 1 — Fermer les tables

Bloc à ajouter à `docs/supabase-schema.sql`, exécuté par le client dans l'éditeur SQL de Supabase.

```sql
ALTER TABLE submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_reservations ENABLE ROW LEVEL SECURITY;
```

**Sans aucune politique, et c'est délibéré.** Une table avec RLS activée et zéro politique est totalement fermée à la clé anon. La clé service role contourne la RLS : l'application, qui n'utilise qu'elle et uniquement côté serveur, ne voit aucune différence.

## Partie 2 — La table de battement

```sql
-- Table de battement : seule table lisible par la cle anon.
-- Le maintien se contente de la LIRE, il n'ecrit jamais : une lecture suffit
-- a constituer une activite de base de donnees, et n'ecrire nulle part evite
-- d'accorder le moindre droit d'ecriture a la cle publique.
CREATE TABLE IF NOT EXISTS heartbeat (
  id         SMALLINT PRIMARY KEY DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT heartbeat_ligne_unique CHECK (id = 1)
);

INSERT INTO heartbeat (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE heartbeat ENABLE ROW LEVEL SECURITY;

CREATE POLICY heartbeat_lecture_publique ON heartbeat
  FOR SELECT TO anon USING (true);
```

Une seule ligne, contrainte à une seule ligne par le `CHECK`, en lecture seule pour la clé publique. Elle ne contient aucune donnée, ne grossit jamais, n'a pas besoin d'être purgée.

La colonne s'appelle `created_at` et non `checked_at` : elle enregistre la création de la ligne, pas le dernier passage du maintien. Aucune écriture n'a lieu, il ne faut donc pas laisser croire le contraire.

Le pire usage possible de la clé anon devient : lire une date de création.

## Partie 3 — Le workflow

Fichier unique : `.github/workflows/supabase-keepalive.yml`.

**Déclenchement** : `cron: "17 4 */3 * *"`, plus `workflow_dispatch` pour un lancement manuel — indispensable pour vérifier la mise en place sans attendre trois jours.

Deux détails de ce cron méritent d'être explicités, parce qu'ils se choisissent mal par défaut :

- **La minute n'est pas ronde.** Les crons GitHub Actions sont mis en file d'attente et retardés aux heures de forte charge, où tout le monde planifie à l'heure pile. Un décalage réduit l'attente.
- **`*/3` sur le jour du mois se réinitialise à chaque mois.** L'intervalle n'est donc pas exactement 72 heures partout : sur un mois de 31 jours la séquence donne 1, 4, … 31, puis 1 — soit un écart d'un seul jour au passage. **L'écart maximal reste de 3 jours dans tous les cas**, ce qui est la seule propriété qui compte face au seuil de 7 jours.

**Ce que fait le workflow** : une requête HTTP vers `heartbeat` avec la clé anon, et rien d'autre. Il vérifie le code de statut et échoue si ce n'est pas `200`.

**Pourquoi l'échec doit être bruyant** : sans cela, un maintien cassé reste invisible jusqu'à la prochaine mise en pause — exactement le scénario à éviter. GitHub envoie un mail au propriétaire du dépôt sur toute exécution rouge : l'alerte ne coûte rien de plus qu'un `exit 1` au bon endroit.

**Secrets à créer par le client** dans les réglages du dépôt (Settings → Secrets and variables → Actions) :

| Secret | Où le trouver |
|---|---|
| `SUPABASE_URL` | Supabase, Settings → API, champ *Project URL* |
| `SUPABASE_ANON_KEY` | Supabase, Settings → API, clé publique *anon* — **pas** la service role |

## Cas d'erreur

| Situation | Comportement |
|---|---|
| Supabase répond `200` | Exécution verte, rien ne se passe |
| Projet en pause, hôte injoignable | Exécution rouge, mail de GitHub |
| Clé invalide ou secret manquant | Exécution rouge, mail de GitHub |
| Table `heartbeat` absente ou politique manquante | Exécution rouge, mail de GitHub |
| Workflow désactivé par GitHub à 60 jours | Mail de GitHub avec lien de réactivation |

## Vérifications

- Déclenchement manuel après mise en place : exécution verte.
- Second essai avec un secret volontairement erroné : exécution **rouge**. Sans cette vérification, l'alerte n'est qu'une intention — c'est le seul moyen de savoir que l'échec est réellement bruyant.
- Après activation de la RLS, contrôle que l'application fonctionne toujours : les deux formulaires de réservation doivent continuer à écrire, et la carte du back office à afficher ses compteurs. La clé service role contourne la RLS, donc rien ne doit changer — mais c'est à vérifier, pas à supposer.

## Hors périmètre

- Réveil automatique d'un projet suspendu : impossible par API.
- Surveillance de disponibilité du site lui-même.
- Politiques RLS fines sur les quatre tables métier : elles sont fermées, ce qui suffit tant que seule la clé service role les touche. Des politiques ne deviendront nécessaires que si un jour du code client accède directement à Supabase.
- Passage à l'offre Supabase Pro : c'est un arbitrage budgétaire du client, et la seule garantie réelle.

## À transmettre au client

Trois gestes manuels, dans cet ordre :

1. Exécuter le bloc SQL de `docs/supabase-schema.sql` (RLS des quatre tables + table `heartbeat`).
2. Créer les deux secrets GitHub.
3. Déclencher le workflow manuellement et vérifier qu'il est vert.

Tant que le point 1 n'est pas fait, le workflow échouera — et c'est le comportement attendu.
