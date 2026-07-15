'use strict';
const app = require('./app');
const env = require('./config/env');
const db = require('./models');
const { seedDefaultAdmin } = require('./services/authService');

async function start() {
  try {
    await db.sequelize.authenticate();
    // Dev convenience: auto-create tables on SQLite / when no migrations run yet.
    // In production with PostgreSQL, prefer the SQL migrations in database/migrations.
    await db.sequelize.sync();

    // Create the session table and seed the default admin (first run only).
    if (app.locals.sessionStore) await app.locals.sessionStore.sync();
    await seedDefaultAdmin();

    console.log(`[db] connected (${db.sequelize.getDialect()})`);

    app.listen(env.port, () => {
      console.log(`[server] Franchise API running on port ${env.port} (${env.nodeEnv})`);
      console.log(`[admin]  Dashboard available at http://localhost:${env.port}/admin`);
    });
  } catch (err) {
    console.error('[startup] failed:', err);
    process.exit(1);
  }
}

start();
