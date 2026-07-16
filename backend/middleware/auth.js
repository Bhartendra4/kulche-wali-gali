'use strict';
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const env = require('../config/env');
const authService = require('../services/authService');

/**
 * Builds session middleware backed by the SQL database (works on both SQLite
 * and PostgreSQL via the existing Sequelize connection). Sessions persist in a
 * `sessions` table, so logins survive server restarts.
 */
function buildSessionMiddleware(sequelize) {
  const store = new SequelizeStore({
    db: sequelize,
    tableName: 'sessions',
    checkExpirationInterval: 15 * 60 * 1000, // clean expired sessions every 15 min
    expiration: 8 * 60 * 60 * 1000           // 8 hours
  });

  const middleware = session({
    name: 'kwg.sid',
    secret: env.sessionSecret,
    store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: 'auto', // secure over HTTPS (production) but still works on http://localhost
      maxAge: 8 * 60 * 60 * 1000
    }
  });

  return { middleware, store };
}

/** Requires a valid, logged-in admin session. Attaches req.adminUser. */
async function requireAuth(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const user = await authService.getById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    req.adminUser = user;
    next();
  } catch (err) { next(err); }
}

/**
 * Blocks access until the seeded/default account has changed its password.
 * Applied to all data routes (but NOT to the change-password endpoint).
 */
function requirePasswordChanged(req, res, next) {
  if (req.adminUser && req.adminUser.mustChangePassword) {
    return res.status(403).json({
      success: false,
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'You must change your password before continuing.'
    });
  }
  next();
}

module.exports = { buildSessionMiddleware, requireAuth, requirePasswordChanged };
