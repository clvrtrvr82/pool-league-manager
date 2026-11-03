import React from 'react';
import { X, HelpCircle, Trophy, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { PlayerStats } from '../types';

interface HandicapFormulaModalProps {
  isOpen: boolean;
  player: PlayerStats | null;
  onClose: () => void;
}

export const HandicapFormulaModal: React.FC<HandicapFormulaModalProps> = ({
  isOpen,
  player,
  onClose,
}) => {
  if (!isOpen) return null;

  // Scale tiers: 2 through 7
  const tiers = [
    { level: 7, title: 'Elite Master', minAvg: 9.0, maxAvg: 10.0, rangeLabel: '9.0 - 10.0', desc: 'Elite ball-pocketing & run-out capability' },
    { level: 6, title: 'Advanced', minAvg: 8.0, maxAvg: 8.99, rangeLabel: '8.0 - 8.9', desc: 'High break-and-run frequency' },
    { level: 5, title: 'Strong Intermediate', minAvg: 6.5, maxAvg: 7.99, rangeLabel: '6.5 - 7.9', desc: 'Consistently pockets 5+ balls per game' },
    { level: 4, title: 'Intermediate', minAvg: 5.0, maxAvg: 6.49, rangeLabel: '5.0 - 6.4', desc: 'Solid shotmaking, developing table run strategy' },
    { level: 3, title: 'Developing', minAvg: 3.5, maxAvg: 4.99, rangeLabel: '3.5 - 4.9', desc: 'Baseline starting handicap for new players' },
    { level: 2, title: 'Novice', minAvg: 0.0, maxAvg: 3.49, rangeLabel: '< 3.5', desc: 'Learning fundamental stance and pocketing' },
  ];

  const currentHandicap = player ? player.handicap : 3;
  const currentAvg = player ? player.averageScore : 0;
  const gamesPlayed = player ? player.gamesPlayed : 0;
  const totalScore = player ? player.totalScore : 0;

  // Next level threshold calculation
  const nextTier = tiers.find((t) => t.level === currentHandicap + 1);
  const neededAvgDiff = nextTier && player ? (nextTier.minAvg - currentAvg) : null;

  return (
    <div
      id="handicap-formula-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border-2 border-emerald-600/60 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl text-slate-100 relative my-auto max-h-[92vh] flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-10">
          <div className="p-3 bg-emerald-950 border border-emerald-500/70 rounded-2xl text-emerald-400 shadow-md shadow-emerald-950/80">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Handicap Formula Breakdown
              </h2>
              {player && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-600">
                  Level {player.handicap}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {player ? (
                <>
                  Official calculation for <strong className="text-white">{player.playerName}</strong> ({player.teamName})
                </>
              ) : (
                'Official Pool League 2–7 Handicap Formula & Scoring Scale'
              )}
            </p>
          </div>
        </div>

        {/* Player's Live Math Card (if specific player selected) */}
        {player ? (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Live Calculation Math
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-computed from match scores
              </span>
            </div>

            {/* Math Formula equation block */}
            <div className="bg-slate-950/90 border border-slate-700/90 rounded-xl p-3.5 sm:p-4 text-center">
              <div className="text-xs text-slate-400 mb-1">Scoring Average Formula:</div>
              <div className="flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base font-black flex-wrap">
                <span className="text-slate-300">Scoring Average</span>
                <span className="text-slate-500">=</span>
                <div className="inline-flex flex-col items-center">
                  <span className="text-emerald-400 border-b border-slate-600 px-2">
                    {totalScore} Total Points Scored
                  </span>
                  <span className="text-slate-400 px-2">
                    {gamesPlayed > 0 ? gamesPlayed : 1} Games Played
                  </span>
                </div>
                <span className="text-slate-500">=</span>
                <span className="text-xl sm:text-2xl text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-600/80 shadow-xs">
                  {currentAvg.toFixed(2)} pts/game
                </span>
              </div>
            </div>

            {/* Result interpretation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
              <div className="text-slate-300">
                {gamesPlayed === 0 ? (
                  <span>
                    New player with 0 games played defaults to baseline <strong>Handicap 3</strong>.
                  </span>
                ) : (
                  <span>
                    An average of <strong>{currentAvg.toFixed(2)}</strong> places this player in{' '}
                    <strong className="text-emerald-300">Handicap Level {player.handicap}</strong>.
                  </span>
                )}
              </div>

              {neededAvgDiff !== null && neededAvgDiff > 0 && nextTier && (
                <div className="text-amber-300 bg-amber-950/70 border border-amber-700/60 px-2.5 py-1 rounded-lg font-semibold self-start sm:self-auto flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>
                    +{neededAvgDiff.toFixed(2)} pts/g to reach <strong>Level {nextTier.level}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-5 text-xs text-slate-300">
            <p>
              Handicap is evaluated continuously on each player&apos;s cumulative <strong>Points-Per-Game (PPG)</strong> average (0 to 10 points possible per game).
            </p>
          </div>
        )}

        {/* 2 to 7 Handicap Scale Table */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Official League 2 to 7 Scale
            </h3>
            <span className="text-[11px] text-slate-400">Max 10 pts per game</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tiers.map((tier) => {
              const isCurrent = player
                ? gamesPlayed === 0
                  ? tier.level === 3
                  : currentAvg >= tier.minAvg && currentAvg <= tier.maxAvg
                : false;

              return (
                <div
                  key={tier.level}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center border shadow-xs ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-extrabold'
                          : 'bg-slate-900 text-slate-200 border-slate-700'
                      }`}
                    >
                      {tier.level}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>Level {tier.level} • {tier.title}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{tier.desc}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400 block">
                      {tier.rangeLabel}
                    </span>
                    <span className="text-[10px] text-slate-500">pts/g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why this formula matters footer */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            <strong>Fair Play Guarantee:</strong> In pool leagues, handicaps level the playing field so teams of all skill levels can compete equally. Handicaps recalculate automatically after every match day based on verified scores.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
