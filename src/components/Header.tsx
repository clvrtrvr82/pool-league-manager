import React, { useRef } from 'react';
import {
  PlusCircle,
  FolderOpen,
  Save,
  Monitor,
  Calendar,
  BarChart3,
  Trophy,
  Users,
  CheckCircle2,
  Sparkles,
  Database,
  Cloud,
} from 'lucide-react';
import { TournamentData } from '../types';
import { ServerDBStatus } from '../utils/storage';

interface HeaderProps {
  tournament: TournamentData;
  activeTab: 'schedule' | 'stats' | 'standings' | 'teams';
  serverStatus?: ServerDBStatus | null;
  onTabChange: (tab: 'schedule' | 'stats' | 'standings' | 'teams') => void;
  onOpenNewWizard: () => void;
  onSaveToComputer: () => void;
  onOpenFromFile: (file: File) => void;
  onOpenInstallModal: () => void;
  onOpenRailwayModal?: () => void;
  onLoadSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  tournament,
  activeTab,
  serverStatus,
  onTabChange,
  onOpenNewWizard,
  onSaveToComputer,
  onOpenFromFile,
  onOpenInstallModal,
  onOpenRailwayModal,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onOpenFromFile(file);
    }
    // reset
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & League Name */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/60 p-1 flex items-center justify-center shadow-md shadow-emerald-950/60">
                <img src="/icon.svg" alt="Pool League" className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
                  {tournament.config.name}
                </h1>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Auto-saved
                  </span>
                  <span>•</span>
                  {serverStatus?.type === 'postgres' && serverStatus.connected ? (
                    <button
                      onClick={onOpenRailwayModal}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-semibold hover:bg-emerald-900 transition"
                      title={serverStatus.message}
                    >
                      <Database className="w-3 h-3 text-emerald-400" /> PostgreSQL (Railway)
                    </button>
                  ) : (
                    <button
                      onClick={onOpenRailwayModal}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium hover:bg-slate-700 transition"
                      title={serverStatus?.message || 'Local Storage'}
                    >
                      <Database className="w-3 h-3 text-cyan-400" /> Local DB
                    </button>
                  )}
                  <span>•</span>
                  <span>{tournament.teams.length} Teams</span>
                  <span>•</span>
                  <span>{tournament.config.totalPoolDays} Weeks</span>
                </div>
              </div>
            </div>

            {/* Quick Desktop shortcut button on small screens */}
            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={onOpenRailwayModal}
                className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300 text-xs font-bold"
                title="Railway & GitHub Setup"
              >
                <Cloud className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenInstallModal}
                className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold"
                title="Desktop App Installation"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons: New, Save to Computer, Open from Computer, Desktop App, Railway */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={onOpenRailwayModal}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border border-purple-500/50 font-bold rounded-xl text-xs sm:text-sm shadow-md transition"
              title="Deploy to Railway with PostgreSQL database and GitHub"
            >
              <Cloud className="w-4 h-4 text-purple-400" /> Deploy Railway &amp; DB
            </button>

            <button
              onClick={onOpenNewWizard}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition"
              title="Create a new pool league tournament"
            >
              <PlusCircle className="w-4 h-4" /> New Tournament
            </button>

            <button
              onClick={onSaveToComputer}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs sm:text-sm transition"
              title="Save current tournament file to your computer"
            >
              <Save className="w-4 h-4 text-emerald-400" /> Save to Computer
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs sm:text-sm transition"
              title="Open a saved tournament file (.json) from your computer"
            >
              <FolderOpen className="w-4 h-4 text-teal-400" /> Open Saved...
            </button>

            <button
              onClick={onOpenInstallModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition"
              title="Setup desktop icon to double-click and run"
            >
              <Monitor className="w-4 h-4 text-emerald-400" /> Desktop Icon
            </button>

            <button
              onClick={onLoadSample}
              className="flex items-center gap-1 px-2.5 py-2 text-slate-400 hover:text-emerald-300 text-xs font-semibold"
              title="Load demo league to test features"
            >
              <Sparkles className="w-3.5 h-3.5" /> Demo
            </button>
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <nav className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => onTabChange('schedule')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === 'schedule'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Schedule &amp; Scores
          </button>

          <button
            onClick={() => onTabChange('stats')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === 'stats'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Player Stats &amp; Handicaps
          </button>

          <button
            onClick={() => onTabChange('standings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === 'standings'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" /> Team Standings
          </button>

          <button
            onClick={() => onTabChange('teams')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition ${
              activeTab === 'teams'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Teams &amp; Rosters
          </button>
        </nav>
      </div>
    </header>
  );
};
