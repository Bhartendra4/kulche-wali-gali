'use strict';
const helmet = require('helmet');
const cors = require('cors');
const env = require('../config/env');

// Helmet sets secure HTTP headers (incl. XSS protections, no-sniff, frameguard).
// CSP is scoped so the same-origin Admin dashboard (inline styles/script, no
// external JS) renders correctly while still restricting external sources.
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'same-site' }
});

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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

module.exports = { securityHeaders, corsMiddleware };
