'use strict';
// Dev/first-run migration: creates tables from Sequelize models.
// For production PostgreSQL you may instead run database/migrations/001_*.sql.
const db = require('../models');

(async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ alter: true });
    console.log(`[migrate] schema synced (${db.sequelize.getDialect()})`);
    process.exit(0);
  } catch (e) {
    console.error('[migrate] failed:', e);
    process.exit(1);
  }
})();
