# Maintien Supabase — plan d'implémentation

> **Pour les agents :** SOUS-COMPÉTENCE REQUISE — utiliser superpowers:subagent-driven-development (recommandé) ou superpowers:executing-plans pour dérouler ce plan tâche par tâche. Les étapes utilisent la syntaxe case à cocher (`- [ ]`).

**Objectif :** Empêcher la mise en pause du projet Supabase par un workflow planifié, et fermer au passage les quatre tables métier à la clé publique.

**Architecture :** Un bloc SQL ferme les tables existantes et crée une table `heartbeat` d'une seule ligne, seule chose lisible par la clé anon. Un workflow GitHub Actions interroge cette table toutes les 72 heures et échoue bruyamment sinon, ce qui déclenche le mail d'alerte de GitHub.

**Pile technique :** PostgreSQL / Supabase (PostgREST), GitHub Actions, `curl`.

## Contraintes globales

- **La clé service role ne doit jamais quitter `.env.local`.** Le workflow n'utilise que la clé anon, et seulement après fermeture des tables.
- **Le workflow ne fait que lire.** Aucun droit d'écriture n'est accordé à la clé publique.
- **L'échec doit être bruyant.** Toute réponse autre que `200` fait échouer le workflow : c'est ce qui déclenche le mail de GitHub. Un maintien qui échoue en silence est pire qu'aucun maintien.
- **Aucun secret ne doit apparaître dans les journaux d'exécution.** Ni dans un `echo`, ni dans une URL affichée, ni dans un `set -x`.
- **Aucune dépendance npm, aucun framework de test.** La vérification passe par `curl` contre le vrai Supabase et par un contrôle de syntaxe YAML.
- Spec de référence : `docs/superpowers/specs/2026-08-15-maintien-supabase-design.md`

## Prérequis humain

Trois gestes du client, **après** l'implémentation :

1. Exécuter le bloc SQL de la tâche 1 dans l'éditeur SQL de Supabase.
2. Créer les secrets `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans le dépôt GitHub.
3. Déclencher le workflow manuellement et vérifier qu'il est vert.

Tant que le point 1 n'est pas fait, le workflow échouera — et c'est le comportement attendu.

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `docs/supabase-schema.sql` (modifier) | RLS sur les quatre tables métier, table `heartbeat` et sa politique de lecture |
| `.github/workflows/supabase-keepalive.yml` (créer) | Interrogation planifiée, échec bruyant |

---

### Tâche 1 : Fermer les tables et créer la table de battement

**Fichiers :**
- Modifier : `docs/supabase-schema.sql`

**Interfaces :**
- Produit : la table `heartbeat`, avec une colonne `created_at`, lisible par le rôle `anon`. La tâche 2 l'interroge à l'URL `/rest/v1/heartbeat?select=created_at&limit=1`.

- [ ] **Étape 1 : Ajouter le bloc SQL**

À la fin de `docs/supabase-schema.sql`, ajouter :

```sql

-- ─── Fermeture des tables metier ─────────────────────────────────────────────
-- Sans politique, volontairement : une table avec RLS activee et zero politique
-- est totalement fermee a la cle anon. La cle service_role contourne la RLS,
-- donc l'application, qui n'utilise qu'elle et cote serveur, ne voit aucune
-- difference. Ces quatre tables contiennent des donnees personnelles.
ALTER TABLE submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_reservations ENABLE ROW LEVEL SECURITY;

-- ─── Table de battement ──────────────────────────────────────────────────────
-- Seule table lisible par la cle anon. Le maintien se contente de la LIRE :
-- une lecture suffit a constituer une activite de base de donnees, et n'ecrire
-- nulle part evite d'accorder le moindre droit d'ecriture a la cle publique.
-- La colonne s'appelle created_at et non checked_at : elle enregistre la
-- creation de la ligne, pas le dernier passage du maintien.
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

