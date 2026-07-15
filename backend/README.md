# Kulche Wali Gali — Franchise Enquiry Backend

Production-ready **Node.js + Express** API that stores every franchise enquiry in
**your own database** (PostgreSQL preferred, SQLite for dev) and emails it to
`contact@pinkspoonfood.com` via **Nodemailer/SMTP**.

No third-party form service (Web3Forms / Formspree / EmailJS), no `mailto`, no WhatsApp.

---

## 1. Folder structure

```
backend/
├── server.js                 # entry point (boots DB + HTTP server)
├── app.js                    # Express app, middleware, routes
├── package.json
├── .env.example              # copy to .env and fill in
├── config/
│   ├── env.js                # typed env loader
│   └── database.js           # Sequelize instance (Postgres or SQLite)
├── models/
│   ├── index.js
│   └── FranchiseEnquiry.js   # table definition
├── controllers/
│   └── franchiseController.js
├── routes/
│   ├── index.js              # mounts /api
│   └── franchiseRoutes.js
├── middleware/
│   ├── security.js           # helmet + CORS
│   ├── rateLimiter.js        # rate limiting
│   ├── validators.js         # server-side validation + sanitisation + honeypot
│   └── errorHandler.js
├── services/
│   ├── enquiryService.js     # DB logic (search/filter/sort/paginate/duplicate)
│   ├── emailService.js       # Nodemailer (customer info only)
│   └── exportService.js      # CSV + Excel export
├── database/
│   ├── migrate.js            # dev sync
│   └── migrations/001_create_franchise_enquiries.sql   # Postgres DDL
└── uploads/
```
> The **frontend** is the existing static site at the repository root (`index.html` + `assets/`),
> served by GitHub Pages. It POSTs to this backend's API.

---

## 2. Database schema — `franchise_enquiries`

| Column             | Type                                   | Notes                                   |
|--------------------|----------------------------------------|-----------------------------------------|
| id                 | BIGSERIAL / INTEGER PK                  | Primary key                             |
| fullName           | VARCHAR(120) NOT NULL                   | Customer                                |
| mobile             | VARCHAR(20)  NOT NULL                   | Customer                                |
| email              | VARCHAR(160) NOT NULL                   | Customer                                |
| city               | VARCHAR(80)  NOT NULL                   | Customer                                |
| state              | VARCHAR(80)  NOT NULL                   | Customer                                |
| investmentBudget   | VARCHAR(80)                            | Customer                                |
| message            | TEXT                                   | Customer                                |
| sourceWebsite      | VARCHAR(255)                           | Stored **and** emailed                  |
| ipAddress          | VARCHAR(64)                            | **DB only — never emailed**             |
| userAgent          | TEXT                                   | **DB only — never emailed**             |
| status             | ENUM('New','Contacted','Follow Up','Closed') DEFAULT 'New' | Lead status |
| notes              | TEXT                                   | Admin                                   |
| followUpDate       | DATE                                   | Admin                                   |
| assignedTo         | VARCHAR(120)                           | Admin                                   |
| archived           | BOOLEAN DEFAULT false                  | Admin                                   |
| createdAt          | TIMESTAMPTZ DEFAULT now()              | "Date & Time"                           |
| updatedAt          | TIMESTAMPTZ DEFAULT now()              |                                         |

Indexes on `email`, `mobile`, `status`, `createdAt`, `archived` — ready for an Admin
Panel with search / filter / sort / pagination / export / lead-status / notes /
follow-up / assignee / delete / archive.

---

## 3. Backend architecture

`Request → helmet → CORS → JSON parser → route → [rate limit] → [validation + honeypot]
→ controller → service (Sequelize, parameterised) → PostgreSQL/SQLite → Nodemailer email
→ JSON response`

- **SQL injection** — all queries go through Sequelize (parameterised).
- **XSS** — inputs are trimmed + HTML-escaped (`express-validator`); helmet sets headers.
- **Spam** — hidden **honeypot** field (`website`), **rate limiting**, and
  **duplicate detection** (same email/mobile within `DUPLICATE_WINDOW_MINUTES`).
- **Email safety** — the enquiry is saved first; email is fire-and-forget so an SMTP
  hiccup never loses a lead. The email contains **only customer info** (no IP/UA).

---

## 4. API documentation

Base URL: `http://<host>:<PORT>/api`

### `POST /api/franchise-enquiry`  (public)
Body (JSON):
```json
{ "fullName":"", "mobile":"", "email":"", "city":"", "state":"",
  "investmentBudget":"", "message":"", "sourceWebsite":"", "website":"" }
```
`website` is the honeypot (must be empty). IP + User-Agent are captured server-side.

Responses: `201` success · `200` `{duplicate:true}` · `422` validation error · `429` rate limited.

### `GET /api/franchise-enquiry`  (admin)
Query: `page, limit, search, status, assignedTo, archived, sortBy, sortDir`.
Returns `{ success, data:[...], pagination:{ page, limit, total, totalPages } }`.

### `GET /api/franchise-enquiry/:id`   — single record
### `PUT /api/franchise-enquiry/:id`   — update `status | notes | followUpDate | assignedTo | archived`
### `DELETE /api/franchise-enquiry/:id` — delete
### `GET /api/franchise-enquiry/export/csv`   — CSV download
### `GET /api/franchise-enquiry/export/excel` — Excel (.xlsx) download
### `GET /api/health` — health check

> Protect the GET/PUT/DELETE/export routes behind authentication when you build the Admin Panel.

---

## 5. Environment variables (`.env`)

```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://bhartendra4.github.io       # your frontend origin(s), comma-separated
DATABASE_URL=postgres://user:pass@host:5432/db  # leave empty to use SQLite in dev
SQLITE_STORAGE=./database/franchise.sqlite
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@pinkspoonfood.com
SMTP_PASS=your_smtp_password
MAIL_FROM="Kulche Wali Gali <contact@pinkspoonfood.com>"
MAIL_TO=contact@pinkspoonfood.com
DUPLICATE_WINDOW_MINUTES=10
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW_MINUTES=15
```

---

## 6. Deployment steps

**Local / dev (SQLite):**
```bash
cd backend
cp .env.example .env      # leave DATABASE_URL empty for SQLite
npm install
npm run migrate           # create tables
npm start                 # http://localhost:5000
```

**Production (PostgreSQL, e.g. Render / Railway / VPS):**
1. Provision a PostgreSQL database; set `DATABASE_URL`.
2. Run the migration: `psql "$DATABASE_URL" -f database/migrations/001_create_franchise_enquiries.sql`
   (or `npm run migrate`).
3. Set all SMTP + CORS env vars.
4. Deploy: `npm install && npm start` (Render/Railway auto-detect; or use `pm2 start server.js`).
5. In the **frontend** (`index.html`), set `FRANCHISE_API_URL` (in the franchise submit
   handler) to your deployed backend URL, e.g. `https://api.pinkspoonfood.com`. Commit & push.

**CORS:** add your GitHub Pages URL (and custom domain) to `CORS_ORIGIN`.

---

## 7. Security checklist
Server-side validation ✓ · Rate limiting ✓ · Honeypot ✓ · Email + mobile validation ✓ ·
Duplicate detection ✓ · SQL-injection safe (Sequelize) ✓ · XSS-escaped inputs + helmet ✓ ·
Configurable CORS ✓ · Secrets in `.env` (git-ignored) ✓.
