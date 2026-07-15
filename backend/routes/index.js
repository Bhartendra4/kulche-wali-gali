'use strict';
const express = require('express');
const router = express.Router();

router.use('/franchise-enquiry', require('./franchiseRoutes'));
router.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));

module.exports = router;
