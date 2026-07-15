'use strict';
const sequelize = require('../config/database');
const FranchiseEnquiry = require('./FranchiseEnquiry')(sequelize);

// Register future models + associations here.
const db = { sequelize, FranchiseEnquiry };
module.exports = db;
