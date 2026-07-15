'use strict';
const bcrypt = require('bcryptjs');
const { AdminUser } = require('../models');
const env = require('../config/env');

const BCRYPT_ROUNDS = 10;

/**
 * Creates the default admin account the first time the app runs (only when no
 * admin exists). The seeded account must change its password on first login.
 */
async function seedDefaultAdmin() {
  const count = await AdminUser.count();
  if (count > 0) return null;

  const passwordHash = await bcrypt.hash(env.admin.defaultPassword, BCRYPT_ROUNDS);
  const user = await AdminUser.create({
    username: env.admin.defaultUsername,
    passwordHash,
    mustChangePassword: true
  });
  console.log(
    `[auth] Seeded default admin "${user.username}" — ` +
    `password must be changed on first login.`
  );
  return user;
}

/** Returns the AdminUser on valid credentials, otherwise null. */
async function verifyLogin(username, password) {
  if (!username || !password) return null;
  const user = await AdminUser.findOne({ where: { username: String(username).trim() } });
  if (!user) return null;
  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return null;
  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

const getById = (id) => AdminUser.findByPk(id);

/** Basic password strength policy. Returns an error string or null if valid. */
function validateNewPassword(pw) {
  if (!pw || String(pw).length < 8) return 'New password must be at least 8 characters long.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'New password must contain letters and numbers.';
  if (String(pw) === env.admin.defaultPassword) return 'Please choose a password different from the default.';
  return null;
}

/**
 * Changes a user's password after verifying the current one. Clears the
 * mustChangePassword flag on success.
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await AdminUser.findByPk(userId);
  if (!user) return { ok: false, code: 404, message: 'User not found.' };

  const currentOk = await bcrypt.compare(String(currentPassword || ''), user.passwordHash);
  if (!currentOk) return { ok: false, code: 400, message: 'Current password is incorrect.' };

  const policyError = validateNewPassword(newPassword);
  if (policyError) return { ok: false, code: 422, message: policyError };

  if (await bcrypt.compare(String(newPassword), user.passwordHash)) {
    return { ok: false, code: 422, message: 'New password must be different from the current password.' };
  }

  user.passwordHash = await bcrypt.hash(String(newPassword), BCRYPT_ROUNDS);
  user.mustChangePassword = false;
  await user.save();
  return { ok: true };
}

module.exports = { seedDefaultAdmin, verifyLogin, getById, changePassword, validateNewPassword };