- [ ] **Étape 2 : Vérifier la cohérence avec le reste du fichier**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
echo "--- toutes les tables ont-elles desormais une RLS ? ---"
grep -c "CREATE TABLE IF NOT EXISTS" docs/supabase-schema.sql
grep -c "ENABLE ROW LEVEL SECURITY" docs/supabase-schema.sql
echo "--- types en majuscules, comme le reste du fichier ---"
grep -nE "^\s+(id|created_at)\s+(smallint|timestamptz|uuid|text)" docs/supabase-schema.sql || echo "aucun type en minuscules, OK"
```

Attendu : les deux premiers comptes valent **6** — cinq tables métier plus `heartbeat`, chacune avec sa RLS. Et aucun type en minuscules.

- [ ] **Étape 3 : Vérifier l'état actuel de Supabase avant la bascule**

Ce relevé sert de point de comparaison pour le client après exécution du SQL.

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
URL=$(grep '^SUPABASE_URL=' .env.local | cut -d= -f2- | tr -d '"'"'"'' | sed 's|/$||')
KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' .env.local | cut -d= -f2- | tr -d '"'"'"'')
for t in submissions clients reservations shop_reservations partner_clicks heartbeat; do
  printf "  %-20s HTTP %s\n" "$t" \
    "$(curl -s -o /dev/null -w '%{http_code}' -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
      "$URL/rest/v1/$t?select=*&limit=1")"
done
```

Attendu aujourd'hui : `200` pour les quatre tables métier, `404` pour `partner_clicks` et `heartbeat` — le client n'a pas encore exécuté les blocs SQL précédents.

**Ces codes doivent rester identiques après que le client aura exécuté le SQL** : la clé service role contourne la RLS. Si une table passait à `401` ou `403`, la fermeture aurait cassé l'application — c'est le contrôle qui compte.

Ne pas chercher à créer les tables : l'implémentation n'a pas d'accès DDL.

- [ ] **Étape 4 : Commit**

```bash
git add docs/supabase-schema.sql
git commit -m "feat(supabase): fermer les tables metier et ajouter la table heartbeat"
```

---

### Tâche 2 : Le workflow de maintien

**Fichiers :**
- Créer : `.github/workflows/supabase-keepalive.yml`

**Interfaces :**
- Consomme : la table `heartbeat` de la tâche 1, à l'URL `/rest/v1/heartbeat?select=created_at&limit=1`, et les secrets GitHub `SUPABASE_URL` et `SUPABASE_ANON_KEY`.
- Produit : rien que d'autres tâches consomment.

- [ ] **Étape 1 : Créer le workflow**

```yaml
# .github/workflows/supabase-keepalive.yml
name: Maintien Supabase

# Les projets Supabase en offre gratuite sont suspendus apres 7 jours sans
# activite. Une interrogation tous les 3 jours laisse deux occasions de reussir
# avant l'echeance : si une execution echoue, la suivante sauve encore le projet.
#
# La minute n'est pas ronde : les crons GitHub Actions sont mis en file d'attente
# et retardes aux heures ou tout le monde planifie a l'heure pile.
#
# `*/3` sur le jour du mois se reinitialise a chaque mois, donc l'intervalle
# n'est pas exactement 72 heures partout — mais l'ecart maximal reste de 3 jours,
# ce qui est la seule propriete qui compte face au seuil de 7 jours.
on:
  schedule:
    - cron: "17 4 */3 * *"
  workflow_dispatch:

# Le workflow ne touche pas au depot : aucun droit n'est necessaire.
permissions: {}

jobs:
  ping:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Interroger la table heartbeat
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: |
          set -euo pipefail

          if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_ANON_KEY:-}" ]; then
            echo "::error::Secret SUPABASE_URL ou SUPABASE_ANON_KEY absent du depot."
            exit 1
          fi

          # -s : pas de barre de progression. -o : le corps va dans un fichier,
          # jamais dans la sortie standard, pour ne rien deverser par accident.
          statut=$(curl -s -o /tmp/reponse.txt -w "%{http_code}" \
            --max-time 20 --retry 2 --retry-delay 5 \
            -H "apikey: ${SUPABASE_ANON_KEY}" \
            -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
            "${SUPABASE_URL%/}/rest/v1/heartbeat?select=created_at&limit=1")

          if [ "$statut" != "200" ]; then
            echo "::error::Supabase a repondu $statut au lieu de 200."
            echo "Reponse :"
            cat /tmp/reponse.txt
            echo
            echo "Pistes : projet en pause, table heartbeat absente, politique de"
            echo "lecture manquante, ou secret errone."
            exit 1
          fi

          echo "Supabase repond 200, le projet est actif."
```

