'use strict';
const { Sequelize } = require('sequelize');
const env = require('./env');

// Postgres in production (DATABASE_URL), SQLite in development (fallback).
// The same Sequelize models run on both dialects — fully migration-ready.
let sequelize;
if (env.databaseUrl) {
  sequelize = new Sequelize(env.databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions:
      env.nodeEnv === 'production'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: env.sqliteStorage,
    logging: false
  });
}

module.exports = sequelize;
