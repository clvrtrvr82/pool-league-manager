import React, { useState } from 'react';
import {
  Trophy,
  TrendingUp,
  Award,
  Target,
  Flame,
  Activity,
  Shield,
  CircleDot,
  CheckCircle2,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';
import { LeagueOverviewData, PlayerStats, TeamPerformanceMetric } from '../types';
import { StreakBadge } from './StreakBadge';

interface LeagueOverviewPanelProps {
  overview: LeagueOverviewData;
  onSelectTeam?: (teamId: string) => void;
  onSelectPlayer?: (player: PlayerStats) => void;
  onSelectPlayerCategory?: (category: string) => void;
}

type RankingCategory = 'points' | 'average' | 'gwp' | 'eightBall' | 'shutout' | 'defense' | 'diff' | 'streak';

export const LeagueOverviewPanel: React.FC<LeagueOverviewPanelProps> = ({
  overview,
  onSelectTeam,
  onSelectPlayer,
}) => {
  const [activeCategory, setActiveCategory] = useState<RankingCategory>('points');

  const {
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
  } = overview;

  // Selected player list based on active category
  const getCurrentRankingList = (): { list: PlayerStats[]; label: string; metricName: string; metricFormatter: (p: PlayerStats) => string } => {
    switch (activeCategory) {
      case 'average':
        return {
          list: topAverageScorers || [],
          label: 'Highest Scoring Average (PPG)',
          metricName: 'Average Score',
          metricFormatter: (p) => `${p.averageScore.toFixed(2)} pts/g`,
        };
      case 'gwp':
        return {
          list: topWinPctPlayers || [],
          label: 'Top Game Win Percentage (GWP)',
          metricName: 'Win Rate',
          metricFormatter: (p) => `${p.gwp}% (${p.gamesWon}W)`,
        };
      case 'eightBall':
        return {
          list: top8BallClosers || [],
          label: 'Most 8-Balls Sunk (Game Closers)',
          metricName: '8-Balls Sunk',
          metricFormatter: (p) => `${p.eightBallsSunk || 0} sunk (${p.eightBallRate}% rate)`,
        };
      case 'shutout':
        return {
          list: topShutoutPlayers || [],
          label: 'Perfect 10s & Shutouts Delivered',
          metricName: 'Perfect Racks & Sweeps',
          metricFormatter: (p) => `🌟 ${p.perfectTens} 10s | ⚡ ${p.shutoutsDelivered} 10-0`,
        };
      case 'defense':
        return {
          list: topDefensivePlayers || [],
          label: 'Lockdown Defense (Lowest Opp PPG)',
          metricName: 'Opp PPG Allowed',
          metricFormatter: (p) => `🛡️ ${p.opponentAverageScore.toFixed(2)} pts/g allowed`,
        };
      case 'diff':
        return {
          list: topDifferentialPlayers || [],
          label: 'Point Differential (+/- Margin)',
          metricName: 'Net Margin',
          metricFormatter: (p) => `${p.pointDifferential >= 0 ? `+${p.pointDifferential}` : p.pointDifferential} pts`,
        };
      case 'streak':
        return {
          list: topStreakPlayers || [],
          label: 'Longest Consecutive Win Streaks',
          metricName: 'Win Streak',
          metricFormatter: (p) => `🔥 ${p.longestWinStreak} games in a row`,
        };
      case 'points':
      default:
        return {
          list: topScorers || [],
          label: 'Total Points Leaders (Season MVP)',
          metricName: 'Total Points',
          metricFormatter: (p) => `${p.totalScore} pts`,
        };
    }
  };

  const currentRanking = getCurrentRankingList();

  return (
    <div id="league-overview-panel" className="space-y-6">
      {/* 1. HIGH-LEVEL SEASON METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Games Played */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Games Played
            </span>
            <div className="p-2 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {totalGamesCompleted}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                of {totalGamesScheduled} scheduled
              </span>
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full mt-2.5 overflow-hidden border border-slate-700/60">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, gameCompletionRate)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-1.5">
              <span>{gameCompletionRate}% Season Completed</span>
              <span>{totalGamesScheduled - totalGamesCompleted} games remain</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Points & League Scoring Average */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Points Scored
            </span>
            <div className="p-2 bg-amber-950/80 border border-amber-600/50 rounded-xl text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {totalPointsScored}
              </span>
              <span className="text-xs text-slate-300 font-semibold">League Points</span>
            </div>
            <div className="mt-2 text-xs text-slate-300 bg-slate-900/80 rounded-lg p-2 border border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400">Player Scoring Avg:</span>
              <span className="font-bold text-emerald-400">
                {leagueAverageGameScore > 0 ? `${leagueAverageGameScore} pts/game` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Average Team Performance */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Team Avg Performance
            </span>
            <div className="p-2 bg-teal-950/80 border border-teal-600/50 rounded-xl text-teal-400">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-teal-300">
                {leagueAverageTeamPPG > 0 ? `${leagueAverageTeamPPG}` : '0.0'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Avg Team PPG</span>
            </div>
            <div className="mt-2 text-xs text-slate-300 bg-slate-900/80 rounded-lg p-2 border border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400 truncate max-w-[120px]">Top Team:</span>
              <span className="font-bold text-white truncate text-right">
                {topScoringTeam ? `${topScoringTeam.name} (${topScoringTeam.ppg} ppg)` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4: 8-Balls Sunk & Participation */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              8-Balls &amp; Players
            </span>
            <div className="p-2 bg-indigo-950/80 border border-indigo-600/50 rounded-xl text-indigo-400">
              <CircleDot className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-indigo-300">
                {total8BallsSunk}
              </span>
              <span className="text-xs text-slate-400 font-semibold">8-Ball Finishes</span>
            </div>
            <div className="mt-2 text-xs text-slate-300 bg-slate-900/80 rounded-lg p-2 border border-slate-700/60 flex items-center justify-between">
              <span className="text-slate-400">Active Players:</span>
              <span className="font-bold text-white">
                {totalPlayersActive} active {totalSubstitutesUsed > 0 ? `(${totalSubstitutesUsed} subs)` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AVERAGE TEAM PERFORMANCE SECTION */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Average Team Performance &amp; Efficiency</h3>
              <p className="text-xs text-slate-400">
                Comprehensive comparison of team scoring rates, game win percentages, and differential against the league average ({leagueAverageTeamPPG} PPG).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-700 font-bold text-slate-300">
              {totalMatchesCompleted} / {totalMatchesScheduled} Matches Completed
            </span>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3.5">Rank</th>
                <th className="py-3 px-3.5">Team &amp; Captain</th>
                <th className="py-3 px-3.5 text-center">Matches (W-L)</th>
                <th className="py-3 px-3.5 text-center">Match Win %</th>
                <th className="py-3 px-3.5 text-center">Games (W-L)</th>
                <th className="py-3 px-3.5 text-center">Game Win %</th>
                <th className="py-3 px-3.5 text-right">Total Pts</th>
                <th className="py-3 px-3.5 text-right">Team PPG</th>
                <th className="py-3 px-3.5 text-right">vs. League Avg</th>
                <th className="py-3 px-3.5 text-center">8-Balls Sunk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {teamsPerformance.map((team, idx) => {
                const isAboveAvg = team.differentialVsLeagueAvg > 0;
                const isEven = team.differentialVsLeagueAvg === 0;

                return (
                  <tr
                    key={team.teamId}
                    className="hover:bg-slate-750/50 transition cursor-pointer"
                    onClick={() => onSelectTeam && onSelectTeam(team.teamId)}
                  >
                    <td className="py-3 px-3.5 font-bold">
                      {idx === 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-black">
                          <Trophy className="w-4 h-4" /> #1
                        </span>
                      ) : idx === 1 ? (
                        <span className="text-slate-300 font-black">#2</span>
                      ) : idx === 2 ? (
                        <span className="text-amber-600 font-black">#3</span>
                      ) : (
                        <span className="text-slate-500 font-bold">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-white text-base flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{team.teamName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Captain: <span className="text-slate-300 font-medium">{team.captainName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="text-emerald-400 font-bold">{team.matchesWon}</span>
                      <span className="text-slate-500"> - </span>
                      <span className="text-slate-400">{team.matchesLost}</span>
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-slate-200">
                      {team.matchWinRate}%
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="text-white font-bold">{team.gamesWon}</span>
                      <span className="text-slate-500 text-xs"> / {team.gamesPlayed}</span>
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-teal-300">
                      {team.gameWinRate}%
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-amber-400 text-base">
                      {team.totalPoints}
                    </td>
                    <td className="py-3 px-3.5 text-right font-black text-white text-base">
                      {team.pointsPerGame.toFixed(2)}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {team.gamesPlayed > 0 ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black ${
                            isAboveAvg
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                              : isEven
                              ? 'bg-slate-900 text-slate-300 border border-slate-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          }`}
                        >
                          {isAboveAvg ? `+${team.differentialVsLeagueAvg.toFixed(2)}` : `${team.differentialVsLeagueAvg.toFixed(2)}`}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-slate-700 text-xs font-bold">
                        🎱 {team.eightBallsSunk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. TOP-PERFORMING PLAYER RANKINGS */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950/80 border border-amber-600/60 rounded-xl text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Top-Performing Player Rankings</h3>
              <p className="text-xs text-slate-400">
                Official leaderboard recognizing the season&apos;s standout shooters across multiple scoring &amp; efficiency disciplines.
              </p>
            </div>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveCategory('points')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'points'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> Total Points
            </button>
            <button
              onClick={() => setActiveCategory('average')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'average'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> Avg PPG
            </button>
            <button
              onClick={() => setActiveCategory('gwp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'gwp'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Win Rate %
            </button>
            <button
              onClick={() => setActiveCategory('eightBall')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'eightBall'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> 8-Balls
            </button>
            <button
              onClick={() => setActiveCategory('shutout')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'shutout'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Perfect 10s &amp; Shutouts
            </button>
            <button
              onClick={() => setActiveCategory('defense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'defense'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Defense (Opp PPG)
            </button>
            <button
              onClick={() => setActiveCategory('diff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'diff'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Margin (+/-)
            </button>
            <button
              onClick={() => setActiveCategory('streak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                activeCategory === 'streak'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Win Streaks
            </button>
          </div>
        </div>

        {/* Category Header */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> {currentRanking.label}
          </h4>
          <span className="text-xs text-slate-400">Top 5 Qualifying Shooters</span>
        </div>

        {/* Podium Display (Top 3 Players) */}
        {currentRanking.list.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            {/* 1st Place */}
            {currentRanking.list[0] && (
              <div
                onClick={() => onSelectPlayer && onSelectPlayer(currentRanking.list[0])}
                className="bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/70 rounded-2xl p-4 shadow-lg relative flex flex-col justify-between order-1 sm:order-2 cursor-pointer hover:border-amber-400 hover:scale-[1.01] transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-500/20 text-amber-300 font-black rounded-xl border border-amber-500/40 text-sm">
                      👑 1st
                    </span>
                    <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                      Leader
                    </span>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-xs flex items-center justify-center" title="Handicap">
                    H{currentRanking.list[0].handicap}
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-lg font-black text-white flex items-center gap-1.5 truncate">
                    <span>{currentRanking.list[0].playerName}</span>
                    {currentRanking.list[0].isCaptain && (
                      <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1 py-0.5 rounded font-bold">
                        CAPTAIN
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium truncate">
                    {currentRanking.list[0].teamName}
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-900/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{currentRanking.metricName}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-400 text-base">
                      {currentRanking.metricFormatter(currentRanking.list[0])}
                    </span>
                    {activeCategory === 'streak' && (
                      <StreakBadge currentStreak={currentRanking.list[0].currentStreak} size="xs" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2nd Place */}
            {currentRanking.list[1] && (
              <div
                onClick={() => onSelectPlayer && onSelectPlayer(currentRanking.list[1])}
                className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-600/80 rounded-2xl p-4 shadow-md flex flex-col justify-between order-2 sm:order-1 cursor-pointer hover:border-slate-400 hover:scale-[1.01] transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-slate-700/60 text-slate-200 font-black rounded-xl border border-slate-500/40 text-xs">
                      🥈 2nd
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">
                      Runner-Up
                    </span>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center" title="Handicap">
                    H{currentRanking.list[1].handicap}
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-base font-black text-white flex items-center gap-1.5 truncate">
                    <span>{currentRanking.list[1].playerName}</span>
                    {currentRanking.list[1].isCaptain && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-bold">
                        CAPTAIN
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium truncate">
                    {currentRanking.list[1].teamName}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{currentRanking.metricName}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-sm">
                      {currentRanking.metricFormatter(currentRanking.list[1])}
                    </span>
                    {activeCategory === 'streak' && (
                      <StreakBadge currentStreak={currentRanking.list[1].currentStreak} size="xs" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {currentRanking.list[2] && (
              <div
                onClick={() => onSelectPlayer && onSelectPlayer(currentRanking.list[2])}
                className="bg-gradient-to-b from-amber-950/20 to-slate-900 border border-amber-800/40 rounded-2xl p-4 shadow-md flex flex-col justify-between order-3 cursor-pointer hover:border-amber-600 hover:scale-[1.01] transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-900/30 text-amber-500 font-black rounded-xl border border-amber-700/40 text-xs">
                      🥉 3rd
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">
                      Podium
                    </span>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center" title="Handicap">
                    H{currentRanking.list[2].handicap}
                  </span>
                </div>
                <div className="my-3">
                  <div className="text-base font-black text-white flex items-center gap-1.5 truncate">
                    <span>{currentRanking.list[2].playerName}</span>
                    {currentRanking.list[2].isCaptain && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-bold">
                        CAPTAIN
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium truncate">
                    {currentRanking.list[2].teamName}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{currentRanking.metricName}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 text-sm">
                      {currentRanking.metricFormatter(currentRanking.list[2])}
                    </span>
                    {activeCategory === 'streak' && (
                      <StreakBadge currentStreak={currentRanking.list[2].currentStreak} size="xs" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Rankings Table for Top 5 */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Player Name</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3 text-right">{currentRanking.metricName}</th>
                <th className="py-2.5 px-3 text-center">Played</th>
                <th className="py-2.5 px-3 text-center">Won / Lost</th>
                <th className="py-2.5 px-3 text-right">PPG</th>
                <th className="py-2.5 px-3 text-right">GWP %</th>
                <th className="py-2.5 px-3 text-center">Handicap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {currentRanking.list.map((player, idx) => (
                <tr
                  key={player.playerId}
                  onClick={() => onSelectPlayer && onSelectPlayer(player)}
                  className="hover:bg-slate-750/70 transition cursor-pointer"
                  title={`Click to view full billiards profile for ${player.playerName}`}
                >
                  <td className="py-2.5 px-3 text-xs font-bold">
                    {idx === 0 ? (
                      <span className="text-amber-400 font-black">#1 👑</span>
                    ) : idx === 1 ? (
                      <span className="text-slate-300 font-black">#2 🥈</span>
                    ) : idx === 2 ? (
                      <span className="text-amber-500 font-black">#3 🥉</span>
                    ) : (
                      <span className="text-slate-500">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    <span>{player.playerName}</span>
                    {player.isCaptain && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                        CAPTAIN
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-xs">{player.teamName}</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-400 text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <span>{currentRanking.metricFormatter(player)}</span>
                      {activeCategory === 'streak' && (
                        <StreakBadge currentStreak={player.currentStreak} size="xs" />
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-300">{player.gamesPlayed}</td>
                  <td className="py-2.5 px-3 text-center text-slate-300">
                    <span className="text-emerald-400 font-bold">{player.gamesWon}</span>
                    <span className="text-slate-500 text-xs"> / {player.gamesLost}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">
                    {player.averageScore.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-teal-300">
                    {player.gwp}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-black text-xs">
                      {player.handicap}
                    </span>
                  </td>
                </tr>
              ))}
              {currentRanking.list.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500 italic">
                    No games recorded yet for this ranking category. Enter game scores in the schedule to view rankings!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