Trois points à ne pas modifier :

- `set -euo pipefail` fait échouer l'étape si `curl` ne peut même pas résoudre l'hôte — le cas exact d'un projet en pause.
- Les secrets ne sont jamais affichés. Le corps de la réponse va dans un fichier et n'est montré qu'en cas d'échec ; les erreurs PostgREST ne contiennent pas la clé.
- `permissions: {}` réduit le jeton du workflow au strict minimum : il n'a rien à faire dans le dépôt.

- [ ] **Étape 2 : Vérifier que le YAML est valide**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
~/.claude/claude-seo-venv/bin/python -c "
import yaml, sys
d = yaml.safe_load(open('.github/workflows/supabase-keepalive.yml'))
print('  nom          :', d['name'])
# 'on' est interprete comme le booleen True par YAML 1.1 : c'est normal et GitHub s'en accommode.
cle_on = True if True in d else 'on'
print('  declencheurs :', list(d[cle_on].keys()))
print('  cron         :', d[cle_on]['schedule'][0]['cron'])
print('  permissions  :', d['permissions'])
print('  etapes       :', len(d['jobs']['ping']['steps']))
"
```

Attendu : nom `Maintien Supabase`, déclencheurs `['schedule', 'workflow_dispatch']`, cron `17 4 */3 * *`, permissions vides, une étape.

Le commentaire sur `on` interprété comme booléen n'est pas une anomalie : YAML 1.1 traite `on` comme `true`, GitHub le gère correctement, et le script de vérification en tient compte.

- [ ] **Étape 3 : Vérifier que l'échec est réellement bruyant**

C'est la vérification qui compte. Sans elle, l'alerte n'est qu'une intention. On extrait la logique du workflow et on la confronte à trois réponses réelles de votre Supabase.

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"

cat > /tmp/verif-maintien.sh <<'SCRIPT'
#!/bin/bash
# Reprise fidele de la logique du workflow, parametree par l'URL a interroger.
set -euo pipefail
CIBLE="$1"; CLE="${2:-}"

# Tableau et non interpolation : `${CLE:+-H "apikey: $CLE"}` se decouperait en
# mots et casserait l'en-tete, les guillemets internes n'etant pas preserves.
args=(-s -o /tmp/reponse.txt -w "%{http_code}" --max-time 20)
if [ -n "$CLE" ]; then
  args+=(-H "apikey: $CLE" -H "Authorization: Bearer $CLE")
fi

statut=$(curl "${args[@]}" "$CIBLE")
if [ "$statut" != "200" ]; then
  echo "  echec detecte : HTTP $statut"
  exit 1
fi
echo "  succes : HTTP 200"
SCRIPT
chmod +x /tmp/verif-maintien.sh

URL=$(grep '^SUPABASE_URL=' .env.local | cut -d= -f2- | tr -d '"'"'"'' | sed 's|/$||')
KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' .env.local | cut -d= -f2- | tr -d '"'"'"'')

echo "--- cas 1 : table existante, cle valide (doit REUSSIR) ---"
/tmp/verif-maintien.sh "$URL/rest/v1/clients?select=id&limit=1" "$KEY" && echo "  code de sortie 0, OK"

echo "--- cas 2 : table absente (doit ECHOUER) ---"
if /tmp/verif-maintien.sh "$URL/rest/v1/heartbeat?select=created_at&limit=1" "$KEY"; then
  echo "  PROBLEME : le script a reussi alors qu'il aurait du echouer"
else
  echo "  code de sortie non nul, OK"
fi

echo "--- cas 3 : sans cle (doit ECHOUER) ---"
if /tmp/verif-maintien.sh "$URL/rest/v1/heartbeat?select=created_at&limit=1"; then
  echo "  PROBLEME : le script a reussi alors qu'il aurait du echouer"
else
  echo "  code de sortie non nul, OK"
fi

echo "--- cas 4 : hote injoignable, comme un projet en pause (doit ECHOUER) ---"
if /tmp/verif-maintien.sh "https://projet-qui-nexiste-pas-airfly.supabase.co/rest/v1/heartbeat" "$KEY"; then
  echo "  PROBLEME : le script a reussi alors qu'il aurait du echouer"
else
  echo "  code de sortie non nul, OK"
fi

rm -f /tmp/verif-maintien.sh /tmp/reponse.txt
```

