import React from 'react';
import {
  Calendar,
  Zap,
  Trophy,
  BarChart3,
  Users,
  Printer,
  Smartphone,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface QuickJumpNavProps {
  activeTab: 'schedule' | 'stats' | 'standings' | 'teams';
  onTabChange: (tab: 'schedule' | 'stats' | 'standings' | 'teams') => void;
  onOpenNextGameScore?: () => void;
  onPrintCurrentDay: () => void;
  onOpenInstallModal: () => void;
  isInstallable?: boolean;
  onInstall?: () => void;
  unscoredGamesCount?: number;
}

export const QuickJumpNav: React.FC<QuickJumpNavProps> = ({
  activeTab,
  onTabChange,
  onOpenNextGameScore,
  onPrintCurrentDay,
  onOpenInstallModal,
  isInstallable,
  onInstall,
  unscoredGamesCount = 0,
}) => {
  return (
    <div
      id="quick-jump-nav"
      className="bg-slate-900/95 border-b border-slate-800/90 py-2.5 px-4 sm:px-6 shadow-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Quick Launch label */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-700/60 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Quick Jump
          </span>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium">
            Where do you need to go?
          </span>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
          {/* 1. Enter Next Score */}
          {onOpenNextGameScore && unscoredGamesCount > 0 && (
            <button
              onClick={onOpenNextGameScore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md transition animate-pulse"
              title="Jump straight to the next unscored game and open score entry"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Score Next Game</span>
              <span className="bg-slate-950/80 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unscoredGamesCount} left
              </span>
            </button>
          )}

          {/* 2. Today's Matches / Schedule */}
          <button
            onClick={() => onTabChange('schedule')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition ${
              activeTab === 'schedule'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80'
            }`}
            title="Go to Schedule & Matches"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today&apos;s Games</span>
          </button>

          {/* 3. Standings */}
          <button
            onClick={() => onTabChange('standings')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition ${
              activeTab === 'standings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80'
            }`}
            title="Go to Team Standings"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Standings</span>
          </button>

          {/* 4. Player Stats & Handicaps */}
          <button
            onClick={() => onTabChange('stats')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition ${
              activeTab === 'stats'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80'
            }`}
            title="Go to Player Handicaps & Stats"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Handicaps &amp; Stats</span>
          </button>

          {/* 5. Team Rosters */}
          <button
            onClick={() => onTabChange('teams')}
            className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition ${
              activeTab === 'teams'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80'
            }`}
            title="Go to Teams & Rosters"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rosters</span>
          </button>

          {/* 6. Print Scoresheet */}
          <button
            onClick={onPrintCurrentDay}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition"
            title="Print paper scoresheet for clipboards"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Print Sheet</span>
          </button>

          {/* 7. Portable App / Install Shortcut */}
          <button
            onClick={isInstallable && onInstall ? onInstall : onOpenInstallModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/70 font-bold transition shadow-xs"
            title="Install as a standalone portable app icon on your device"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-extrabold">Portable App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
