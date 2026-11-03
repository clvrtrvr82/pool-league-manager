# 🚂 Deploying Pool League Manager to Railway with PostgreSQL & GitHub

This project is fully configured for automated continuous deployment on **Railway** with a managed **PostgreSQL** database and continuous delivery from **GitHub**.

---

## 🌟 Architecture Overview

- **Full-Stack Application**: Node.js + Express (`server.ts`) hosting the React 19 / Vite SPA, API endpoints (`/api/tournaments`, `/api/health`, `/api/status`), and static assets.
- **Database**: PostgreSQL on Railway (via `DATABASE_URL`), storing tournaments, match records, rosters, and schedules with automatic schema creation (`tournaments` table).
- **Graceful Fallback**: If `DATABASE_URL` is not set (e.g. running locally or offline), the app falls back to local storage and in-memory cache without failing.
- **Continuous Deployment**: Every push to your GitHub `main` branch automatically triggers Railway to build (`npm run build`) and restart your app.

---

## 🚀 Step 1: Publish Your Code to GitHub

### Option A: Using the Included Helper Script

- **On Mac/Linux**:
  ```bash
  chmod +x setup-github.sh
  ./setup-github.sh
  ```
- **On Windows**:
  Double-click `setup-github.bat` or run it in Command Prompt / PowerShell.

### Option B: Manual Git Commands

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g., `pool-league-manager`). Leave it empty (do **not** initialize with a README, .gitignore, or license).
2. In your local project directory, run:
   ```bash
   git init -b main
   git add .
   git commit -m "Deploy Pool League Manager with Railway and PostgreSQL"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

---

## 🚂 Step 2: Deploy on Railway

1. Log in to [Railway.app](https://railway.app/).
2. Click **"+ New Project"** (or go to [railway.app/new](https://railway.app/new)).
3. Select **"Deploy from GitHub repo"**.
4. Choose your `pool-league-manager` repository from the list.
5. Railway will automatically detect the Node project, use the included `railway.json` (Nixpacks builder), and run `npm run build` and `npm start`.

---

## 🗄️ Step 3: Add PostgreSQL Database (1-Click)

1. In your Railway project view, click the **"+ New"** button in the top right.
2. Select **"Database"** → **"Add PostgreSQL"**.
3. Railway immediately provisions a managed PostgreSQL instance and automatically injects the `DATABASE_URL` environment variable into your project!
4. Click into your Web Service settings → **Variables** to confirm `DATABASE_URL` is connected (or click "Add Reference" if services were created separately).
5. Railway will redeploy the service. On startup, the server automatically connects to PostgreSQL, creates the `tournaments` table, and starts saving your data!

---

## 🔍 Step 4: Verify Deployment & Health Check

- **App URL**: In Railway, go to your Web Service → **Settings** → **Networking** → Click **"Generate Domain"** (e.g., `https://pool-league-manager-production.up.railway.app`).
- **Health Check**: Visit `https://your-domain.up.railway.app/api/health` in your browser. You should see:
  ```json
  {
    "status": "ok",
    "uptime": 42.5,
    "environment": "production",
    "database": {
      "connected": true,
      "type": "postgres",
      "message": "PostgreSQL online (1 tournament(s) stored)",
      "databaseUrlConfigured": true
    }
  }
  ```

---

## 📁 Key Deployment Files

- `railway.json`: Declares Nixpacks builder, start command (`npm start`), and `/api/health` healthcheck endpoint.
- `Procfile`: Standard process manager configuration (`web: npm start`).
- `Dockerfile`: Multi-stage Docker container build (alternative to Nixpacks).
- `server.ts`: Express server handling both `/api/*` REST endpoints and static SPA serving.
- `src/server/db.ts`: PostgreSQL connection pool with SSL handling, automatic table schema creation, and local fallback.
