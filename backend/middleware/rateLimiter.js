'use strict';
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// Strict limiter for public enquiry submissions (spam / abuse protection).
const submitLimiter = rateLimit({
  windowMs: env.rateLimitWindowMinutes * 60 * 1000,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many enquiries from this network. Please try again later.' }
});

// Gentler limiter for the read/admin API.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { submitLimiter, apiLimiter };
