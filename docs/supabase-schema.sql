-- ============================================================
-- AIRFLY — Schéma Supabase
-- À exécuter dans : Supabase > SQL Editor > New Query
-- ============================================================

-- Table : toutes les soumissions brutes du formulaire
CREATE TABLE IF NOT EXISTS submissions (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  email         TEXT NOT NULL,
  telephone     TEXT,
  discipline    TEXT NOT NULL,
  prestation    TEXT NOT NULL,
  niveau        TEXT,
  date_souhaitee DATE,
  creneau       TEXT,
  message       TEXT,
  ip            TEXT
);

-- Table : BDD clients dédupliquée (1 ligne par email)
CREATE TABLE IF NOT EXISTS clients (
  id               TEXT PRIMARY KEY,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  prenom           TEXT NOT NULL,
  nom              TEXT NOT NULL,
  email            TEXT NOT NULL UNIQUE,
  telephone        TEXT,
  disciplines      TEXT[]   NOT NULL DEFAULT '{}',
  tags             TEXT[]   NOT NULL DEFAULT '{}',
  nb_reservations  INT      NOT NULL DEFAULT 1,
  last_contact     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table : historique des réservations par client
CREATE TABLE IF NOT EXISTS reservations (
  id               TEXT PRIMARY KEY,
  client_id        TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  submission_id    TEXT NOT NULL REFERENCES submissions(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  discipline       TEXT NOT NULL,
  prestation       TEXT NOT NULL,
  niveau           TEXT,
  date_souhaitee   DATE,
  message          TEXT
);

-- ─── Rattrapages de schema ───────────────────────────────────────────────────
-- `CREATE TABLE IF NOT EXISTS` ne modifie pas une table qui existe deja : une
-- colonne ajoutee au code apres la creation initiale doit l'etre explicitement,
-- sinon ce fichier decrit un schema que la base n'a pas.
--
-- `submissions.creneau` etait declaree dans le CREATE TABLE ci-dessus mais
-- absente de la base. Le formulaire ecole la collecte (boutons radio) et la
-- route l'insere : chaque demande de reservation echouait donc en erreur 42703
-- "column submissions.creneau does not exist", et etait perdue.
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS creneau TEXT;

-- Index utiles pour les ops marketing
CREATE INDEX IF NOT EXISTS idx_clients_email       ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_tags        ON clients USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_clients_disciplines ON clients USING GIN(disciplines);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email   ON submissions(email);

-- Table : réservations click & collect boutique
-- `articles` porte le panier entier sous forme de texte, une ligne par article
-- ("2× T-shirt — M"), tel que le compose src/app/api/shop/reservation/route.ts.
-- Ce fichier declarait auparavant `produit NOT NULL` et `variante`, deux colonnes
-- qui n'ont jamais existe dans la base : recreer le schema a partir de cette
-- version erronee aurait fait echouer toutes les reservations boutique.
CREATE TABLE IF NOT EXISTS shop_reservations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  email         TEXT NOT NULL,
  telephone     TEXT,
  articles      TEXT,
  date_retrait  DATE,
  creneau       TEXT
);

-- ─── Clics sortants vers les partenaires ─────────────────────────────────────
-- Aucune donnée personnelle : slug et date, rien d'autre.
CREATE TABLE IF NOT EXISTS partner_clicks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_clicks_slug_date
  ON partner_clicks(partner_slug, created_at DESC);

-- La cle service_role contourne la RLS : aucune politique n'est necessaire
-- pour que l'application fonctionne, mais l'activer ferme la table a la cle anon.
ALTER TABLE partner_clicks ENABLE ROW LEVEL SECURITY;

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

GRANT SELECT ON heartbeat TO anon;

DROP POLICY IF EXISTS heartbeat_lecture_publique ON heartbeat;
CREATE POLICY heartbeat_lecture_publique ON heartbeat
  FOR SELECT TO anon USING (true);

-- ─── Suivi des demandes ──────────────────────────────────────────────────────
-- Chaque demande, cours ou click & collect, suit le meme cycle : elle arrive en
-- attente, la boutique la confirme ou l'annule depuis le back office, et le
-- client est notifie a chaque changement.
--
-- `en_attente` est le defaut : les lignes creees avant cette migration
-- basculent donc dans cet etat, ce qui est exact — personne ne les avait
-- encore traitees.

ALTER TABLE submissions       ADD COLUMN IF NOT EXISTS statut TEXT NOT NULL DEFAULT 'en_attente';
ALTER TABLE shop_reservations ADD COLUMN IF NOT EXISTS statut TEXT NOT NULL DEFAULT 'en_attente';

-- La contrainte est posee separement et rejouable : ADD CONSTRAINT n'accepte
-- pas IF NOT EXISTS, et un simple ADD ferait echouer tout le fichier au
-- deuxieme passage.
ALTER TABLE submissions       DROP CONSTRAINT IF EXISTS submissions_statut_valide;
ALTER TABLE submissions       ADD  CONSTRAINT submissions_statut_valide
  CHECK (statut IN ('en_attente', 'confirmee', 'annulee'));
ALTER TABLE shop_reservations DROP CONSTRAINT IF EXISTS shop_reservations_statut_valide;
ALTER TABLE shop_reservations ADD  CONSTRAINT shop_reservations_statut_valide
  CHECK (statut IN ('en_attente', 'confirmee', 'annulee'));

-- Date et creneau REELLEMENT retenus pour un cours, distincts de ceux que le
-- client a souhaites : la boutique peut proposer autre chose, et reprogrammer
-- ensuite. Les colonnes d'origine gardent la demande initiale, ce qui permet
-- de voir l'ecart.
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS date_confirmee   DATE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS creneau_confirme TEXT;

-- Horodatage du dernier traitement par la boutique, pour trier le back office
-- et savoir depuis quand une demande attend.
ALTER TABLE submissions       ADD COLUMN IF NOT EXISTS traite_le TIMESTAMPTZ;
ALTER TABLE shop_reservations ADD COLUMN IF NOT EXISTS traite_le TIMESTAMPTZ;

-- Le back office liste les demandes en attente d'abord, les plus recentes en
-- tete : c'est l'ordre de lecture naturel.
CREATE INDEX IF NOT EXISTS idx_submissions_statut       ON submissions(statut, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shop_reservations_statut ON shop_reservations(statut, created_at DESC);