Attendu : `OK` sur les quatre cas, et aucun `PROBLEME`.

Le cas 1 utilise la clé service role sur une table existante uniquement pour produire un `200` réel — le workflow, lui, n'utilisera jamais cette clé. Le cas 4 reproduit la panne qui a motivé tout ce travail : un hôte qui ne résout plus.

- [ ] **Étape 4 : Vérifier qu'aucun secret ne peut fuiter dans les journaux**

```bash
cd "/Users/ben/Documents/BM CONSULTING/AIRFLY/NEW AIRFLY"
echo "--- 'set -x' interdit (afficherait les en-tetes avec la cle) ---"
grep -c "set -x" .github/workflows/supabase-keepalive.yml
echo "--- la cle n'est jamais dans un echo ---"
grep -cE 'echo.*(ANON_KEY|SUPABASE_URL)' .github/workflows/supabase-keepalive.yml
echo "--- le corps de reponse va bien dans un fichier ---"
grep -c 'curl -s -o /tmp/reponse.txt' .github/workflows/supabase-keepalive.yml
```

Attendu : `0`, `0`, `1`.

- [ ] **Étape 5 : Commit**

```bash
git add .github/workflows/supabase-keepalive.yml
git commit -m "feat(ci): maintien du projet Supabase toutes les 72 heures"
```

---

## Hors périmètre

Ne pas implémenter, même si l'occasion semble se présenter :

- Réveil automatique d'un projet suspendu : impossible par API.
- Politiques RLS fines sur les quatre tables métier — elles sont fermées, ce qui suffit tant que seule la clé service role les touche.
- Surveillance de disponibilité du site lui-même.
- Toute écriture depuis le workflow.
- Toute utilisation de la clé service role dans un fichier versionné ou un secret GitHub.

## À transmettre au client après implémentation

Trois gestes manuels, dans cet ordre :

1. **Exécuter le bloc SQL** de `docs/supabase-schema.sql` dans l'éditeur SQL de Supabase — RLS des quatre tables, plus la table `heartbeat`. Si le bloc `partner_clicks` du 13 août n'a pas encore été exécuté, le faire aussi.
2. **Créer deux secrets** dans le dépôt GitHub (Settings → Secrets and variables → Actions) : `SUPABASE_URL` et `SUPABASE_ANON_KEY`, tous deux dans Supabase, Settings → API. La clé anon est la clé **publique** — surtout pas la service role.
3. **Déclencher le workflow manuellement** (onglet Actions → Maintien Supabase → Run workflow) et vérifier qu'il passe au vert.

**Contrôle de non-régression après le point 1** : ouvrir le site, envoyer une demande de réservation depuis la page École, et vérifier qu'elle arrive bien en base. La clé service role contourne la RLS, donc rien ne doit changer — mais c'est à vérifier, pas à supposer.

**Rappel des deux limites**, écrites dans la spec et toujours vraies : le workflow ne peut pas réveiller un projet déjà suspendu, et GitHub désactive les workflows planifiés après 60 jours sans activité dans le dépôt — il envoie alors un mail avec un lien de réactivation.
