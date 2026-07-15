'use strict';
const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// POST /admin/api/login  (public)
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const user = await authService.verifyLogin(username, password);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
    // Prevent session fixation: regenerate the session on login.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.username = user.username;
      res.json({
        success: true,
        user: { username: user.username, mustChangePassword: user.mustChangePassword }
      });
    });
  } catch (err) { next(err); }
});

// POST /admin/api/logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('kwg.sid');
    res.json({ success: true, message: 'Logged out.' });
  });
});

// GET /admin/api/me  — current session info
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: {
      username: req.adminUser.username,
      mustChangePassword: req.adminUser.mustChangePassword,
      lastLoginAt: req.adminUser.lastLoginAt
    }
  });
});

// POST /admin/api/change-password  (allowed even when a change is required)
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const result = await authService.changePassword(req.adminUser.id, currentPassword, newPassword);
    if (!result.ok) {
      return res.status(result.code || 400).json({ success: false, message: result.message });
    }
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
