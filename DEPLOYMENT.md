# Kulche Wali Gali — Production Deployment Guide

The backend now serves **everything from one origin**: the marketing site (`/`),
the admin dashboard (`/admin`), and the API (`/api`). So you only need to run one
Node process and point `kulchewaligali.com` at it to get
`https://kulchewaligali.com/admin` working from any device.

- Node.js: v18+ (v20 recommended)
- Start command: `cd backend && node server.js` (listens on `PORT`, default 5000)
- Health check: `GET /api/health` → `{"success":true}`
- Database: SQLite file at `backend/database/franchise.sqlite` (or PostgreSQL via `DATABASE_URL`)

> **Data-persistence rule:** SQLite is a file on disk. It persists on a VPS. On
> ephemeral platforms (Render/Railway default) you MUST attach a persistent disk
> or switch to managed PostgreSQL, or enquiries are lost on every restart.

---

## Option A — VPS (recommended: SQLite persists, full control)

Best fit if you have/get a small Linux VPS (Hostinger VPS, DigitalOcean, etc.).

### 1. Point DNS at the server
In your DNS provider, create records for the VPS public IP:
```
A    @      <VPS_IP>
A    www    <VPS_IP>
```
(If the domain is currently on GitHub Pages/static hosting, this moves it to the
VPS — which now serves the same frontend, so the site keeps working.)

### 2. On the server (via SSH)
```bash
# install Node 20 + git + nginx + certbot
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx certbot python3-certbot-nginx
sudo npm i -g pm2

# get the code
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/Bhartendra4/kulche-wali-gali.git
cd kulche-wali-gali/backend
npm install
```

### 3. Create the production `.env` on the server
```bash
cp .env.example .env
nano .env      # set the values below
```
Required values:
```
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://kulchewaligali.com,https://www.kulchewaligali.com
DATABASE_URL=                         # empty = SQLite (persists on the VPS)
SESSION_SECRET=<64-char random>       # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=contact@pinkspoonfood.com
SMTP_PASS=<real mailbox password>
MAIL_FROM="Kulche Wali Gali <contact@pinkspoonfood.com>"
MAIL_TO=contact@pinkspoonfood.com
```

### 4. Start the app + reverse proxy + SSL
```bash
# run the app under PM2 (auto-restarts, survives reboot)
pm2 start ecosystem.config.js
pm2 save && pm2 startup     # follow the printed command

# nginx reverse proxy
sudo cp /var/www/kulche-wali-gali/deploy/nginx.kulchewaligali.com.conf \
        /etc/nginx/sites-available/kulchewaligali.com
sudo ln -s /etc/nginx/sites-available/kulchewaligali.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# free HTTPS certificate
sudo certbot --nginx -d kulchewaligali.com -d www.kulchewaligali.com
```

Done → `https://kulchewaligali.com` (site) and `https://kulchewaligali.com/admin` (panel).

### Updating later
```bash
cd /var/www/kulche-wali-gali && git pull && cd backend && npm install && pm2 restart kwg-backend
```

---

## Option B — Render / Railway (managed, no server admin)

1. Push is already done — the repo contains `render.yaml` and a `Dockerfile`.
2. On Render: **New → Blueprint**, connect the GitHub repo `Bhartendra4/kulche-wali-gali`.
   Render reads `render.yaml`, creates the web service **and a persistent disk** for the DB.
3. In the service **Environment**, set the secret `SMTP_PASS` = real mailbox password.
   (`SESSION_SECRET` is auto-generated; other vars come from the blueprint.)
4. Deploy. You get `https://kulche-wali-gali.onrender.com` — verify `/admin` there first.
5. **Custom domain:** Render → Settings → Custom Domains → add `kulchewaligali.com`
   and `www`. Render shows the DNS records to create (a CNAME/ALIAS). Add them at your
   DNS provider. Render auto-provisions SSL. Now `https://kulchewaligali.com/admin` works.

> Railway/Fly.io work the same way — use the `Dockerfile`, add a volume mounted at
> `backend/database`, set the env vars, add the custom domain.

---

## Post-deploy verification (any option)
```
GET  https://kulchewaligali.com/api/health         -> {"success":true}
GET  https://kulchewaligali.com/admin              -> login page
POST https://kulchewaligali.com/api/franchise-enquiry (submit the site's form) -> saved
```
Then log in at `/admin` with `admin` / `ChangeMe@123` (forces a password change),
and confirm the enquiry appears in the dashboard.

## Notes
- `trust proxy` is enabled and session cookies use `secure:'auto'`, so HTTPS behind
  a proxy is handled correctly and login works on any device.
- IP address & User Agent are stored in the DB and shown only in the admin detail
  view — never in the table and never in emails.
- Keep `backend/.env` OUT of git (already git-ignored). Never commit real secrets.
