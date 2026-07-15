'use strict';
const express = require('express');
const { securityHeaders, corsMiddleware } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');

const app = express();

app.set('trust proxy', 1);            // correct client IP behind a proxy/load balancer
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
