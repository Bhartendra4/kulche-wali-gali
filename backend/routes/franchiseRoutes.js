'use strict';
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/franchiseController');
const { createRules, handleValidation } = require('../middleware/validators');
const { submitLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Public submission — rate limited + validated + honeypot-checked.
router.post('/', submitLimiter, createRules, handleValidation, ctrl.create);

// Admin / read APIs (protect these behind auth when the Admin Panel is added).
router.get('/export/csv', apiLimiter, ctrl.exportCsv);
router.get('/export/excel', apiLimiter, ctrl.exportExcel);
router.get('/', apiLimiter, ctrl.list);
router.get('/:id', apiLimiter, ctrl.getOne);
router.put('/:id', apiLimiter, ctrl.update);
router.delete('/:id', apiLimiter, ctrl.remove);

module.exports = router;
