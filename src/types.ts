/**
 * Pool League Data Models & Types
 */

export interface Player {
  id: string;
  name: string;
  teamId: string;
  isCaptain: boolean;
  phone?: string;
  email?: string;
}

export interface Substitute {
  id: string;
  originalPlayerId: string;
  subName: string;
  gameId: string;
  dayNumber: number;
}

export interface GameScore {
  playerId: string; // original or substitute ID
  playerName: string;
  isSubstitute?: boolean;
  substituteForId?: string;
  ballsPocketed: number; // 0 to 7
  sunk8Ball: boolean; // 3 points
  totalPoints: number; // ballsPocketed + (sunk8Ball ? 3 : 0)
  isWinner: boolean;
}

export interface IndividualGame {
  id: string;
  matchId: string;
  gameNumber: number; // e.g. Game 1, Game 2 in the match
  roundNumber: number; // Round 1, Round 2 (teams alternate home/visitor each round)
  homeTeamId?: string;
  homeTeamName?: string;
  awayTeamId?: string;
  awayTeamName?: string;
  homePlayerId: string;
  homePlayerName: string;
  homeIsSub?: boolean;
  awayPlayerId: string;
  awayPlayerName: string;
  awayIsSub?: boolean;
  homeScore?: GameScore;
  awayScore?: GameScore;
  completed: boolean;
  notes?: string;
}

export interface MatchPairing {
  id: string;
  dayNumber: number;
  tableNumber: number;
  timeSlot?: string;
  homeTeamId: string;
  awayTeamId: string;
  games: IndividualGame[];
}

export interface PoolDay {
  dayNumber: number; // 1, 2, 3...
  dateString: string; // e.g. "2026-09-16"
  dayOfWeek: string; // e.g. "Wednesday"
  matches: MatchPairing[];
  isCompleted: boolean;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  players: Player[];
}

export interface TournamentConfig {
  id: string;
  name: string;
  startDate: string;
  poolDaysPerWeek: number; // e.g. 1
  selectedDaysOfWeek: string[]; // e.g. ["Wednesday"]
  totalPoolDays: number; // e.g. 10
  numTables: number; // e.g. 2
  numTeams: number; // e.g. 4
  playersPerTeam: number; // e.g. 3
  pointsPerBall: number; // default 1
  pointsFor8Ball: number; // default 3
  createdAt: string;
  lastModified: string;
}

export interface TournamentData {
  config: TournamentConfig;
  teams: Team[];
  days: PoolDay[];
  substitutes: Substitute[];
}

export interface PlayerGameRecord {
  gameId: string;
  matchId: string;
  dayNumber: number;
  dateString: string;
  tableNumber: number;
  gameNumber: number;
  roundNumber: number;
  isHome: boolean; // Was player home (breaking)
  myScore: number;
  opponentScore: number;
  sunk8Ball: boolean;
  isWinner: boolean;
  opponentId: string;
  opponentName: string;
  opponentTeamName: string;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  isCaptain: boolean;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  eightBallsSunk: number;
  eightBallRate: number; // % of games played where player made the 8-ball
  totalScore: number;
  averageScore: number; // PPG (Points Per Game)
  opponentPointsAllowed: number;
  opponentAverageScore: number; // Defensive PPG
  pointDifferential: number; // +/- net point margin
  differentialPerGame: number;
  perfectTens: number; // Games scoring maximum 10 points
  shutoutsDelivered: number; // 10-0 shutouts / skunks delivered
  shutoutsSuffered: number; // Times held to 0 points
  homeGamesPlayed: number;
  homeGamesWon: number;
  homeWinRate: number; // Break conversion win %
  awayGamesPlayed: number;
  awayGamesWon: number;
  awayWinRate: number;
  currentStreak: {
    type: 'W' | 'L' | '-';
    count: number;
  };
  longestWinStreak: number;
  powerRating: number; // Combined billiards index 0-100
  gwp: number; // Game Winning Percentage (0 - 100%)
  handicap: number; // League handicap (e.g. 2 to 7)
  weeklyStats: {
    week: number;
    date: string;
    gamesPlayedWeek: number;
    pointsWeek: number;
    cumulativeAverage: number;
    cumulativeHandicap: number;
  }[];
  gameLog: PlayerGameRecord[];
}

export interface TeamPerformanceMetric {
  teamId: string;
  teamName: string;
  captainName: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchWinRate: number; // 0 - 100%
  gamesPlayed: number;
  gamesWon: number;
  gameWinRate: number; // 0 - 100%
  totalPoints: number;
  pointsPerGame: number;
  pointsPerMatch: number;
  differentialVsLeagueAvg: number;
  eightBallsSunk: number;
}

export interface LeagueOverviewData {
  totalGamesScheduled: number;
  totalGamesCompleted: number;
  gameCompletionRate: number;
  totalMatchesScheduled: number;
  totalMatchesCompleted: number;
  totalPointsScored: number;
  leagueAverageGameScore: number;
  leagueAverageTeamPPG: number;
  total8BallsSunk: number;
  totalPlayersActive: number;
  totalSubstitutesUsed: number;
  topScoringTeam: {
    name: string;
    points: number;
    ppg: number;
  } | null;
  teamsPerformance: TeamPerformanceMetric[];
  topScorers: PlayerStats[];
  topAverageScorers: PlayerStats[];
  topWinPctPlayers: PlayerStats[];
  top8BallClosers: PlayerStats[];
  topShutoutPlayers: PlayerStats[];
  topDefensivePlayers: PlayerStats[];
  topDifferentialPlayers: PlayerStats[];
  topStreakPlayers: PlayerStats[];
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  captainName: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  gamesWon: number;
  gamesPlayed: number;
  totalPoints: number;
  pointsPerGame: number;
}
