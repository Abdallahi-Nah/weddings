# مدير صندوق الأعراس —   Wedding Fund Manager

A **MERN-stack Progressive Web App** for managing group wedding contributions and expenses. Supports Arabic (RTL), French, and English.

## Features
- 🔐 Single Supervisor account (JWT auth)
- 💰 Track contributions per wedding event
- 💸 Track expenses per wedding event
- 📊 Live balance (Contributions − Expenses)
- 📄 PDF report export (AR/FR/EN, fully RTL-aware)
- 🌐 Multilingual: Arabic (default), French, English
- 📱 Installable PWA

---

## Local Development

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas connection string
- Google Chrome installed (for Puppeteer PDF generation)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd weddings_app

# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your real values
```

### 3. Seed the database (first run only)

```bash
cd server
node scripts/seed.js
```

### 4. Run in development

```bash
# Terminal 1 — API server (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173 — login with phone/password from your `.env`.

---

## Vercel Deployment

> **Architecture:** The Express server is deployed as a single Vercel Serverless Function. Puppeteer PDF generation requires `@sparticuz/chromium` and a function memory of ≥ 2048 MB configured in Vercel.

### Step 1 — Connect repo to Vercel

1. Push this repo to GitHub/GitLab.
2. In [vercel.com](https://vercel.com), click **New Project** → import the repo.
3. Vercel auto-detects `vercel.json` at the root.

### Step 2 — Set Environment Variables in Vercel

Go to **Project Settings → Environment Variables** and add:

| Key | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret (e.g. `openssl rand -hex 32`) |
| `ADMIN_PHONE` | Supervisor phone number |
| `ADMIN_PASSWORD` | Supervisor password |
| `CLIENT_ORIGIN` | Your Vercel frontend URL (e.g. `https://weddings.vercel.app`) |
| `NODE_ENV` | `production` |

### Step 3 — Deploy

Click **Deploy**. Vercel builds the client (`npm run build` in `client/`) and deploys the serverless function at `/api`.

### Step 4 — Configure API URL in Client (Production)

The client uses Vite's proxy for local dev. In production on Vercel, the client and API are on the same domain, so `/api` routes work automatically.

If you deploy the backend separately, add:
```
VITE_API_URL=https://your-backend.railway.app
```
And update `client/src/services/api.js` to use `import.meta.env.VITE_API_URL || ''`.

---

## Project Structure

```
weddings_app/
├── client/          # React + Vite PWA frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/        # usePWAInstall.js
│   │   ├── services/     # api.js (Axios)
│   │   ├── i18n/         # AR/FR/EN translations
│   │   └── styles/
│   └── vite.config.js
├── server/          # Express.js backend
│   ├── api/         # Vercel serverless entry
│   ├── routes/      # REST API routes
│   ├── models/      # Mongoose schemas
│   ├── middleware/  # JWT auth
│   ├── utils/       # pdfGenerator.js (Puppeteer)
│   └── templates/   # report.ejs (HTML→PDF)
└── vercel.json      # Vercel deployment config
```
