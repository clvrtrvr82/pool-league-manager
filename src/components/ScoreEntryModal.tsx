import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Check, RotateCcw, Trash2, ChevronDown, AlertCircle } from 'lucide-react';
import { GameScore, IndividualGame } from '../types';

interface ScoreEntryModalProps {
  isOpen: boolean;
  game: IndividualGame | null;
  tableNumber: number;
  dayNumber?: number;
  onClose: () => void;
  onSaveScore: (gameId: string, homeScore: GameScore, awayScore: GameScore) => void;
  onClearGame?: (gameId: string) => void;
  onClearRound?: (matchId: string, roundNumber: number) => void;
  onClearMatch?: (matchId: string) => void;
  onClearDay?: (dayNumber: number) => void;
  onClearAll?: () => void;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  isOpen,
  game,
  tableNumber,
  dayNumber,
  onClose,
  onSaveScore,
  onClearGame,
  onClearRound,
  onClearMatch,
  onClearDay,
  onClearAll,
}) => {
  // Home player state: null means nothing pre-selected
  const [homeBalls, setHomeBalls] = useState<number | null>(null);
  const [home8Ball, setHome8Ball] = useState<boolean>(false);

  // Away player state: null means nothing pre-selected
  const [awayBalls, setAwayBalls] = useState<number | null>(null);
  const [away8Ball, setAway8Ball] = useState<boolean>(false);

  const [showClearMenu, setShowClearMenu] = useState<boolean>(false);
  const clearMenuRef = useRef<HTMLDivElement>(null);

  // Close clear menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (clearMenuRef.current && !clearMenuRef.current.contains(e.target as Node)) {
        setShowClearMenu(false);
      }
    };
    if (showClearMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showClearMenu]);

  useEffect(() => {
    if (game && game.completed && game.homeScore && game.awayScore) {
      // Load already saved scores
      setHomeBalls(game.homeScore.ballsPocketed);
      setHome8Ball(game.homeScore.sunk8Ball);
      setAwayBalls(game.awayScore.ballsPocketed);
      setAway8Ball(game.awayScore.sunk8Ball);
    } else {
      // When entering score fresh, NOTHING is pre-selected!
      setHomeBalls(null);
      setHome8Ball(false);
      setAwayBalls(null);
      setAway8Ball(false);
    }
    setShowClearMenu(false);
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  // Rules: 1 pt per ball pocketed + 3 pts for 8-ball
  const homeTotal = (homeBalls !== null ? homeBalls : 0) + (home8Ball ? 3 : 0);
  const awayTotal = (awayBalls !== null ? awayBalls : 0) + (away8Ball ? 3 : 0);

  const isHomeBallsSelected = homeBalls !== null;
  const isAwayBallsSelected = awayBalls !== null;
  const isFormComplete = isHomeBallsSelected && isAwayBallsSelected;

  const homeIsWinner = home8Ball || (!away8Ball && isFormComplete && homeTotal > awayTotal);
  const awayIsWinner = away8Ball || (!home8Ball && isFormComplete && awayTotal > homeTotal);

  const handleToggleHome8Ball = () => {
    if (!home8Ball) {
      setHome8Ball(true);
      setAway8Ball(false); // Only 1 player can sink the 8-ball to win
    } else {
      setHome8Ball(false);
    }
  };

  const handleToggleAway8Ball = () => {
    if (!away8Ball) {
      setAway8Ball(true);
      setHome8Ball(false); // Only 1 player can sink the 8-ball to win
    } else {
      setAway8Ball(false);
    }
  };

  const handleApplyPreset = (winner: 'home' | 'away', loserBalls: number) => {
    if (winner === 'home') {
      setHomeBalls(7);
      setHome8Ball(true);
      setAwayBalls(loserBalls);
      setAway8Ball(false);
    } else {
      setAwayBalls(7);
      setAway8Ball(true);
      setHomeBalls(loserBalls);
      setHome8Ball(false);
    }
  };

  const handleResetToBlank = () => {
    setHomeBalls(null);
    setHome8Ball(false);
    setAwayBalls(null);
    setAway8Ball(false);
  };

  const handleSave = () => {
    if (!isFormComplete) {
      return;
    }

    const homeScore: GameScore = {
      playerId: game.homePlayerId,
      playerName: game.homePlayerName,
      isSubstitute: game.homeIsSub,
      ballsPocketed: homeBalls ?? 0,
      sunk8Ball: home8Ball,
      totalPoints: homeTotal,
      isWinner: homeIsWinner,
    };

    const awayScore: GameScore = {
      playerId: game.awayPlayerId,
      playerName: game.awayPlayerName,
      isSubstitute: game.awayIsSub,
      ballsPocketed: awayBalls ?? 0,
      sunk8Ball: away8Ball,
      totalPoints: awayTotal,
      isWinner: awayIsWinner,
    };

    onSaveScore(game.id, homeScore, awayScore);
    onClose();
  };

  return (
    <div id="score-entry-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-xs">
      <div className="bg-slate-900 border-2 border-emerald-600/50 rounded-2xl max-w-xl w-full p-5 sm:p-7 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-700/60 rounded-full text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 flex-wrap justify-center">
            <span>Table {tableNumber}</span>
            <span>•</span>
            <span>Round {game.roundNumber} (Game #{game.gameNumber})</span>
            <span>•</span>
            <span className="text-amber-300 font-black">⚡ {game.homeTeamName || 'Home Team'} Breaks First</span>
            {game.completed && (
              <>
                <span>•</span>
                <span className="text-emerald-400">Scored</span>
              </>
            )}
          </div>
          <h2 className="text-2xl font-black text-white">Enter Game Score</h2>
          <p className="text-xs text-slate-400 mt-1">
            Rules: 1 point for each ball pocketed (max 7). 3 bonus points for sinking 8-ball (max 10). Home team breaks first.
          </p>
        </div>

        {/* Quick presets for common outcomes */}
        <div className="mb-5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-300 font-semibold">Quick Presets (Optional):</span>
            {(homeBalls !== null || awayBalls !== null || home8Ball || away8Ball) && (
              <button
                type="button"
                onClick={handleResetToBlank}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear selections
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleApplyPreset('home', 0)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 cursor-pointer"
            >
              Home 10 - 0 (Skunk)
            </button>
            <button
              onClick={() => handleApplyPreset('home', 4)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 cursor-pointer"
            >
              Home 10 - 4
            </button>
            <button
              onClick={() => handleApplyPreset('home', 6)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 cursor-pointer"
            >
              Home 10 - 6
            </button>
            <button
              onClick={() => handleApplyPreset('away', 4)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 cursor-pointer"
            >
              Visitors 10 - 4
            </button>
            <button
              onClick={() => handleApplyPreset('away', 6)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 cursor-pointer"
            >
              Visitors 10 - 6
            </button>
          </div>
        </div>

        {/* Players side-by-side or stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* HOME PLAYER CARD */}
          <div
            className={`p-4 rounded-xl border-2 transition ${
              homeIsWinner
                ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/50'
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700 flex items-center gap-1.5 shadow-xs">
                <span>⚡ Breaks First</span>
                <span>•</span>
                <span>Home ({game.homeTeamName || 'Home Team'})</span>
              </span>
              {homeIsWinner && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-600/50">
                  <Trophy className="w-3.5 h-3.5" /> WINNER
                </span>
              )}
            </div>

            <div className="font-bold text-lg text-white mb-3 truncate" title={game.homePlayerName}>
              {game.homePlayerName}
              {game.homeIsSub && <span className="text-xs text-amber-400 ml-1.5">(Sub)</span>}
            </div>

            {/* Balls pocketed counter */}
            <div className="mb-4">
              <div className="text-xs text-slate-300 font-medium mb-1.5 flex justify-between items-center">
                <span>Balls Pocketed (1 pt each):</span>
                <span className="font-bold">
                  {homeBalls !== null ? (
                    <span className="text-white font-black">{homeBalls} balls</span>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic font-normal">None selected</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setHomeBalls((prev) => (prev === b ? null : b))}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      homeBalls === b
                        ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-300 shadow-sm'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* 8-Ball Sunk Toggle */}
            <button
              type="button"
              onClick={handleToggleHome8Ball}
              className={`w-full py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                home8Ball
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center border border-white">
                8
              </span>
              <span>Sank 8-Ball (+3 pts)</span>
              {home8Ball && <Check className="w-4 h-4 text-emerald-200" />}
            </button>

            {/* Total Points Display */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Points:</span>
              <span className={`text-2xl font-black ${isHomeBallsSelected || home8Ball ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isHomeBallsSelected || home8Ball ? `${homeTotal} pts` : '—'}
              </span>
            </div>
          </div>

          {/* AWAY / VISITORS PLAYER CARD */}
          <div
            className={`p-4 rounded-xl border-2 transition ${
              awayIsWinner
                ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/50'
                : 'bg-slate-800/80 border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-teal-400 uppercase tracking-wider bg-teal-950 px-2 py-0.5 rounded border border-teal-700">
                Visitor ({game.awayTeamName || 'Visiting Team'})
              </span>
              {awayIsWinner && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-600/50">
                  <Trophy className="w-3.5 h-3.5" /> WINNER
                </span>
              )}
            </div>

            <div className="font-bold text-lg text-white mb-3 truncate" title={game.awayPlayerName}>
              {game.awayPlayerName}
              {game.awayIsSub && <span className="text-xs text-amber-400 ml-1.5">(Sub)</span>}
            </div>

            {/* Balls pocketed counter */}
            <div className="mb-4">
              <div className="text-xs text-slate-300 font-medium mb-1.5 flex justify-between items-center">
                <span>Balls Pocketed (1 pt each):</span>
                <span className="font-bold">
                  {awayBalls !== null ? (
                    <span className="text-white font-black">{awayBalls} balls</span>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic font-normal">None selected</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setAwayBalls((prev) => (prev === b ? null : b))}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                      awayBalls === b
                        ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-300 shadow-sm'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* 8-Ball Sunk Toggle */}
            <button
              type="button"
              onClick={handleToggleAway8Ball}
              className={`w-full py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                away8Ball
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center border border-white">
                8
              </span>
              <span>Sank 8-Ball (+3 pts)</span>
              {away8Ball && <Check className="w-4 h-4 text-emerald-200" />}
            </button>

            {/* Total Points Display */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Points:</span>
              <span className={`text-2xl font-black ${isAwayBallsSelected || away8Ball ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isAwayBallsSelected || away8Ball ? `${awayTotal} pts` : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Validation hint if incomplete */}
        {!isFormComplete && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 py-1.5 px-3 rounded-xl">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>
              Select balls pocketed for both players ({!isHomeBallsSelected && !isAwayBallsSelected ? 'both needed' : !isHomeBallsSelected ? 'Home player needed' : 'Visitor needed'})
            </span>
          </div>
        )}

        {/* Action buttons with Clear Menu */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800">
          {/* Clear Button with Dropdown (Game, Round, All) */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={clearMenuRef}>
              <button
                type="button"
                onClick={() => setShowClearMenu(!showClearMenu)}
                className="text-xs font-bold text-rose-300 hover:text-white bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                title="Clear game, round, or match scores"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Clear...</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showClearMenu ? 'rotate-180' : ''}`} />
              </button>

              {showClearMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-900 border-2 border-rose-700/80 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] font-black uppercase tracking-wider text-rose-400 px-2.5 py-1">
                    Clear Scores Options
                  </div>
                  <div className="space-y-1 mt-1">
                    {/* Option 1: Clear Game */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowClearMenu(false);
                        if (onClearGame && game) {
                          onClearGame(game.id);
                          onClose();
                        } else {
                          handleResetToBlank();
                        }
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-rose-950/70 rounded-xl transition cursor-pointer flex items-start gap-2 text-xs text-slate-200"
                    >
                      <span className="font-black text-rose-400">🎯</span>
                      <div>
                        <div className="font-bold text-white">Clear Game #{game.gameNumber}</div>
                        <div className="text-[10px] text-slate-400">Reset this game score to unplayed</div>
                      </div>
                    </button>

                    {/* Option 2: Clear Round */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowClearMenu(false);
                        if (window.confirm(`Clear all scores in Round ${game.roundNumber} for Table ${tableNumber}?`)) {
                          if (onClearRound && game) {
                            onClearRound(game.matchId, game.roundNumber);
                            onClose();
                          }
                        }
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-rose-950/70 rounded-xl transition cursor-pointer flex items-start gap-2 text-xs text-slate-200"
                    >
                      <span className="font-black text-rose-400">🔄</span>
                      <div>
                        <div className="font-bold text-white">Clear Round {game.roundNumber}</div>
                        <div className="text-[10px] text-slate-400">Reset all games in Round {game.roundNumber}</div>
                      </div>
                    </button>

                    {/* Option 3: Clear All in Match */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowClearMenu(false);
                        if (window.confirm(`Clear all games in this match (Table ${tableNumber})?`)) {
                          if (onClearMatch && game) {
                            onClearMatch(game.matchId);
                            onClose();
                          }
                        }
                      }}
                      className="w-full text-left px-2.5 py-2 hover:bg-rose-950/70 rounded-xl transition cursor-pointer flex items-start gap-2 text-xs text-slate-200 border-t border-slate-800 pt-1.5"
                    >
                      <span className="font-black text-rose-400">⚡</span>
                      <div>
                        <div className="font-bold text-white">Clear All in Match</div>
                        <div className="text-[10px] text-slate-400">Reset both Round 1 & Round 2</div>
                      </div>
                    </button>

                    {dayNumber && onClearDay && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowClearMenu(false);
                          if (window.confirm(`Clear ALL scores for Day ${dayNumber}?`)) {
                            onClearDay(dayNumber);
                            onClose();
                          }
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-rose-950/70 rounded-xl transition cursor-pointer flex items-start gap-2 text-xs text-slate-200"
                      >
                        <span className="font-black text-rose-400">📅</span>
                        <div>
                          <div className="font-bold text-white">Clear All Day {dayNumber}</div>
                          <div className="text-[10px] text-slate-400">Reset all tables scheduled today</div>
                        </div>
                      </button>
                    )}

                    {onClearAll && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowClearMenu(false);
                          if (window.confirm('Clear ALL scores across the entire tournament?')) {
                            onClearAll();
                            onClose();
                          }
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-rose-950/70 rounded-xl transition cursor-pointer flex items-start gap-2 text-xs text-rose-300 border-t border-slate-800 pt-1.5"
                      >
                        <span className="font-black text-rose-400">⚠️</span>
                        <div>
                          <div className="font-bold text-rose-300">Clear All Tournament</div>
                          <div className="text-[10px] text-slate-400">Reset every scored match</div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Unselect / Blank form reset */}
            <button
              type="button"
              onClick={handleResetToBlank}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 py-2 px-2.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Clear all numbers back to unselected"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unselect All</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isFormComplete}
              className={`px-6 py-2.5 font-black rounded-xl text-sm sm:text-base shadow-lg transition flex items-center gap-2 ${
                isFormComplete
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Check className="w-5 h-5 stroke-[3]" /> Save Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

