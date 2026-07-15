'use strict';
const { body, validationResult } = require('express-validator');

const MOBILE_RE = /^[0-9+\-\s()]{7,20}$/;

// Validation + sanitisation for public enquiry creation.
// .trim().escape() neutralises XSS; Sequelize params prevent SQL injection.
const createRules = [
  body('website').optional().isString(),                 // honeypot (must be empty)
  body('fullName').trim().notEmpty().withMessage('Full name is required.').isLength({ max: 120 }).escape(),
  body('mobile').trim().notEmpty().withMessage('Mobile number is required.')
    .matches(MOBILE_RE).withMessage('Please enter a valid mobile number.'),
  body('email').trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('city').trim().notEmpty().withMessage('City is required.').isLength({ max: 80 }).escape(),
  body('state').trim().notEmpty().withMessage('State is required.').isLength({ max: 80 }).escape(),
  body('investmentBudget').optional().trim().isLength({ max: 80 }).escape(),
  body('message').optional().trim().isLength({ max: 2000 }).escape(),
  body('sourceWebsite').optional().trim().isLength({ max: 255 })
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

module.exports = { createRules, handleValidation };
