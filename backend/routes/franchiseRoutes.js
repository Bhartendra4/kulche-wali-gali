'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/franchiseController');
const { createRules, handleValidation } = require('../middleware/validators');
const { submitLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { requireAuth, requirePasswordChanged } = require('../middleware/auth');

// Public submission — rate limited + validated + honeypot-checked.
router.post('/', submitLimiter, createRules, handleValidation, ctrl.create);

// Admin / read APIs — require an authenticated admin session (and a completed
// first-login password change). IP Address & User Agent are only ever exposed
// through these protected endpoints, never in emails.
const adminGuard = [apiLimiter, requireAuth, requirePasswordChanged];
router.get('/export/csv', adminGuard, ctrl.exportCsv);
router.get('/export/excel', adminGuard, ctrl.exportExcel);
router.get('/', adminGuard, ctrl.list);
router.get('/:id', adminGuard, ctrl.getOne);
router.put('/:id', adminGuard, ctrl.update);
router.delete('/:id', adminGuard, ctrl.remove);

module.exports = router;
