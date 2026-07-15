'use strict';
require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGIN || '')
    .split(',').map(s => s.trim()).filter(Boolean),
  databaseUrl: process.env.DATABASE_URL || '',
  sqliteStorage: process.env.SQLITE_STORAGE || './database/franchise.sqlite',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  },
  mailFrom: process.env.MAIL_FROM || 'Kulche Wali Gali <contact@pinkspoonfood.com>',
  mailTo: process.env.MAIL_TO || 'contact@pinkspoonfood.com',
  duplicateWindowMinutes: parseInt(process.env.DUPLICATE_WINDOW_MINUTES || '10', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '5', 10),
  rateLimitWindowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10),

  // Admin panel / auth
  // Secret used to sign the session cookie. CHANGE THIS in production.
  sessionSecret: process.env.SESSION_SECRET || 'kwg-dev-session-secret-change-me',
  // Seeded on first startup only (if no admin exists). The default account is
  // forced to change its password on first login.
  admin: {
    defaultUsername: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeMe@123'
  }
};

module.exports = env;
