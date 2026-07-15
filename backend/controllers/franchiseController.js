'use strict';
const enquiryService = require('../services/enquiryService');
const exportService = require('../services/exportService');
const { sendEnquiryEmail } = require('../services/emailService');

function clientIp(req) {
  const xf = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || req.ip || req.connection?.remoteAddress || null;
}

// POST /api/franchise-enquiry  (public)
async function create(req, res, next) {
  try {
    // Honeypot: if the hidden "website" field is filled, silently accept (bot).
    if (req.body.website && String(req.body.website).trim() !== '') {
      return res.status(200).json({ success: true, message: 'Thank you!' });
    }

    const payload = {
      fullName: req.body.fullName,
      mobile: req.body.mobile,
      email: req.body.email,
      city: req.body.city,
      state: req.body.state,
      investmentBudget: req.body.investmentBudget || null,
      message: req.body.message || null,
      sourceWebsite: req.body.sourceWebsite || req.headers.referer || null,
      ipAddress: clientIp(req),                 // stored in DB only
      userAgent: req.headers['user-agent'] || null // stored in DB only
    };

    // Duplicate detection (same email OR mobile within the window).
    const dup = await enquiryService.findRecentDuplicate(payload.email, payload.mobile);
    if (dup) {
      return res.status(200).json({
        success: true, duplicate: true,
        message: 'You have already submitted an enquiry recently. Our team will contact you shortly.'
      });
    }

    const enquiry = await enquiryService.createEnquiry(payload);

    // Fire the email but never fail the request if SMTP has a hiccup —
    // the enquiry is already safely stored in our own database.
    sendEnquiryEmail(enquiry).catch(err => console.error('[email] send failed:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your franchise enquiry has been submitted successfully. Our team will contact you shortly.',
      id: enquiry.id
    });
  } catch (err) { next(err); }
}

// GET /api/franchise-enquiry  (admin: search/filter/sort/pagination)
async function list(req, res, next) {
  try { res.json({ success: true, ...(await enquiryService.listEnquiries(req.query)) }); }
  catch (err) { next(err); }
}

// GET /api/franchise-enquiry/:id
async function getOne(req, res, next) {
  try {
    const row = await enquiryService.getEnquiry(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

// PUT /api/franchise-enquiry/:id  (status / notes / follow-up / assignee / archive)
async function update(req, res, next) {
  try {
    const row = await enquiryService.updateEnquiry(req.params.id, req.body);
    if (!row) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
}

// DELETE /api/franchise-enquiry/:id
async function remove(req, res, next) {
  try {
    const ok = await enquiryService.deleteEnquiry(req.params.id);
    if (!ok) return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    res.json({ success: true, message: 'Enquiry deleted.' });
  } catch (err) { next(err); }
}

// GET /api/franchise-enquiry/export/csv  &  /export/excel
async function exportCsv(req, res, next) {
  try {
    const rows = await enquiryService.allForExport(req.query);
    res.header('Content-Type', 'text/csv');
    res.attachment('franchise-enquiries.csv');
    res.send(exportService.toCSV(rows.map(r => r.toJSON())));
  } catch (err) { next(err); }
}

async function exportExcel(req, res, next) {
  try {
    const rows = await enquiryService.allForExport(req.query);
    const buf = await exportService.toExcelBuffer(rows);
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.attachment('franchise-enquiries.xlsx');
    res.send(Buffer.from(buf));
  } catch (err) { next(err); }
}

module.exports = { create, list, getOne, update, remove, exportCsv, exportExcel };
