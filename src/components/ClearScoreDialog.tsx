import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Check, RotateCcw } from 'lucide-react';
import { IndividualGame, MatchPairing, PoolDay } from '../types';

export type ClearScope = 'game' | 'round' | 'match' | 'day' | 'all';

interface ClearScoreDialogProps {
  isOpen: boolean;
  onClose: () => void;
  game?: IndividualGame | null;
  match?: MatchPairing | null;
  day?: PoolDay | null;
  totalCompletedInTournament?: number;
  initialScope?: ClearScope;
  onConfirmClear: (scope: ClearScope, params: {
    gameId?: string;
    matchId?: string;
    roundNumber?: number;
    dayNumber?: number;
  }) => void;
}

export const ClearScoreDialog: React.FC<ClearScoreDialogProps> = ({
  isOpen,
  onClose,
  game,
  match,
  day,
  totalCompletedInTournament = 0,
  initialScope = 'game',
  onConfirmClear,
}) => {
  const [selectedScope, setSelectedScope] = useState<ClearScope>(initialScope);
  const [targetRound, setTargetRound] = useState<number>(game?.roundNumber || 1);

  if (!isOpen) return null;

  // Calculate counts for badges
  const gameCompleted = game?.completed ? 1 : 0;

  const currentMatch = match || (day && game ? day.matches.find(m => m.id === game.matchId) : null);
  const round1Completed = currentMatch
    ? currentMatch.games.filter(g => g.roundNumber === 1 && g.completed).length
    : 0;
  const round2Completed = currentMatch
    ? currentMatch.games.filter(g => g.roundNumber === 2 && g.completed).length
    : 0;
  const matchCompleted = currentMatch
    ? currentMatch.games.filter(g => g.completed).length
    : 0;

  const dayCompleted = day
    ? day.matches.reduce((acc, m) => acc + m.games.filter(g => g.completed).length, 0)
    : 0;

  const handleExecute = () => {
    const params: {
      gameId?: string;
      matchId?: string;
      roundNumber?: number;
      dayNumber?: number;
    } = {};

    if (selectedScope === 'game' && game) {
      params.gameId = game.id;
    } else if (selectedScope === 'round' && currentMatch) {
      params.matchId = currentMatch.id;
      params.roundNumber = targetRound;
    } else if (selectedScope === 'match' && currentMatch) {
      params.matchId = currentMatch.id;
    } else if (selectedScope === 'day' && day) {
      params.dayNumber = day.dayNumber;
    }

    onConfirmClear(selectedScope, params);
    onClose();
  };

  return (
    <div
      id="clear-score-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs"
    >
      <div className="bg-slate-900 border-2 border-rose-600/60 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-2.5 bg-rose-950/80 border border-rose-600/60 rounded-xl text-rose-400 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Clear Scores</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the scope of scores you wish to clear back to unplayed status:
            </p>
          </div>
        </div>

        {/* Scope Options */}
        <div className="space-y-2.5 mb-6">
          {/* OPTION 1: GAME */}
          {game && (
            <label
              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                selectedScope === 'game'
                  ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="clearScope"
                  checked={selectedScope === 'game'}
                  onChange={() => setSelectedScope('game')}
                  className="mt-1 accent-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Clear This Game (Game #{game.gameNumber})</span>
                    {game.completed && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded font-bold">
                        Scored
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {game.homePlayerName} vs {game.awayPlayerName} • Round {game.roundNumber}
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                1 Game
              </span>
            </label>
          )}

          {/* OPTION 2: ROUND */}
          {currentMatch && (
            <div
              onClick={() => setSelectedScope('round')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                selectedScope === 'round'
                  ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="clearScope"
                    checked={selectedScope === 'round'}
                    onChange={() => setSelectedScope('round')}
                    className="mt-1 accent-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <div className="text-sm font-bold text-white">Clear Round Scores</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Reset all games in a specific round of Table {currentMatch.tableNumber}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                  {targetRound === 1 ? `${round1Completed} scored` : `${round2Completed} scored`}
                </span>
              </div>

              {/* Round Selector sub-toggle */}
              <div className="mt-3 ml-7 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScope('round');
                    setTargetRound(1);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition border ${
                    targetRound === 1
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  Round 1 ({round1Completed} scored)
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScope('round');
                    setTargetRound(2);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition border ${
                    targetRound === 2
                      ? 'bg-rose-600 text-white border-rose-400'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  Round 2 ({round2Completed} scored)
                </button>
              </div>
            </div>
          )}

          {/* OPTION 3: MATCH */}
          {currentMatch && (
            <label
              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                selectedScope === 'match'
                  ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="clearScope"
                  checked={selectedScope === 'match'}
                  onChange={() => setSelectedScope('match')}
                  className="mt-1 accent-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-white">
                    Clear Entire Match (Table {currentMatch.tableNumber})
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Reset both Round 1 & Round 2 ({matchCompleted} of {currentMatch.games.length} games scored)
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                {matchCompleted} Scored
              </span>
            </label>
          )}

          {/* OPTION 4: DAY */}
          {day && (
            <label
              className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
                selectedScope === 'day'
                  ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
                  : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="clearScope"
                  checked={selectedScope === 'day'}
                  onChange={() => setSelectedScope('day')}
                  className="mt-1 accent-rose-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="text-sm font-bold text-white">
                    Clear All Day {day.dayNumber} Scores ({day.dateString})
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Reset all matches and games scheduled for this day
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                {dayCompleted} Scored
              </span>
            </label>
          )}

          {/* OPTION 5: ALL TOURNAMENT */}
          <label
            className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition select-none ${
              selectedScope === 'all'
                ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-950/40'
                : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="clearScope"
                checked={selectedScope === 'all'}
                onChange={() => setSelectedScope('all')}
                className="mt-1 accent-rose-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <div className="text-sm font-bold text-rose-300">
                  Clear All League Scores (All Days)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Reset every completed game across the entire tournament
                </div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800">
              {totalCompletedInTournament} Total Scored
            </span>
          </label>
        </div>

        {/* Warning Note */}
        <div className="mb-6 p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl flex items-center gap-2.5 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            This action resets the selected scores to unplayed. Team standings and player stats will automatically recalculate.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecute}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-rose-950 transition flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {selectedScope === 'game'
                ? 'Clear Game Score'
                : selectedScope === 'round'
                ? `Clear Round ${targetRound} Scores`
                : selectedScope === 'match'
                ? 'Clear Match Scores'
                : selectedScope === 'day'
                ? 'Clear Day Scores'
                : 'Clear All Scores'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
