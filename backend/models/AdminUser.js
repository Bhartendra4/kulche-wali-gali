'use strict';
const { DataTypes, Model } = require('sequelize');

/**
 * Admin dashboard user. Passwords are NEVER stored in plain text — only a
 * bcrypt hash is persisted. `mustChangePassword` forces a password change on
 * first login for the seeded default account.
 */
module.exports = (sequelize) => {
  class AdminUser extends Model {}

  AdminUser.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      username: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
      },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false },
      mustChangePassword: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true }
    },
    {
      sequelize,
      modelName: 'AdminUser',
      tableName: 'admin_users',
      timestamps: true,
      indexes: [{ unique: true, fields: ['username'] }]
    }
  );

  return AdminUser;
};
