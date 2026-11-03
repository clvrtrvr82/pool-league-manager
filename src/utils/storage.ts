import { IndividualGame, PoolDay, Team, TournamentConfig, TournamentData } from '../types';
import { generateTournamentSchedule } from './scheduler';

const STORAGE_KEY = 'pool_league_manager_current_v2';
const RECENT_LIST_KEY = 'pool_league_manager_recents_v2';

export interface RecentTournamentSummary {
  id: string;
  name: string;
  startDate: string;
  lastModified: string;
  teamsCount: number;
}

/**
 * Saves tournament data into browser LocalStorage.
 */
export function saveTournamentToStorage(data: TournamentData): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);

    // Also update recents list
    const recents = getRecentTournamentsList();
    const existingIdx = recents.findIndex((r) => r.id === data.config.id);
    const summary: RecentTournamentSummary = {
      id: data.config.id,
      name: data.config.name,
      startDate: data.config.startDate,
      lastModified: new Date().toISOString(),
      teamsCount: data.teams.length,
    };

    if (existingIdx >= 0) {
      recents[existingIdx] = summary;
    } else {
      recents.unshift(summary);
    }
    // Keep max 10
    localStorage.setItem(RECENT_LIST_KEY, JSON.stringify(recents.slice(0, 10)));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Loads current working tournament from LocalStorage.
 */
export function loadTournamentFromStorage(): TournamentData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('pool_league_manager_current_v1');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TournamentData;
    // Auto-upgrade sample tournament if it has the older 6-game schedule
    if (parsed.config?.id === 'sample-league-2026' && (parsed.days?.[0]?.matches?.[0]?.games?.length || 0) < 18) {
      return createSampleTournament();
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}

/**
 * Returns summary list of recent tournaments saved in this browser.
 */
export function getRecentTournamentsList(): RecentTournamentSummary[] {
  try {
    const raw = localStorage.getItem(RECENT_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves current tournament directly to user's computer as a .json file download.
 */
export function exportTournamentToFile(data: TournamentData): void {
  const safeName = (data.config.name || 'pool-league').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${safeName}-${dateStr}.json`;

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads a tournament file (.json) uploaded from user's computer.
 */
export function importTournamentFromFile(file: File): Promise<TournamentData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.config || !parsed.teams || !parsed.days) {
          throw new Error('Invalid pool league file structure. Missing config, teams, or days.');
        }
        resolve(parsed as TournamentData);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Failed to parse file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsText(file);
  });
}

/**
 * Generates a realistic sample 4-team pool league with ready-made schedule
 * and Week 1 scores so users can immediately test all screens and stats.
 */
export function createSampleTournament(): TournamentData {
  const config: TournamentConfig = {
    id: 'sample-league-2026',
    name: 'Wednesday Night 8-Ball League',
    startDate: '2026-09-16',
    poolDaysPerWeek: 1,
    selectedDaysOfWeek: ['Wednesday'],
    totalPoolDays: 8,
    numTables: 2,
    numTeams: 4,
    playersPerTeam: 3,
    pointsPerBall: 1,
    pointsFor8Ball: 3,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };

  const teams: Team[] = [
    {
      id: 'team-1',
      name: 'Rack Runners',
      captainId: 'p-1',
      players: [
        { id: 'p-1', name: 'Frank Reynolds', teamId: 'team-1', isCaptain: true, phone: '555-0101' },
        { id: 'p-2', name: 'Dennis Reynolds', teamId: 'team-1', isCaptain: false, phone: '555-0102' },
        { id: 'p-3', name: 'Charlie Kelly', teamId: 'team-1', isCaptain: false, phone: '555-0103' },
      ],
    },
    {
      id: 'team-2',
      name: '8-Ball Hustlers',
      captainId: 'p-4',
      players: [
        { id: 'p-4', name: 'Mac McDonald', teamId: 'team-2', isCaptain: true, phone: '555-0201' },
        { id: 'p-5', name: 'Dee Reynolds', teamId: 'team-2', isCaptain: false, phone: '555-0202' },
        { id: 'p-6', name: 'Cricket Rick', teamId: 'team-2', isCaptain: false, phone: '555-0203' },
      ],
    },
    {
      id: 'team-3',
      name: 'Corner Pocket Aces',
      captainId: 'p-7',
      players: [
        { id: 'p-7', name: 'Hank Hill', teamId: 'team-3', isCaptain: true, phone: '555-0301' },
        { id: 'p-8', name: 'Dale Gribble', teamId: 'team-3', isCaptain: false, phone: '555-0302' },
        { id: 'p-9', name: 'Bill Dauterive', teamId: 'team-3', isCaptain: false, phone: '555-0303' },
      ],
    },
    {
      id: 'team-4',
      name: 'Break & Run Masters',
      captainId: 'p-10',
      players: [
        { id: 'p-10', name: 'Boomhauer Jeff', teamId: 'team-4', isCaptain: true, phone: '555-0401' },
        { id: 'p-11', name: 'Bobby Hill', teamId: 'team-4', isCaptain: false, phone: '555-0402' },
        { id: 'p-12', name: 'Lucky Kleinschmidt', teamId: 'team-4', isCaptain: false, phone: '555-0403' },
      ],
    },
  ];

  const days = generateTournamentSchedule(config, teams);

  // Prepopulate Week 1 with realistic scores so user can see stats right away
  if (days.length > 0) {
    const week1 = days[0];
    week1.matches.forEach((m) => {
      m.games.forEach((g: IndividualGame, idx) => {
        // Alternating realistic scores
        const homePts = idx % 2 === 0 ? 10 : 6;
        const awayPts = idx % 2 === 0 ? 5 : 10;
        const homeWon = homePts > awayPts;

        g.completed = true;
        g.homeScore = {
          playerId: g.homePlayerId,
          playerName: g.homePlayerName,
          ballsPocketed: homeWon ? 7 : homePts,
          sunk8Ball: homeWon,
          totalPoints: homePts,
          isWinner: homeWon,
        };
        g.awayScore = {
          playerId: g.awayPlayerId,
          playerName: g.awayPlayerName,
          ballsPocketed: !homeWon ? 7 : awayPts,
          sunk8Ball: !homeWon,
          totalPoints: awayPts,
          isWinner: !homeWon,
        };
      });
    });
    week1.isCompleted = true;
  }

  return {
    config,
    teams,
    days,
    substitutes: [],
  };
}

export interface ServerDBStatus {
  connected: boolean;
  type: 'postgres' | 'local_file';
  message: string;
  databaseUrlConfigured: boolean;
}

let saveDebounceTimer: any = null;

/**
 * Syncs tournament with the Railway backend database API.
 */
export async function syncTournamentWithBackend(data: TournamentData): Promise<boolean> {
  try {
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament: data, setActive: true }),
    });
    return res.ok;
  } catch {
    // Silently fall back to localStorage
    return false;
  }
}

/**
 * Saves to localStorage immediately and queues a debounced background sync to the server.
 */
export function queueTournamentSave(data: TournamentData): void {
  saveTournamentToStorage(data);
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }
  saveDebounceTimer = setTimeout(() => {
    syncTournamentWithBackend(data).catch(() => {});
  }, 500);
}

/**
 * Fetches the active tournament from the server DB.
 */
export async function fetchCurrentTournamentFromServer(): Promise<TournamentData | null> {
  try {
    const res = await fetch('/api/tournaments/current');
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the Railway/server database connection status.
 */
export async function fetchServerStatus(): Promise<ServerDBStatus | null> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
