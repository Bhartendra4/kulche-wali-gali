'use strict';
const path = require('path');
const express = require('express');
const { securityHeaders, corsMiddleware } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { buildSessionMiddleware } = require('./middleware/auth');
const db = require('./models');
const apiRoutes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('trust proxy', 1);            // correct client IP behind a proxy/load balancer
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Sessions (DB-backed) for the Admin panel.
const { middleware: sessionMiddleware, store: sessionStore } = buildSessionMiddleware(db.sequelize);
app.use(sessionMiddleware);
app.locals.sessionStore = sessionStore; // exposed so server.js can sync() it

// Public + protected JSON API.
app.use('/api', apiRoutes);

// Admin authentication API + static dashboard (served same-origin at /admin).
app.use('/admin/api', adminRoutes);
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
