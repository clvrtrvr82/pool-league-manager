import React, { useState } from 'react';
import {
  X,
  Trophy,
  Shield,
  CircleDot,
  Flame,
  Award,
  Zap,
  Target,
  HelpCircle,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Swords,
} from 'lucide-react';
import { PlayerStats, PlayerGameRecord } from '../types';
import { StreakBadge } from './StreakBadge';

interface PlayerDetailModalProps {
  player: PlayerStats | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenHandicapModal?: (player: PlayerStats) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  player,
  isOpen,
  onClose,
  onOpenHandicapModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'gamelog' | 'h2h'>('overview');

  if (!isOpen || !player) return null;

  // Aggregate Head-to-Head stats from gameLog
  const h2hMap = new Map<
    string,
    {
      opponentName: string;
      opponentTeam: string;
      gamesPlayed: number;
      gamesWon: number;
      pointsFor: number;
      pointsAgainst: number;
      eightBalls: number;
    }
  >();

  player.gameLog.forEach((g) => {
    const oppKey = g.opponentId || g.opponentName;
    if (!h2hMap.has(oppKey)) {
      h2hMap.set(oppKey, {
        opponentName: g.opponentName,
        opponentTeam: g.opponentTeamName,
        gamesPlayed: 0,
        gamesWon: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        eightBalls: 0,
      });
    }
    const rec = h2hMap.get(oppKey)!;
    rec.gamesPlayed += 1;
    if (g.isWinner) rec.gamesWon += 1;
    rec.pointsFor += g.myScore;
    rec.pointsAgainst += g.opponentScore;
    if (g.sunk8Ball) rec.eightBalls += 1;
  });

  const h2hList = Array.from(h2hMap.values()).sort((a, b) => b.gamesPlayed - a.gamesPlayed);

