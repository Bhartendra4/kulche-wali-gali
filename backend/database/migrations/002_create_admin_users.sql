-- PostgreSQL migration for the admin_users table.
-- Run with: psql "$DATABASE_URL" -f database/migrations/002_create_admin_users.sql
--
-- Note: when the app boots it also runs sequelize.sync(), which creates this
-- table automatically if it is missing. This SQL is provided for teams that
-- prefer explicit migrations in production. The session table used by the
-- Admin panel is created automatically by connect-session-sequelize.

CREATE TABLE IF NOT EXISTS admin_users (
  id                   BIGSERIAL PRIMARY KEY,
  username             VARCHAR(60)  NOT NULL UNIQUE,
  "passwordHash"       VARCHAR(255) NOT NULL,
  "mustChangePassword" BOOLEAN      NOT NULL DEFAULT TRUE,
  "lastLoginAt"        TIMESTAMPTZ,
  "createdAt"          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users (username);
