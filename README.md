# 🎱 Pool League Manager

A modern, standalone, offline-ready web application and Progressive Web App (PWA) designed for organizing, scheduling, scoring, and analyzing amateur and competitive pool leagues.

Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**, this app provides tournament directors, team captains, and players with an all-in-one suite: automated round-robin schedule generation, table assignment tracking, live score entry, substitute player management, dynamic handicap calculations, comprehensive season analytics, and print-ready paper scoresheets.

---

## 🌟 Key Features

### 📅 1. Automated Round-Robin Scheduling & Table Allocations
- **Round-Robin Generator**: Creates balanced multi-week tournament schedules for any number of teams.
- **Bye-Week Handling**: Automatically handles odd numbers of teams with structured bye rotations.
- **Table Allocation**: Assigns and balances table rotations across matches so teams don't play on the same table every week.
- **Flexible Match Formats**: Supports 5v5 team matches with individual head-to-head match games.

### 🎯 2. Live Match Scoring & Game Tracker
- **Intuitive Score Entry**: Quick score entry modal for every game in a match.
- **Ball Count & Win Detection**: Log ball points (0–10 scale) and mark the game winner with automatic point validation.
- **🎱 8-Ball Pocketing Track**: Track which player sank the decisive 8-ball for season closing stats.
- **Substitute Integration**: Swap in substitute players directly from the match score sheet without disrupting the primary roster.

### 📊 3. League Overview & Advanced Analytics Dashboard
- **High-Level Season Metrics**:
  - Season game completion rate & games remaining.
  - Cumulative league points scored & player scoring averages.
  - Total 8-balls pocketed across all tournament tables.
  - Total active players and registered substitutes.
- **Average Team Performance Table**:
  - Match records (W–L) and match win rates (%).
  - Individual game records (W–L) and game winning percentage (GWP %).
  - Points-per-game (PPG) and points-per-match (PPM).
  - **vs. League Average Differential**: Visual indicators showing whether a team is outperforming or trailing the league scoring pace.
- **Player Leaderboard & Podium**:
  - Category filters: **Total Points Leaders (MVP)**, **Scoring Average (PPG)**, **Game Win Percentage (GWP %)**, and **8-Ball Closers**.
  - Gold, Silver, and Bronze podium highlights for standout players.

### ⚖️ 4. Dynamic Handicap Calculation (Scale 2–7)
- Computes each player's handicap based on historical scoring averages and game performance:
  - **Handicap 7**: Elite shooters averaging ≥ 9.0 points/game.
  - **Handicap 6**: Advanced players averaging 8.0 – 8.9 points/game.
  - **Handicap 5**: Strong intermediate players averaging 7.0 – 7.9 points/game.
  - **Handicap 4**: Solid league shooters averaging 6.0 – 6.9 points/game.
  - **Handicap 3**: Developing players averaging 4.5 – 5.9 points/game.
  - **Handicap 2**: Novice players averaging < 4.5 points/game.
- Visual handicap badges displayed across rosters, score entry, and standings.

### 👥 5. Team Rosters & Standings
- **Team Standings**: Real-time rankings sorted by total points, match win percentage, and game win rate.
- **Roster Management**: View captains, team members, individual player handicaps, and season contributions.

### 🖨️ 6. Print-Ready Physical Score Sheets
- Generate clean, high-contrast, black-and-white printable score sheets formatted for standard US Letter or A4 paper.
- Perfect for clipboard scoring at pool halls without active digital devices on every table.

### 💾 7. Offline Storage, Data Export & Backup
- **Auto-Saving**: Real-time state persistence to browser `localStorage`. No cloud login or database setup required.
- **JSON Export & Import**: Download `.json` tournament backups to transfer between devices or archive past seasons.
- **Recent Seasons History**: Seamlessly store and switch between recent tournament sessions.

### 📱 8. Progressive Web App (PWA)
- Installable on desktop (macOS, Windows, ChromeOS) and mobile (iOS Safari, Android Chrome).
- Fully functional offline at pool halls or sports bars with weak cellular connectivity.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)
- **PWA Support**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

---

## 🚀 Getting Started & How to Run

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (Node `v20+` or `v22+` recommended)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

Check your versions:
```bash
node -v
npm -v
```

---

### Step 1: Clone or Extract the Project

If cloning from Git:
```bash
git clone https://github.com/your-username/pool-league-manager.git
cd pool-league-manager
```

Or navigate to the project directory:
```bash
cd /path/to/pool-league-manager
```

---

### Step 2: Install Dependencies

Run `npm install` to download and install all required packages:
```bash
npm install
```

*(Alternatively, if using `pnpm`: `pnpm install`)*

---

### Step 3: Run the Development Server

Start the local Vite development server:
```bash
npm run dev
```

The application will spin up and bind to:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://<your-ip-address>:3000/
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

> **Note**: The dev server is pre-configured with `--host=0.0.0.0` and `--port=3000` to allow local network testing (e.g., testing on a mobile tablet or phone on the same Wi-Fi).

