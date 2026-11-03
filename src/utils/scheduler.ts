import { IndividualGame, MatchPairing, PoolDay, Team, TournamentConfig } from '../types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Computes calendar dates for each pool day based on start date and selected days of week.
 */
export function generatePoolDates(
  startDateStr: string,
  selectedDays: string[],
  totalDays: number
): { dateString: string; dayOfWeek: string }[] {
  const result: { dateString: string; dayOfWeek: string }[] = [];
  if (!startDateStr || selectedDays.length === 0 || totalDays <= 0) return result;

  const current = new Date(startDateStr + 'T12:00:00');
  
  // Find valid day matching start date or the next matching day
  while (result.length < totalDays) {
    const dayName = DAYS_OF_WEEK[current.getDay()];
    if (selectedDays.includes(dayName)) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      result.push({
        dateString: `${yyyy}-${mm}-${dd}`,
        dayOfWeek: dayName,
      });
    }
    // Increment by 1 day
    current.setDate(current.getDate() + 1);
  }

  return result;
}

/**
 * Generates round robin pairings for N teams using the polygon/circle rotation algorithm.
 */
function generateRoundRobinPairs(teams: Team[], totalRounds: number): [Team, Team][][] {
  const teamList = [...teams];
  const hasBye = teamList.length % 2 !== 0;
  
  // If odd, add a dummy BYE team
  if (hasBye) {
    teamList.push({
      id: 'BYE',
      name: 'BYE (No Game)',
      captainId: '',
      players: [],
    });
  }

  const n = teamList.length;
  const numPairingsPerRound = n / 2;
  const cycleRounds = n - 1;
  const allRounds: [Team, Team][][] = [];

  for (let r = 0; r < totalRounds; r++) {
    const roundIndex = r % cycleRounds;
    const roundPairs: [Team, Team][] = [];

    for (let i = 0; i < numPairingsPerRound; i++) {
      const homeIdx = (roundIndex + i) % (n - 1);
      let awayIdx = (n - 1 - i + roundIndex) % (n - 1);

      if (i === 0) {
        awayIdx = n - 1;
      }

      const teamA = teamList[homeIdx];
      const teamB = teamList[awayIdx];

      // Alternate home/away based on round for fairness
      if (r % 2 === 1) {
        roundPairs.push([teamB, teamA]);
      } else {
        roundPairs.push([teamA, teamB]);
      }
    }

    // Filter out BYE if present
    const validPairs = roundPairs.filter(
      ([t1, t2]) => t1.id !== 'BYE' && t2.id !== 'BYE'
    );
    allRounds.push(validPairs);
  }

  return allRounds;
}

/**
 * Builds the complete tournament schedule with table assignments and individual player games.
 * Requirement: 1 team plays the same team twice in one night. Everyone plays at least once per Pool Day.
 * Spread across available tables.
 */
export function generateTournamentSchedule(
  config: TournamentConfig,
  teams: Team[]
): PoolDay[] {
  const dates = generatePoolDates(
    config.startDate,
    config.selectedDaysOfWeek,
    config.totalPoolDays
  );

  const roundPairs = generateRoundRobinPairs(teams, config.totalPoolDays);
  const poolDays: PoolDay[] = [];

  const numTables = Math.max(1, config.numTables);

  for (let dayIdx = 0; dayIdx < config.totalPoolDays; dayIdx++) {
    const dayNumber = dayIdx + 1;
    const dateInfo = dates[dayIdx] || {
      dateString: `Day ${dayNumber}`,
      dayOfWeek: config.selectedDaysOfWeek[0] || 'Game Day',
    };

    const pairsForDay = roundPairs[dayIdx] || [];
    const matches: MatchPairing[] = [];

    pairsForDay.forEach((pair, pairIdx) => {
      const [homeTeam, awayTeam] = pair;
      const matchId = `day-${dayNumber}-match-${pairIdx + 1}`;
      
      // Table assignment: spread across available tables
      const tableNumber = (pairIdx % numTables) + 1;
      const shiftNumber = Math.floor(pairIdx / numTables) + 1;
      const timeSlot = shiftNumber > 1 ? `Shift ${shiftNumber} (Table ${tableNumber})` : `Table ${tableNumber}`;

      // Generate individual games:
      // Requirement:
      // 1) A player plays ALL of the opposing team's players twice (once per round).
      // 2) Alternate the teams from home to visitors every round (Round 1: Team A Home / Team B Visitor; Round 2: Team B Home / Team A Visitor).
      const games: IndividualGame[] = [];
      const homePlayers = homeTeam.players;
      const awayPlayers = awayTeam.players;
      const pCount = Math.max(homePlayers.length, awayPlayers.length, 1);

      let gameCounter = 1;

      // ROUND 1: Team A is Home Team, Team B is Visiting Team
      // Each player on Team A plays every player on Team B once across shifts
      for (let s = 0; s < pCount; s++) {
        for (let i = 0; i < pCount; i++) {
          const hp = homePlayers[i % homePlayers.length];
          const ap = awayPlayers[(i + s) % awayPlayers.length];

          games.push({
            id: `${matchId}-g${gameCounter}`,
            matchId,
            gameNumber: gameCounter,
            roundNumber: 1,
            homeTeamId: homeTeam.id,
            homeTeamName: homeTeam.name,
            awayTeamId: awayTeam.id,
            awayTeamName: awayTeam.name,
            homePlayerId: hp.id,
            homePlayerName: hp.name,
            awayPlayerId: ap.id,
            awayPlayerName: ap.name,
            completed: false,
          });
          gameCounter++;
        }
      }

      // ROUND 2: Teams alternate! Team B is now Home Team, Team A is Visiting Team
      // Each player plays all opposing players again (second time, once per round)
      for (let s = 0; s < pCount; s++) {
        for (let i = 0; i < pCount; i++) {
          // Team B is now the Home Team for Round 2
          const hp = awayPlayers[i % awayPlayers.length];
          // Team A is now the Visiting Team for Round 2
          const ap = homePlayers[(i + s) % homePlayers.length];

          games.push({
            id: `${matchId}-g${gameCounter}`,
            matchId,
            gameNumber: gameCounter,
            roundNumber: 2,
            homeTeamId: awayTeam.id,
            homeTeamName: awayTeam.name,
            awayTeamId: homeTeam.id,
            awayTeamName: homeTeam.name,
            homePlayerId: hp.id,
            homePlayerName: hp.name,
            awayPlayerId: ap.id,
            awayPlayerName: ap.name,
            completed: false,
          });
          gameCounter++;
        }
      }

      matches.push({
        id: matchId,
        dayNumber,
        tableNumber,
        timeSlot,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        games,
      });
    });

    poolDays.push({
      dayNumber,
      dateString: dateInfo.dateString,
      dayOfWeek: dateInfo.dayOfWeek,
      matches,
      isCompleted: false,
    });
  }

  return poolDays;
}
