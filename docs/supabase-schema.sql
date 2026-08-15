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

-- Index utiles pour les ops marketing
CREATE INDEX IF NOT EXISTS idx_clients_email       ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_tags        ON clients USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_clients_disciplines ON clients USING GIN(disciplines);
CREATE INDEX IF NOT EXISTS idx_reservations_client ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_submissions_email   ON submissions(email);

-- Table : réservations click & collect boutique
CREATE TABLE IF NOT EXISTS shop_reservations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  prenom        TEXT NOT NULL,
  nom           TEXT NOT NULL,
  email         TEXT NOT NULL,
  telephone     TEXT,
  produit       TEXT NOT NULL,
  variante      TEXT,
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

CREATE POLICY heartbeat_lecture_publique ON heartbeat
  FOR SELECT TO anon USING (true);