---

### Step 4: Build for Production

To create a production-ready, minified bundle:
```bash
npm run build
```

This compiles your TypeScript files, optimizes Tailwind CSS, packages the service worker, and outputs the production artifacts into the `/dist` directory.

---

### Step 5: Preview the Production Build

To test the compiled production build locally before deployment:
```bash
npm run preview
```

Vite will serve the `/dist` directory locally on `http://localhost:3000`.

---

### Step 6: Code Quality & Type Checking

To validate all TypeScript typings across the project:
```bash
npm run lint
```

---

## 📂 Project Structure

```text
├── index.html                  # HTML entry point with metadata and PWA manifest link
├── package.json                # Project dependencies and execution scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite plugins (React, Tailwind CSS v4, PWA)
├── public/
│   └── icon.svg                # Application icon / PWA asset
└── src/
    ├── main.tsx                # Application React DOM root entry
    ├── App.tsx                 # Main layout, tab navigation, modals, and persistence state
    ├── index.css               # Tailwind CSS entry (@import "tailwindcss")
    ├── types.ts                # Core data models (Tournaments, Teams, Scores, Stats)
    ├── components/
    │   ├── Header.tsx              # Top navigation bar, season selector, import/export
    │   ├── ScheduleView.tsx        # Round-robin match listings by day, scores & tables
    │   ├── ScoreEntryModal.tsx     # Game scoring dialog, points input, 8-ball toggle
    │   ├── SubstituteModal.tsx     # Substitute assignment modal
    │   ├── StatsDashboard.tsx      # Comprehensive stats tabs (Overview, Overall, Weekly)
    │   ├── LeagueOverviewPanel.tsx # Season metrics, team differential, player leaderboards
    │   ├── TeamStandings.tsx       # Standings table (Pts, Wins, Losses, GWP, Handicaps)
    │   ├── TeamsRosterView.tsx     # Roster lists, team members, captains
    │   ├── NewTournamentWizard.tsx # Multi-step wizard to configure new seasons
    │   ├── PrintableScoreSheet.tsx # Clean print layout for paper clipboards
    │   └── InstallHelpModal.tsx    # PWA installation instructions for iOS and Android
    ├── hooks/
    │   └── usePWAInstall.ts        # Hook managing beforeinstallprompt & installation state
    └── utils/
        ├── scheduler.ts            # Round-robin algorithm and table assignment logic
        ├── stats.ts                # Handicap formula (2-7), GWP, and league analytics
        └── storage.ts              # LocalStorage handling, sample dataset, and JSON file I/O
```

---

## 📖 User Guide: How to Use the App

### 1. Creating a New League / Season
1. Click the **"New Season"** button in the top navigation bar.
2. Enter your league details:
   - League Name (e.g., *"Spring 8-Ball Championship"*).
   - Season Start Date.
   - Number of Tables available at the venue.
3. Configure your teams and rosters:
   - Add team names.
   - Enter player names (5 primary players per team) and designate team captains.
4. Click **"Generate Schedule"** — the round-robin engine instantly allocates matches, rounds, dates, and tables.

### 2. Entering Match Scores
1. Go to the **Schedule** tab.
2. Select the current match day using the day selector.
3. Find your match card and click on any game row to open the **Score Entry Modal**.
4. Enter the points scored by each player (0–10).
5. Toggle the **"🎱 Sunk 8-Ball"** badge for the winning shooter.
6. Click **"Save Score"**. Standings, handicaps, and league leaderboards update immediately.

### 3. Using Substitute Players
1. On the match card, click the **"Sub"** button next to a player's slot.
2. Choose from existing registered substitutes or enter a new substitute's name.
3. Scores entered for that game will record under the substitute's record while contributing to the team's match points.

### 4. Printing Score Sheets for Clipboards
1. In the **Schedule** tab, click **"Print Scoresheets"**.
2. A high-contrast, black-and-white printable scoresheet is formatted for your browser's Print Dialog.
3. Print to paper or save as PDF for physical scorekeeping at the tables.

### 5. Backing Up & Sharing League Data
1. In the top navigation bar, click the **Export (Download)** icon to save `tournament-data.json`.
2. To restore or switch devices, click the **Import (Upload)** icon and select your previously saved JSON file.

---

## 📱 Installing as a PWA (Mobile & Desktop)

- **Chrome / Edge (Desktop)**: Click the Install icon in the browser address bar or click the **"Install App"** button in the top bar.
- **iPhone / iPad (iOS Safari)**: Tap the **Share** button (box with upward arrow) and select **"Add to Home Screen"**.
- **Android (Chrome)**: Tap the menu (three dots) and select **"Install app"** or **"Add to Home screen"**.

---

## 📄 License

This project is open-source and available under the **MIT License**.
Feel free to customize, extend, and adapt it for your local pool halls, leagues, and tournaments!
