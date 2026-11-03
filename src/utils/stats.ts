import { LeagueOverviewData, PlayerStats, Team, TeamPerformanceMetric, TeamStats, TournamentData } from '../types';

/**
 * Calculates league handicap (scale 2 to 7) based on scoring average.
 * Standard formula transparent to players and captains:
 * Avg < 3.5 -> 2
 * 3.5 - 4.9 -> 3
 * 5.0 - 6.4 -> 4
 * 6.5 - 7.9 -> 5
 * 8.0 - 8.9 -> 6
 * 9.0+ -> 7
 */
export function calculateHandicap(averageScore: number, gamesPlayed: number): number {
  if (gamesPlayed === 0) return 3; // Default baseline for new player
  if (averageScore < 3.5) return 2;
  if (averageScore < 5.0) return 3;
  if (averageScore < 6.5) return 4;
  if (averageScore < 8.0) return 5;
  if (averageScore < 9.0) return 6;
  return 7;
}

/**
 * Computes all player stats, auto-populating from game scores,
 * including weekly progression of Average Score and Handicap.
 */
export function computeAllPlayerStats(tournament: TournamentData): PlayerStats[] {
  const { teams, days } = tournament;
  const playerMap = new Map<string, PlayerStats>();

  // Helper to create empty stat object
  const createEmptyPlayerStats = (
    playerId: string,
    playerName: string,
    teamId: string,
    teamName: string,
    isCaptain: boolean
  ): PlayerStats => ({
    playerId,
    playerName,
    teamId,
    teamName,
    isCaptain,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    eightBallsSunk: 0,
    eightBallRate: 0,
    totalScore: 0,
    averageScore: 0,
    opponentPointsAllowed: 0,
    opponentAverageScore: 0,
    pointDifferential: 0,
    differentialPerGame: 0,
    perfectTens: 0,
    shutoutsDelivered: 0,
    shutoutsSuffered: 0,
    homeGamesPlayed: 0,
    homeGamesWon: 0,
    homeWinRate: 0,
    awayGamesPlayed: 0,
    awayGamesWon: 0,
    awayWinRate: 0,
    currentStreak: { type: '-', count: 0 },
    longestWinStreak: 0,
    powerRating: 0,
    gwp: 0,
    handicap: 3,
    weeklyStats: [],
    gameLog: [],
  });

  // Initialize entry for all roster players
  teams.forEach((team) => {
    team.players.forEach((player) => {
      playerMap.set(
        player.id,
        createEmptyPlayerStats(player.id, player.name, team.id, team.name, player.isCaptain)
      );
    });
  });

  // Track weekly scores per player: weekNumber -> playerId -> { games: number, points: number, wins: number }
  const weeklyTracker = new Map<number, Map<string, { games: number; points: number; wins: number }>>();

  // Process all completed games by day (week)
  days.forEach((day) => {
    const dayNum = day.dayNumber;
    if (!weeklyTracker.has(dayNum)) {
      weeklyTracker.set(dayNum, new Map());
    }
    const dayStats = weeklyTracker.get(dayNum)!;

    day.matches.forEach((match) => {
      match.games.forEach((game) => {
        if (!game.completed || !game.homeScore || !game.awayScore) return;

        const gHomeTeamId = game.homeTeamId || match.homeTeamId;
        const gAwayTeamId = game.awayTeamId || match.awayTeamId;
        const homeTeamObj = teams.find((t) => t.id === gHomeTeamId);
        const awayTeamObj = teams.find((t) => t.id === gAwayTeamId);
        const homeTeamName = game.homeTeamName || homeTeamObj?.name || 'Home Team';
        const awayTeamName = game.awayTeamName || awayTeamObj?.name || 'Away Team';

        // Process Home Player
        const homeId = game.homePlayerId;
        const homePts = game.homeScore.totalPoints;
        const homeWon = game.homeScore.isWinner;
        const homeSunk8 = game.homeScore.sunk8Ball;

        // Process Away Player
        const awayId = game.awayPlayerId;
        const awayPts = game.awayScore.totalPoints;
        const awayWon = game.awayScore.isWinner;
        const awaySunk8 = game.awayScore.sunk8Ball;

        // Register in playerMap if sub or missing
        if (!playerMap.has(homeId)) {
          playerMap.set(
            homeId,
            createEmptyPlayerStats(
              homeId,
              game.homePlayerName + (game.homeIsSub ? ' (Sub)' : ''),
              gHomeTeamId,
              homeTeamName,
              false
            )
          );
        }

        if (!playerMap.has(awayId)) {
          playerMap.set(
            awayId,
            createEmptyPlayerStats(
              awayId,
              game.awayPlayerName + (game.awayIsSub ? ' (Sub)' : ''),
              gAwayTeamId,
              awayTeamName,
              false
            )
          );
        }

        const homeStat = playerMap.get(homeId)!;
        const awayStat = playerMap.get(awayId)!;

        // Update Home Player Stats
        homeStat.gamesPlayed += 1;
        homeStat.totalScore += homePts;
        homeStat.opponentPointsAllowed += awayPts;
        homeStat.homeGamesPlayed += 1;
        if (homeSunk8) homeStat.eightBallsSunk += 1;
        if (homePts === 10) homeStat.perfectTens += 1;
        if (homeWon && awayPts === 0) homeStat.shutoutsDelivered += 1;
        if (homePts === 0) homeStat.shutoutsSuffered += 1;

        if (homeWon) {
          homeStat.gamesWon += 1;
          homeStat.homeGamesWon += 1;
        } else {
          homeStat.gamesLost += 1;
        }

        homeStat.gameLog.push({
          gameId: game.id,
          matchId: match.id,
          dayNumber: day.dayNumber,
          dateString: day.dateString,
          tableNumber: match.tableNumber,
          gameNumber: game.gameNumber,
          roundNumber: game.roundNumber,
          isHome: true,
          myScore: homePts,
          opponentScore: awayPts,
          sunk8Ball: homeSunk8,
          isWinner: homeWon,
          opponentId: awayId,
          opponentName: game.awayPlayerName,
          opponentTeamName: awayTeamName,
        });

        const currentHomeDay = dayStats.get(homeId) || { games: 0, points: 0, wins: 0 };
        currentHomeDay.games += 1;
        currentHomeDay.points += homePts;
        if (homeWon) currentHomeDay.wins += 1;
        dayStats.set(homeId, currentHomeDay);

        // Update Away Player Stats
        awayStat.gamesPlayed += 1;
        awayStat.totalScore += awayPts;
        awayStat.opponentPointsAllowed += homePts;
        awayStat.awayGamesPlayed += 1;
        if (awaySunk8) awayStat.eightBallsSunk += 1;
        if (awayPts === 10) awayStat.perfectTens += 1;
        if (awayWon && homePts === 0) awayStat.shutoutsDelivered += 1;
        if (awayPts === 0) awayStat.shutoutsSuffered += 1;

        if (awayWon) {
          awayStat.gamesWon += 1;
          awayStat.awayGamesWon += 1;
        } else {
          awayStat.gamesLost += 1;
        }

        awayStat.gameLog.push({
          gameId: game.id,
          matchId: match.id,
          dayNumber: day.dayNumber,
          dateString: day.dateString,
          tableNumber: match.tableNumber,
          gameNumber: game.gameNumber,
          roundNumber: game.roundNumber,
          isHome: false,
          myScore: awayPts,
          opponentScore: homePts,
          sunk8Ball: awaySunk8,
          isWinner: awayWon,
          opponentId: homeId,
          opponentName: game.homePlayerName,
          opponentTeamName: homeTeamName,
        });

        const currentAwayDay = dayStats.get(awayId) || { games: 0, points: 0, wins: 0 };
        currentAwayDay.games += 1;
        currentAwayDay.points += awayPts;
        if (awayWon) currentAwayDay.wins += 1;
        dayStats.set(awayId, currentAwayDay);
      });
    });
  });

  // Calculate final totals, averages, GWP, streaks and handicap
  playerMap.forEach((stat) => {
    if (stat.gamesPlayed > 0) {
      stat.averageScore = parseFloat((stat.totalScore / stat.gamesPlayed).toFixed(2));
      stat.opponentAverageScore = parseFloat((stat.opponentPointsAllowed / stat.gamesPlayed).toFixed(2));
      stat.pointDifferential = stat.totalScore - stat.opponentPointsAllowed;
      stat.differentialPerGame = parseFloat((stat.pointDifferential / stat.gamesPlayed).toFixed(2));
      stat.gwp = parseFloat(((stat.gamesWon / stat.gamesPlayed) * 100).toFixed(1));
      stat.eightBallRate = parseFloat(((stat.eightBallsSunk / stat.gamesPlayed) * 100).toFixed(1));
      stat.homeWinRate = stat.homeGamesPlayed > 0 ? parseFloat(((stat.homeGamesWon / stat.homeGamesPlayed) * 100).toFixed(1)) : 0;
      stat.awayWinRate = stat.awayGamesPlayed > 0 ? parseFloat(((stat.awayGamesWon / stat.awayGamesPlayed) * 100).toFixed(1)) : 0;
      // Power rating (0 to 100 composite index)
      stat.powerRating = Math.min(100, Math.max(0, Math.round((stat.gwp * 0.5) + (stat.averageScore * 5.0))));

      // Calculate streaks
      let maxWinStreak = 0;
      let runningWinStreak = 0;

      for (let i = 0; i < stat.gameLog.length; i++) {
        const g = stat.gameLog[i];
        if (g.isWinner) {
          runningWinStreak += 1;
          if (runningWinStreak > maxWinStreak) maxWinStreak = runningWinStreak;
        } else {
          runningWinStreak = 0;
        }
      }
      stat.longestWinStreak = maxWinStreak;

      let currentStreakType: 'W' | 'L' | '-' = '-';
      let currentStreakCount = 0;
      if (stat.gameLog.length > 0) {
        const lastGame = stat.gameLog[stat.gameLog.length - 1];
        currentStreakType = lastGame.isWinner ? 'W' : 'L';
        currentStreakCount = 1;
        for (let i = stat.gameLog.length - 2; i >= 0; i--) {
          const g = stat.gameLog[i];
          const isSame = lastGame.isWinner ? g.isWinner : !g.isWinner;
          if (isSame) {
            currentStreakCount += 1;
          } else {
            break;
          }
        }
      }
      stat.currentStreak = { type: currentStreakType, count: currentStreakCount };
    } else {
      stat.averageScore = 0;
      stat.opponentAverageScore = 0;
      stat.pointDifferential = 0;
      stat.differentialPerGame = 0;
      stat.gwp = 0;
      stat.eightBallRate = 0;
      stat.homeWinRate = 0;
      stat.awayWinRate = 0;
      stat.powerRating = 0;
      stat.currentStreak = { type: '-', count: 0 };
      stat.longestWinStreak = 0;
    }
    stat.handicap = calculateHandicap(stat.averageScore, stat.gamesPlayed);

    // Build weekly cumulative stats
    let cumulativePoints = 0;
    let cumulativeGames = 0;

    days.forEach((day) => {
      const dayData = weeklyTracker.get(day.dayNumber)?.get(stat.playerId);
      const weekGames = dayData?.games || 0;
      const weekPts = dayData?.points || 0;

      cumulativePoints += weekPts;
      cumulativeGames += weekGames;

      const cumAvg = cumulativeGames > 0 ? parseFloat((cumulativePoints / cumulativeGames).toFixed(2)) : 0;
      const cumHandicap = calculateHandicap(cumAvg, cumulativeGames);

      stat.weeklyStats.push({
        week: day.dayNumber,
        date: day.dateString,
        gamesPlayedWeek: weekGames,
        pointsWeek: weekPts,
        cumulativeAverage: cumAvg,
        cumulativeHandicap: cumHandicap,
      });
    });
  });

  return Array.from(playerMap.values()).sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Computes Team Standings (Total points, matches won, games won)
 */
export function computeTeamStandings(tournament: TournamentData): TeamStats[] {
  const { teams, days } = tournament;
  const teamStatsMap = new Map<string, TeamStats>();

  teams.forEach((t) => {
    const cap = t.players.find((p) => p.isCaptain);
    teamStatsMap.set(t.id, {
      teamId: t.id,
      teamName: t.name,
      captainName: cap ? cap.name : 'Unassigned',
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesWon: 0,
      gamesPlayed: 0,
      totalPoints: 0,
      pointsPerGame: 0,
    });
  });

  days.forEach((day) => {
    day.matches.forEach((match) => {
      const homeTeam = teamStatsMap.get(match.homeTeamId);
      const awayTeam = teamStatsMap.get(match.awayTeamId);
      if (!homeTeam || !awayTeam) return;

      let homeMatchPoints = 0;
      let awayMatchPoints = 0;
      let matchHasGames = false;

      match.games.forEach((g) => {
        if (g.completed && g.homeScore && g.awayScore) {
          matchHasGames = true;
          const gHomeTeamId = g.homeTeamId || match.homeTeamId;
          const gAwayTeamId = g.awayTeamId || match.awayTeamId;
          const gHomeTeamStat = teamStatsMap.get(gHomeTeamId);
          const gAwayTeamStat = teamStatsMap.get(gAwayTeamId);

          if (gHomeTeamStat) {
            gHomeTeamStat.gamesPlayed += 1;
            gHomeTeamStat.totalPoints += g.homeScore.totalPoints;
            if (g.homeScore.isWinner) gHomeTeamStat.gamesWon += 1;
          }
          if (gAwayTeamStat) {
            gAwayTeamStat.gamesPlayed += 1;
            gAwayTeamStat.totalPoints += g.awayScore.totalPoints;
            if (g.awayScore.isWinner) gAwayTeamStat.gamesWon += 1;
          }

          if (gHomeTeamId === match.homeTeamId) {
            homeMatchPoints += g.homeScore.totalPoints;
            awayMatchPoints += g.awayScore.totalPoints;
          } else {
            awayMatchPoints += g.homeScore.totalPoints;
            homeMatchPoints += g.awayScore.totalPoints;
          }
        }
      });

      if (matchHasGames) {
        homeTeam.matchesPlayed += 1;
        awayTeam.matchesPlayed += 1;

        if (homeMatchPoints > awayMatchPoints) {
          homeTeam.matchesWon += 1;
          awayTeam.matchesLost += 1;
        } else if (awayMatchPoints > homeMatchPoints) {
          awayTeam.matchesWon += 1;
          homeTeam.matchesLost += 1;
        }
      }
    });
  });

  const list = Array.from(teamStatsMap.values()).map((t) => {
    t.pointsPerGame = t.gamesPlayed > 0 ? parseFloat((t.totalPoints / t.gamesPlayed).toFixed(2)) : 0;
    return t;
  });

  // Sort by Total Points descending, then Games Won descending
  return list.sort((a, b) => b.totalPoints - a.totalPoints || b.gamesWon - a.gamesWon);
}

/**
 * Computes high-level League Overview season metrics,
 * average team performance, and top-performing player rankings.
 */
export function computeLeagueOverview(tournament: TournamentData): LeagueOverviewData {
  const { teams, days } = tournament;
  const playerStats = computeAllPlayerStats(tournament);

  let totalGamesScheduled = 0;
  let totalGamesCompleted = 0;
  let totalMatchesScheduled = 0;
  let totalMatchesCompleted = 0;
  let totalPointsScored = 0;
  let total8BallsSunk = 0;

  // Track team-specific metrics
  const teamMetricMap = new Map<
    string,
    {
      matchesPlayed: number;
      matchesWon: number;
      matchesLost: number;
      gamesPlayed: number;
      gamesWon: number;
      totalPoints: number;
      eightBallsSunk: number;
    }
  >();

  teams.forEach((t) => {
    teamMetricMap.set(t.id, {
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalPoints: 0,
      eightBallsSunk: 0,
    });
  });

  days.forEach((day) => {
    day.matches.forEach((match) => {
      totalMatchesScheduled += 1;
      const homeMetric = teamMetricMap.get(match.homeTeamId);
      const awayMetric = teamMetricMap.get(match.awayTeamId);

      let homeMatchPoints = 0;
      let awayMatchPoints = 0;
      let matchGamesCompleted = 0;

      match.games.forEach((game) => {
        totalGamesScheduled += 1;
        if (game.completed && game.homeScore && game.awayScore) {
          totalGamesCompleted += 1;
          matchGamesCompleted += 1;
          const hPts = game.homeScore.totalPoints;
          const aPts = game.awayScore.totalPoints;
          totalPointsScored += hPts + aPts;

          const gHomeTeamId = game.homeTeamId || match.homeTeamId;
          const gAwayTeamId = game.awayTeamId || match.awayTeamId;
          const gHomeMetric = teamMetricMap.get(gHomeTeamId);
          const gAwayMetric = teamMetricMap.get(gAwayTeamId);

          if (game.homeScore.sunk8Ball) {
            total8BallsSunk += 1;
            if (gHomeMetric) gHomeMetric.eightBallsSunk += 1;
          }
          if (game.awayScore.sunk8Ball) {
            total8BallsSunk += 1;
            if (gAwayMetric) gAwayMetric.eightBallsSunk += 1;
          }

          if (gHomeTeamId === match.homeTeamId) {
            homeMatchPoints += hPts;
            awayMatchPoints += aPts;
          } else {
            awayMatchPoints += hPts;
            homeMatchPoints += aPts;
          }

          if (gHomeMetric) {
            gHomeMetric.gamesPlayed += 1;
            gHomeMetric.totalPoints += hPts;
            if (game.homeScore.isWinner) gHomeMetric.gamesWon += 1;
          }
          if (gAwayMetric) {
            gAwayMetric.gamesPlayed += 1;
            gAwayMetric.totalPoints += aPts;
            if (game.awayScore.isWinner) gAwayMetric.gamesWon += 1;
          }
        }
      });

      if (matchGamesCompleted > 0) {
        totalMatchesCompleted += 1;
        if (homeMetric) homeMetric.matchesPlayed += 1;
        if (awayMetric) awayMetric.matchesPlayed += 1;

        if (homeMatchPoints > awayMatchPoints) {
          if (homeMetric) homeMetric.matchesWon += 1;
          if (awayMetric) awayMetric.matchesLost += 1;
        } else if (awayMatchPoints > homeMatchPoints) {
          if (awayMetric) awayMetric.matchesWon += 1;
          if (homeMetric) homeMetric.matchesLost += 1;
        }
      }
    });
  });

  const gameCompletionRate =
    totalGamesScheduled > 0
      ? parseFloat(((totalGamesCompleted / totalGamesScheduled) * 100).toFixed(1))
      : 0;

  // Average game score per player (total points / (totalGamesCompleted * 2))
  const leagueAverageGameScore =
    totalGamesCompleted > 0
      ? parseFloat((totalPointsScored / (totalGamesCompleted * 2)).toFixed(2))
      : 0;

  // Team performance list
  const teamsPerformance: TeamPerformanceMetric[] = teams.map((team) => {
    const metric = teamMetricMap.get(team.id) || {
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      totalPoints: 0,
      eightBallsSunk: 0,
    };
    const captain = team.players.find((p) => p.isCaptain);
    const ppg =
      metric.gamesPlayed > 0
        ? parseFloat((metric.totalPoints / metric.gamesPlayed).toFixed(2))
        : 0;
    const ppm =
      metric.matchesPlayed > 0
        ? parseFloat((metric.totalPoints / metric.matchesPlayed).toFixed(1))
        : 0;
    const matchWinRate =
      metric.matchesPlayed > 0
        ? parseFloat(((metric.matchesWon / metric.matchesPlayed) * 100).toFixed(1))
        : 0;
    const gameWinRate =
      metric.gamesPlayed > 0
        ? parseFloat(((metric.gamesWon / metric.gamesPlayed) * 100).toFixed(1))
        : 0;

    return {
      teamId: team.id,
      teamName: team.name,
      captainName: captain ? captain.name : 'Unassigned',
      matchesPlayed: metric.matchesPlayed,
      matchesWon: metric.matchesWon,
      matchesLost: metric.matchesLost,
      matchWinRate,
      gamesPlayed: metric.gamesPlayed,
      gamesWon: metric.gamesWon,
      gameWinRate,
      totalPoints: metric.totalPoints,
      pointsPerGame: ppg,
      pointsPerMatch: ppm,
      differentialVsLeagueAvg: 0,
      eightBallsSunk: metric.eightBallsSunk,
    };
  });

  // Calculate league average team PPG
  const activeTeams = teamsPerformance.filter((t) => t.gamesPlayed > 0);
  const totalTeamPPG = activeTeams.reduce((acc, t) => acc + t.pointsPerGame, 0);
  const leagueAverageTeamPPG =
    activeTeams.length > 0
      ? parseFloat((totalTeamPPG / activeTeams.length).toFixed(2))
      : 0;

  // Update differentialVsLeagueAvg
  teamsPerformance.forEach((t) => {
    t.differentialVsLeagueAvg = parseFloat((t.pointsPerGame - leagueAverageTeamPPG).toFixed(2));
  });

  // Sort teams by total points descending, then game win rate
  teamsPerformance.sort((a, b) => b.totalPoints - a.totalPoints || b.gameWinRate - a.gameWinRate);

  const topScoringTeam =
    teamsPerformance.length > 0 && teamsPerformance[0].totalPoints > 0
      ? {
          name: teamsPerformance[0].teamName,
          points: teamsPerformance[0].totalPoints,
          ppg: teamsPerformance[0].pointsPerGame,
        }
      : null;

  const totalPlayersActive = playerStats.filter((p) => p.gamesPlayed > 0).length;
  const totalSubstitutesUsed = tournament.substitutes.length;

  // Top-performing player rankings
  // 1. Top Scorers (by total points)
  const topScorers = [...playerStats]
    .filter((p) => p.gamesPlayed > 0)
    .sort((a, b) => b.totalScore - a.totalScore || b.averageScore - a.averageScore)
    .slice(0, 5);

  // 2. Top Average Scorers
  const playersWithMultipleGames = playerStats.filter((p) => p.gamesPlayed >= 2);
  const avgCandidatePool =
    playersWithMultipleGames.length >= 3
      ? playersWithMultipleGames
      : playerStats.filter((p) => p.gamesPlayed >= 1);

  const topAverageScorers = [...avgCandidatePool]
    .sort((a, b) => b.averageScore - a.averageScore || b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);

  // 3. Top Game Win %
  const gwpCandidatePool =
    playersWithMultipleGames.length >= 3
      ? playersWithMultipleGames
      : playerStats.filter((p) => p.gamesPlayed >= 1);

  const topWinPctPlayers = [...gwpCandidatePool]
    .sort((a, b) => b.gwp - a.gwp || b.gamesWon - a.gamesWon)
    .slice(0, 5);

  // 4. Top 8-Ball Closers
  const top8BallClosers = [...playerStats]
    .filter((p) => p.eightBallsSunk > 0)
    .sort((a, b) => b.eightBallsSunk - a.eightBallsSunk || b.totalScore - a.totalScore)
    .slice(0, 5);

  // 5. Top Shutout / Perfect 10 Masters
  const topShutoutPlayers = [...playerStats]
    .filter((p) => p.perfectTens > 0 || p.shutoutsDelivered > 0)
    .sort((a, b) => (b.perfectTens * 2 + b.shutoutsDelivered) - (a.perfectTens * 2 + a.shutoutsDelivered) || b.totalScore - a.totalScore)
    .slice(0, 5);

  // 6. Top Defensive Players (Lowest Opponent PPG with min games)
  const defensiveCandidatePool =
    playersWithMultipleGames.length >= 3
      ? playersWithMultipleGames
      : playerStats.filter((p) => p.gamesPlayed >= 1);
  const topDefensivePlayers = [...defensiveCandidatePool]
    .sort((a, b) => a.opponentAverageScore - b.opponentAverageScore || b.gamesPlayed - a.gamesPlayed)
    .slice(0, 5);

  // 7. Top Point Differential (+/-)
  const topDifferentialPlayers = [...playerStats]
    .filter((p) => p.gamesPlayed > 0)
    .sort((a, b) => b.pointDifferential - a.pointDifferential || b.differentialPerGame - a.differentialPerGame)
    .slice(0, 5);

  // 8. Top Win Streaks
  const topStreakPlayers = [...playerStats]
    .filter((p) => p.longestWinStreak > 0)
    .sort((a, b) => b.longestWinStreak - a.longestWinStreak || b.gamesWon - a.gamesWon)
    .slice(0, 5);

  return {
    totalGamesScheduled,
    totalGamesCompleted,
    gameCompletionRate,
    totalMatchesScheduled,
    totalMatchesCompleted,
    totalPointsScored,
    leagueAverageGameScore,
    leagueAverageTeamPPG,
    total8BallsSunk,
    totalPlayersActive,
    totalSubstitutesUsed,
    topScoringTeam,
    teamsPerformance,
    topScorers,
    topAverageScorers,
    topWinPctPlayers,
    top8BallClosers,
    topShutoutPlayers,
    topDefensivePlayers,
    topDifferentialPlayers,
    topStreakPlayers,
  };
}
