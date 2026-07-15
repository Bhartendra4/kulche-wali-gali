'use strict';
const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

// Helmet sets secure HTTP headers (incl. XSS protections, no-sniff, frameguard).
const securityHeaders = helmet();

// CORS: only allow configured frontend origins. If none configured, allow all
// in development but block cross-origin in production.
const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl / server-to-server / same-origin
    if (env.corsOrigins.length === 0) {
      return cb(null, env.nodeEnv !== 'production');
    }
    return cb(null, env.corsOrigins.includes(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = { securityHeaders, corsMiddleware };
