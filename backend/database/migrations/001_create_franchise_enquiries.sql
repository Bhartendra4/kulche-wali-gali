-- PostgreSQL migration for the franchise_enquiries table.
-- Run with: psql "$DATABASE_URL" -f database/migrations/001_create_franchise_enquiries.sql

DO $$ BEGIN
  CREATE TYPE enquiry_status AS ENUM ('New', 'Contacted', 'Follow Up', 'Closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS franchise_enquiries (
  id                BIGSERIAL PRIMARY KEY,
  "fullName"        VARCHAR(120) NOT NULL,
  mobile            VARCHAR(20)  NOT NULL,
  email             VARCHAR(160) NOT NULL,
  city              VARCHAR(80)  NOT NULL,
  state             VARCHAR(80)  NOT NULL,
  "investmentBudget" VARCHAR(80),
  message           TEXT,
  "sourceWebsite"   VARCHAR(255),
  "ipAddress"       VARCHAR(64),
  "userAgent"       TEXT,
  status            enquiry_status NOT NULL DEFAULT 'New',
  notes             TEXT,
  "followUpDate"    DATE,
  "assignedTo"      VARCHAR(120),
  archived          BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fe_email    ON franchise_enquiries (email);
CREATE INDEX IF NOT EXISTS idx_fe_mobile   ON franchise_enquiries (mobile);
CREATE INDEX IF NOT EXISTS idx_fe_status   ON franchise_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_fe_created  ON franchise_enquiries ("createdAt");
CREATE INDEX IF NOT EXISTS idx_fe_archived ON franchise_enquiries (archived);
