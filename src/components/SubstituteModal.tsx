import React, { useState } from 'react';
import { UserCheck, X, Check, RotateCcw } from 'lucide-react';
import { IndividualGame, TournamentData } from '../types';

interface SubstituteModalProps {
  isOpen: boolean;
  game: IndividualGame | null;
  side: 'home' | 'away';
  tournament: TournamentData;
  onClose: () => void;
  onApplySub: (
    gameId: string,
    side: 'home' | 'away',
    subName: string,
    applyToAllTonight: boolean
  ) => void;
  onRevertSub: (gameId: string, side: 'home' | 'away', applyToAllTonight: boolean) => void;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({
  isOpen,
  game,
  side,
  tournament,
  onClose,
  onApplySub,
  onRevertSub,
}) => {
  const [subName, setSubName] = useState('');
  const [applyToAllTonight, setApplyToAllTonight] = useState(true);

  if (!isOpen || !game) return null;

  const isHome = side === 'home';
  const playerId = isHome ? game.homePlayerId : game.awayPlayerId;
  const currentDisplayName = isHome ? game.homePlayerName : game.awayPlayerName;
  const isCurrentlySub = isHome ? game.homeIsSub : game.awayIsSub;

  // Find original player object
  const originalPlayer = tournament.teams
    .flatMap((t) => t.players)
    .find((p) => p.id === playerId || p.id === (isHome ? game.homeScore?.substituteForId : game.awayScore?.substituteForId));

  const originalName = originalPlayer ? originalPlayer.name : currentDisplayName;

  // List existing known subs in tournament for quick selection
  const previousSubNames = Array.from(
    new Set(tournament.substitutes.map((s) => s.subName).filter(Boolean))
  );

  const handleSave = () => {
    if (!subName.trim()) return;
    onApplySub(game.id, side, subName.trim(), applyToAllTonight);
    setSubName('');
    onClose();
  };

  const handleRevert = () => {
    onRevertSub(game.id, side, applyToAllTonight);
    onClose();
  };

  return (
    <div id="substitute-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-xs">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-950/70 border border-amber-500/50 rounded-xl text-amber-400">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Player Substitution</h2>
            <p className="text-xs text-slate-400">
              Roster: <strong className="text-amber-300">{originalName}</strong>
            </p>
          </div>
        </div>

        {isCurrentlySub && (
          <div className="mb-4 p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-amber-400 font-bold">Currently Substituted:</span>
              <span className="text-white ml-1.5 font-medium">{currentDisplayName}</span>
            </div>
            <button
              onClick={handleRevert}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-700/50 rounded-lg font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Revert to {originalName}
            </button>
          </div>
        )}

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-1.5">
              Enter Substitute Player Name
            </label>
            <input
              type="text"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
              placeholder="e.g. Gary Miller"
              className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-base text-white font-medium outline-hidden"
              autoFocus
            />
          </div>

          {/* Quick select previous subs if any */}
          {previousSubNames.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 mb-1.5">Or choose from previous league subs:</div>
              <div className="flex flex-wrap gap-1.5">
                {previousSubNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSubName(name)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scope option */}
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 font-medium">
              <input
                type="radio"
                name="subScope"
                checked={applyToAllTonight}
                onChange={() => setApplyToAllTonight(true)}
                className="w-4 h-4 text-amber-500 focus:ring-amber-400"
              />
              <span>Substitute for <strong>ALL games tonight</strong> in this matchup (Recommended)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200 font-medium">
              <input
                type="radio"
                name="subScope"
                checked={!applyToAllTonight}
                onChange={() => setApplyToAllTonight(false)}
                className="w-4 h-4 text-amber-500 focus:ring-amber-400"
              />
              <span>Substitute for <strong>this single game only</strong> (Game {game.gameNumber})</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!subName.trim()}
            onClick={handleSave}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black rounded-xl text-sm shadow-md transition flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" /> Confirm Substitute
          </button>
        </div>
      </div>
    </div>
  );
};