  return (
    <div
      id="player-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-2 border-emerald-600/60 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl text-slate-100 relative my-auto max-h-[92vh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Player Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/80 pr-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-2xl font-black text-white shadow-lg border border-emerald-400/40">
              {player.playerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white">{player.playerName}</h2>
                {player.isCaptain && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-black px-2 py-0.5 rounded-md border border-amber-500/30">
                    TEAM CAPTAIN
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-slate-300 font-semibold">{player.teamName}</span>
                <span>•</span>
                <span>{player.gamesPlayed} Frames Logged</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-2.5 text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Handicap</div>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="text-xl font-black text-emerald-400">HCP {player.handicap}</span>
                {onOpenHandicapModal && (
                  <button
                    onClick={() => onOpenHandicapModal(player)}
                    className="text-slate-400 hover:text-emerald-300 p-0.5"
                    title="View Handicap Formula Details"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-2.5 text-center min-w-[90px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Power Rating</div>
              <div className="text-xl font-black text-teal-300 mt-0.5">
                {player.powerRating}
                <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Billiards Stat Card
          </button>
          <button
            onClick={() => setActiveTab('gamelog')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'gamelog'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Rack Log ({player.gameLog.length})
          </button>
          <button
            onClick={() => setActiveTab('h2h')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'h2h'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" /> Head-to-Head ({h2hList.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW BILLIARDS STAT CARD */}
        {activeTab === 'overview' && (
          <div className="pt-4 space-y-4">
            {/* Primary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Scoring Average</div>
                <div className="text-2xl font-black text-white mt-1">
                  {player.averageScore.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                  {player.totalScore} total pts scored
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Game Win Rate (GWP)</div>
                <div className="text-2xl font-black text-teal-300 mt-1">
                  {player.gwp}%
                </div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {player.gamesWon}W - {player.gamesLost}L
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">8-Balls Pocketed</div>
                <div className="text-2xl font-black text-indigo-300 mt-1">
                  🎱 {player.eightBallsSunk}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {player.eightBallRate}% finish rate
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Point Margin (+/-)</div>
                <div className={`text-2xl font-black mt-1 ${player.pointDifferential >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {player.pointDifferential >= 0 ? `+${player.pointDifferential}` : player.pointDifferential}
                </div>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {player.differentialPerGame >= 0 ? `+${player.differentialPerGame}` : player.differentialPerGame} / rack
                </div>
              </div>
            </div>

            {/* In-Depth Billiards Disciplines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Offense & Accuracy Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Target className="w-4 h-4" />
                    <span>Offense &amp; Run-Outs</span>
                  </div>
                  <span className="text-[11px] text-slate-400">10 Pts Max/Game</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Perfect 10s (Full 7 + 8-Ball):</span>
                    <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                      🌟 {player.perfectTens} racks
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">8-Balls Sunk (Match Closers):</span>
                    <span className="font-bold text-indigo-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                      🎱 {player.eightBallsSunk} ({player.eightBallRate}% of games)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Total Balls / Points Accumulated:</span>
                    <span className="font-bold text-emerald-400">{player.totalScore} pts</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Scoring Average (PPG):</span>
                    <span className="font-black text-white">{player.averageScore.toFixed(2)} pts/game</span>
                  </div>
                </div>
              </div>

              {/* Defense & Safeties Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Defense &amp; Safety Play</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Opponent Containment</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Defensive Average (Opp PPG):</span>
                    <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                      🛡️ {player.opponentAverageScore.toFixed(2)} pts allowed/g
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">10-0 Shutouts Delivered (Skunks):</span>
                    <span className="font-bold text-teal-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                      ⚡ {player.shutoutsDelivered} shutouts
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Times Shut Out (0 Points):</span>
                    <span className="font-bold text-slate-400">{player.shutoutsSuffered} times</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Net Differential Margin:</span>
                    <span className={`font-black ${player.pointDifferential >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {player.pointDifferential >= 0 ? `+${player.pointDifferential}` : player.pointDifferential} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Home / Break Advantage Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Break &amp; Rotation Splits</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Home vs. Away</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Home (Broke First in Rack):</span>
                    <span className="font-bold text-emerald-400">
                      {player.homeGamesWon}W - {player.homeGamesPlayed - player.homeGamesWon}L ({player.homeWinRate}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Away (Opponent Broke):</span>
                    <span className="font-bold text-slate-300">
                      {player.awayGamesWon}W - {player.awayGamesPlayed - player.awayGamesWon}L ({player.awayWinRate}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Break Advantage Differential:</span>
                    <span className="font-bold text-teal-300">
                      {player.homeWinRate >= player.awayWinRate
                        ? `+${(player.homeWinRate - player.awayWinRate).toFixed(1)}% when breaking`
                        : `${(player.homeWinRate - player.awayWinRate).toFixed(1)}% when breaking`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Streaks & Form Card */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Flame className="w-4 h-4" />
                    <span>Form &amp; Streaks</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Momentum &amp; Runs</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Current Form Streak:</span>
                    <StreakBadge
                      currentStreak={player.currentStreak}
                      longestWinStreak={player.longestWinStreak}
                      gameLog={player.gameLog}
                      size="sm"
                      showLabel={true}
                    />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Recent Racks (Last 5):</span>
                    <StreakBadge
                      currentStreak={player.currentStreak}
                      gameLog={player.gameLog}
                      showTrend={true}
                      maxTrendCount={5}
                      size="xs"
                    />
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-750">
                    <span className="text-slate-400">Longest Season Win Streak:</span>
                    <span className="font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-600/50">
                      🏆 {player.longestWinStreak} Games Won Consecutive
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Games Won / Total Played:</span>
                    <span className="font-bold text-white">
                      {player.gamesWon} / {player.gamesPlayed} ({player.gwp}% GWP)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GAME-BY-GAME RACK LOG */}
        {activeTab === 'gamelog' && (
          <div className="pt-4 space-y-3">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Chronological list of all racks played by {player.playerName}:</span>
              <span className="font-bold text-slate-300">{player.gameLog.length} Total Games</span>
            </div>

            {player.gameLog.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                No games completed yet for this player.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Week</th>
                      <th className="py-2.5 px-3">Table</th>
                      <th className="py-2.5 px-3">Side</th>
                      <th className="py-2.5 px-3">Opponent</th>
                      <th className="py-2.5 px-3 text-center">Score</th>
                      <th className="py-2.5 px-3 text-center">8-Ball</th>
                      <th className="py-2.5 px-3 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-850/60 font-medium">
                    {player.gameLog.map((g, idx) => (
                      <tr key={`${g.gameId}-${idx}`} className="hover:bg-slate-750/50 transition">
                        <td className="py-2.5 px-3 text-slate-400 font-bold whitespace-nowrap">
                          Week {g.dayNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          Table {g.tableNumber} (G{g.gameNumber})
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {g.isHome ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                              Break (Home)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                              Away
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white">{g.opponentName}</div>
                          <div className="text-[10px] text-slate-400">{g.opponentTeamName}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-xs ${
                              g.isWinner
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {g.myScore} - {g.opponentScore}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {g.sunk8Ball ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-950 border border-indigo-600 text-indigo-300 text-[11px]" title="Pocketed 8-Ball">
                              🎱
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {g.isWinner ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-black text-xs">
                              WIN {g.myScore === 10 && g.opponentScore === 0 ? '⚡' : ''}
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold text-xs">LOSS</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HEAD-TO-HEAD BREAKDOWN */}
        {activeTab === 'h2h' && (
          <div className="pt-4 space-y-3">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Performance history vs individual opponents faced:</span>
              <span className="font-bold text-slate-300">{h2hList.length} Unique Opponents</span>
            </div>

            {h2hList.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
                No head-to-head match data recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Opponent</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3 text-center">Games</th>
                      <th className="py-2.5 px-3 text-center">Record (W-L)</th>
                      <th className="py-2.5 px-3 text-center">Points (For - Against)</th>
                      <th className="py-2.5 px-3 text-center">8-Balls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-850/60 font-medium">
                    {h2hList.map((opp, idx) => (
                      <tr key={`${opp.opponentName}-${idx}`} className="hover:bg-slate-750/50 transition">
                        <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                          {opp.opponentName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {opp.opponentTeam}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-200">
                          {opp.gamesPlayed}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span className="text-emerald-400 font-bold">{opp.gamesWon}</span>
                          <span className="text-slate-500"> - </span>
                          <span className="text-slate-400">{opp.gamesPlayed - opp.gamesWon}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-slate-200">
                          {opp.pointsFor} - {opp.pointsAgainst}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-indigo-300 font-bold">🎱 {opp.eightBalls}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
