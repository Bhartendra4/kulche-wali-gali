'use strict';
const { Op } = require('sequelize');
const { FranchiseEnquiry } = require('../models');
const env = require('../config/env');

const SORTABLE = ['createdAt', 'updatedAt', 'fullName', 'city', 'state', 'status'];

async function findRecentDuplicate(email, mobile) {
  const since = new Date(Date.now() - env.duplicateWindowMinutes * 60 * 1000);
  return FranchiseEnquiry.findOne({
    where: {
      createdAt: { [Op.gte]: since },
      [Op.or]: [{ email }, { mobile }]
    },
    order: [['createdAt', 'DESC']]
  });
}

async function createEnquiry(data) {
  return FranchiseEnquiry.create(data);
}

async function listEnquiries(query = {}) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const offset = (page - 1) * limit;

  const where = {};
  if (query.status) where.status = query.status;
  if (query.assignedTo) where.assignedTo = query.assignedTo;
  if (query.archived !== undefined) where.archived = String(query.archived) === 'true';
  if (query.search) {
    const like = { [Op.like]: `%${query.search}%` };
    where[Op.or] = [
      { fullName: like }, { email: like }, { mobile: like },
      { city: like }, { state: like }, { message: like }
    ];
  }

  const sortBy = SORTABLE.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortDir = String(query.sortDir || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { rows, count } = await FranchiseEnquiry.findAndCountAll({
    where, limit, offset, order: [[sortBy, sortDir]]
  });

  return {
    data: rows,
    pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
  };
}

const getEnquiry = (id) => FranchiseEnquiry.findByPk(id);

async function updateEnquiry(id, data) {
  const row = await FranchiseEnquiry.findByPk(id);
  if (!row) return null;
  // Only allow admin-editable fields to be updated.
  const allowed = ['status', 'notes', 'followUpDate', 'assignedTo', 'archived'];
  const patch = {};
  for (const k of allowed) if (data[k] !== undefined) patch[k] = data[k];
  await row.update(patch);
  return row;
}

async function deleteEnquiry(id) {
  const row = await FranchiseEnquiry.findByPk(id);
  if (!row) return false;
  await row.destroy();
  return true;
}

async function allForExport(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.archived !== undefined) where.archived = String(query.archived) === 'true';
  return FranchiseEnquiry.findAll({ where, order: [['createdAt', 'DESC']] });
}

module.exports = {
  findRecentDuplicate, createEnquiry, listEnquiries,
  getEnquiry, updateEnquiry, deleteEnquiry, allForExport
};
