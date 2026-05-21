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
