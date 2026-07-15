'use strict';
const nodemailer = require('nodemailer');
const env = require('../config/env');

// Build a transporter from env. If SMTP creds are missing (dev), fall back to
// a JSON transport so the app never crashes — the email payload is logged.
function buildTransport() {
  if (env.smtp.host && env.smtp.user && env.smtp.pass) {
    return nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    });
  }
  console.warn('[email] SMTP not configured — using JSON transport (dev). Set SMTP_* env vars for real delivery.');
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = buildTransport();

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Sends the enquiry email. Includes ONLY customer information + source + date.
 * Deliberately excludes IP Address and User Agent.
 */
async function sendEnquiryEmail(enquiry) {
  const dt = new Date(enquiry.createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata'
  });

  const rows = [
    ['Full Name', enquiry.fullName],
    ['Mobile Number', enquiry.mobile],
    ['Email', enquiry.email],
    ['City', enquiry.city],
    ['State', enquiry.state],
    ['Investment Budget', enquiry.investmentBudget || '—'],
    ['Message', enquiry.message || '—'],
    ['Source Website', enquiry.sourceWebsite || '—'],
    ['Date & Time', dt]
  ];

  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  const html =
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #eee;border-radius:10px;overflow:hidden">
      <div style="background:#5D2C8E;color:#fff;padding:18px 22px;font-size:18px;font-weight:700">New Franchise Enquiry — Kulche Wali Gali</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#2E0F52">
        ${rows.map(([k, v]) => `<tr>
          <td style="padding:10px 22px;font-weight:700;background:#faf7f0;width:170px;vertical-align:top">${escapeHtml(k)}</td>
          <td style="padding:10px 22px;border-bottom:1px solid #f0ece0">${escapeHtml(v)}</td></tr>`).join('')}
      </table>
    </div>`;

  return transporter.sendMail({
    from: env.mailFrom,
    to: env.mailTo,
    replyTo: enquiry.email,
    subject: 'New Franchise Enquiry - Kulche Wali Gali',
    text,
    html
  });
}

module.exports = { sendEnquiryEmail, transporter };
