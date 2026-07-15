'use strict';
const app = require('./app');
const env = require('./config/env');
const db = require('./models');

async function start() {
  try {
    await db.sequelize.authenticate();
    // Dev convenience: auto-create tables on SQLite / when no migrations run yet.
    // In production with PostgreSQL, prefer the SQL migration in database/migrations.
    await db.sequelize.sync();
    console.log(`[db] connected (${db.sequelize.getDialect()})`);

    app.listen(env.port, () => {
      console.log(`[server] Franchise API running on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    console.error('[startup] failed:', err);
    process.exit(1);
  }
}

start();
