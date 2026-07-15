'use strict';
const sequelize = require('../config/database');
const FranchiseEnquiry = require('./FranchiseEnquiry')(sequelize);
const AdminUser = require('./AdminUser')(sequelize);

// Register future models + associations here.
const db = { sequelize, FranchiseEnquiry, AdminUser };
module.exports = db;
