'use strict';
const ExcelJS = require('exceljs');

const COLUMNS = [
  ['id', 'ID'], ['fullName', 'Full Name'], ['mobile', 'Mobile'], ['email', 'Email'],
  ['city', 'City'], ['state', 'State'], ['investmentBudget', 'Investment Budget'],
  ['message', 'Message'], ['sourceWebsite', 'Source Website'], ['status', 'Status'],
  ['assignedTo', 'Assigned To'], ['followUpDate', 'Follow-up Date'], ['createdAt', 'Created At']
];

function toCSV(rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const header = COLUMNS.map(([, label]) => esc(label)).join(',');
  const body = rows.map(r => COLUMNS.map(([key]) => esc(r[key])).join(',')).join('\n');
  return header + '\n' + body;
}

async function toExcelBuffer(rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Franchise Enquiries');
  ws.columns = COLUMNS.map(([key, label]) => ({ header: label, key, width: 22 }));
  rows.forEach(r => ws.addRow(r.toJSON ? r.toJSON() : r));
  ws.getRow(1).font = { bold: true };
  return wb.xlsx.writeBuffer();
}

module.exports = { toCSV, toExcelBuffer };
