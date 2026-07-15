'use strict';
const { DataTypes, Model } = require('sequelize');

// Lead status values — shared with the (future) Admin Panel.
const STATUS = ['New', 'Contacted', 'Follow Up', 'Closed'];

module.exports = (sequelize) => {
  class FranchiseEnquiry extends Model {}

  FranchiseEnquiry.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      // ─── Customer-provided data ───────────────────────────
      fullName:         { type: DataTypes.STRING(120), allowNull: false },
      mobile:           { type: DataTypes.STRING(20),  allowNull: false },
      email:            { type: DataTypes.STRING(160), allowNull: false },
      city:             { type: DataTypes.STRING(80),  allowNull: false },
      state:            { type: DataTypes.STRING(80),  allowNull: false },
      investmentBudget: { type: DataTypes.STRING(80),  allowNull: true },
      message:          { type: DataTypes.TEXT,        allowNull: true },
      sourceWebsite:    { type: DataTypes.STRING(255), allowNull: true },

      // ─── Captured server-side (DB only, never emailed) ────
      ipAddress:        { type: DataTypes.STRING(64),  allowNull: true },
      userAgent:        { type: DataTypes.TEXT,        allowNull: true },

      // ─── Admin-panel fields ───────────────────────────────
      status:       { type: DataTypes.ENUM(...STATUS), allowNull: false, defaultValue: 'New' },
      notes:        { type: DataTypes.TEXT,    allowNull: true },
      followUpDate: { type: DataTypes.DATEONLY, allowNull: true },
      assignedTo:   { type: DataTypes.STRING(120), allowNull: true },
      archived:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }

      // createdAt & updatedAt are added automatically (timestamps: true).
    },
    {
      sequelize,
      modelName: 'FranchiseEnquiry',
      tableName: 'franchise_enquiries',
      timestamps: true,
      indexes: [
        { fields: ['email'] },
        { fields: ['mobile'] },
        { fields: ['status'] },
        { fields: ['createdAt'] },
        { fields: ['archived'] }
      ]
    }
  );

  FranchiseEnquiry.STATUS = STATUS;
  return FranchiseEnquiry;
};
