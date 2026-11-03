import React, { useState, useMemo } from 'react';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Search,
  ArrowUpDown,
  Calendar,
  Award,
  BarChart3,
  Info,
  Shield,
  Target,
  Flame,
  Zap,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PlayerStats, TournamentData } from '../types';
import { computeAllPlayerStats, computeLeagueOverview } from '../utils/stats';
import { LeagueOverviewPanel } from './LeagueOverviewPanel';
import { HandicapFormulaModal } from './HandicapFormulaModal';
import { PlayerDetailModal } from './PlayerDetailModal';
import { StreakBadge } from './StreakBadge';

interface StatsDashboardProps {
  tournament: TournamentData;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ tournament }) => {
  // Tabs: 'players' (default player leaderboard), 'leaders' (billiards category leaders), 'weekly' (progression), 'league' (team benchmarks)
  const [activeTab, setActiveTab] = useState<'players' | 'leaders' | 'weekly' | 'league'>('players');
  const [viewMode, setViewMode] = useState<'standard' | 'advanced'>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [streakFilter, setStreakFilter] = useState<'ALL' | 'HOT' | 'WIN' | 'LOSS'>('ALL');
  const [sortField, setSortField] = useState<keyof PlayerStats>('totalScore');
  const [sortAsc, setSortAsc] = useState(false);
  
  // Modals state
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<PlayerStats | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedHandicapPlayer, setSelectedHandicapPlayer] = useState<PlayerStats | null>(null);
  const [isHandicapModalOpen, setIsHandicapModalOpen] = useState(false);

  const stats = useMemo(() => computeAllPlayerStats(tournament), [tournament]);
  const leagueOverview = useMemo(() => computeLeagueOverview(tournament), [tournament]);

  const handleOpenDetailModal = (player: PlayerStats) => {
    setSelectedPlayerForDetail(player);
    setIsDetailModalOpen(true);
  };

  const handleOpenHandicapModal = (player: PlayerStats | null) => {
    setSelectedHandicapPlayer(player);
    setIsHandicapModalOpen(true);
  };

  // Filter and sort stats
  const filteredStats = useMemo(() => {
    return stats
      .filter((p) => {
        const matchesSearch =
          p.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.teamName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTeam = selectedTeamFilter === 'ALL' || p.teamId === selectedTeamFilter;
        const matchesStreak =
          streakFilter === 'ALL' ||
          (streakFilter === 'HOT' && p.currentStreak.type === 'W' && p.currentStreak.count >= 3) ||
          (streakFilter === 'WIN' && p.currentStreak.type === 'W') ||
          (streakFilter === 'LOSS' && p.currentStreak.type === 'L');
        return matchesSearch && matchesTeam && matchesStreak;
      })
      .sort((a, b) => {
        if (sortField === 'currentStreak') {
          const scoreA =
            a.currentStreak.type === 'W'
              ? a.currentStreak.count
              : a.currentStreak.type === 'L'
              ? -a.currentStreak.count
              : 0;
          const scoreB =
            b.currentStreak.type === 'W'
              ? b.currentStreak.count
              : b.currentStreak.type === 'L'
              ? -b.currentStreak.count
              : 0;
          return sortAsc ? scoreA - scoreB : scoreB - scoreA;
        }
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
  }, [stats, searchQuery, selectedTeamFilter, streakFilter, sortField, sortAsc]);

  const handleSort = (field: keyof PlayerStats) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Billiards Category Standouts
  const topScorer = stats.length > 0 ? stats[0] : null;
  const topAverage = useMemo(() => {
    return [...stats]
      .filter((p) => p.gamesPlayed >= 2)
      .sort((a, b) => b.averageScore - a.averageScore)[0] || stats[0];
  }, [stats]);
  const topGwp = useMemo(() => {
    return [...stats]
      .filter((p) => p.gamesPlayed >= 2)
      .sort((a, b) => b.gwp - a.gwp)[0] || stats[0];
  }, [stats]);
  const topCloser = useMemo(() => {
    return [...stats]
      .filter((p) => p.eightBallsSunk > 0)
      .sort((a, b) => b.eightBallsSunk - a.eightBallsSunk)[0] || null;
  }, [stats]);
  const topDefense = useMemo(() => {
    return [...stats]
      .filter((p) => p.gamesPlayed >= 2)
      .sort((a, b) => a.opponentAverageScore - b.opponentAverageScore)[0] || null;
  }, [stats]);
  const topStreak = useMemo(() => {
    return [...stats]
      .filter((p) => p.longestWinStreak > 0)
      .sort((a, b) => b.longestWinStreak - a.longestWinStreak)[0] || null;
  }, [stats]);

  const weeksList = tournament.days.map((d) => d.dayNumber);

  return (
    <div id="stats-dashboard" className="space-y-6">
      {/* Top Billiards Highlights Ribbon (Player-Focused) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Points MVP */}
        <div
          onClick={() => topScorer && handleOpenDetailModal(topScorer)}
          className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl cursor-pointer hover:border-amber-500/60 transition shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Points Leader</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-white truncate">
              {topScorer ? topScorer.playerName : '—'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {topScorer ? topScorer.teamName : ''}
            </div>
          </div>
          <div className="text-xs font-black text-amber-400">
            {topScorer ? `${topScorer.totalScore} Pts` : '0'}
          </div>
        </div>

        {/* Card 2: Highest PPG (Marksman) */}
        <div
          onClick={() => topAverage && handleOpenDetailModal(topAverage)}
          className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl cursor-pointer hover:border-emerald-500/60 transition shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Scoring Avg</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-white truncate">
              {topAverage ? topAverage.playerName : '—'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {topAverage ? topAverage.teamName : ''}
            </div>
          </div>
          <div className="text-xs font-black text-emerald-400">
            {topAverage ? `${topAverage.averageScore.toFixed(1)} PPG` : '0'}
          </div>
        </div>

        {/* Card 3: Win % (GWP) */}
        <div
          onClick={() => topGwp && handleOpenDetailModal(topGwp)}
          className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl cursor-pointer hover:border-teal-500/60 transition shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Win Rate</span>
            <Award className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-white truncate">
              {topGwp ? topGwp.playerName : '—'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {topGwp ? topGwp.teamName : ''}
            </div>
          </div>
          <div className="text-xs font-black text-teal-400">
            {topGwp ? `${topGwp.gwp}% GWP` : '0%'}
          </div>
        </div>

        {/* Card 4: 8-Balls Sunk (Closers) */}
        <div
          onClick={() => topCloser && handleOpenDetailModal(topCloser)}
          className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl cursor-pointer hover:border-indigo-500/60 transition shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">8-Ball Closer</span>
            <span className="text-xs">🎱</span>
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-white truncate">
              {topCloser ? topCloser.playerName : '—'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {topCloser ? topCloser.teamName : ''}
            </div>
          </div>
          <div className="text-xs font-black text-indigo-300">
            {topCloser ? `${topCloser.eightBallsSunk} Sunk (${topCloser.eightBallRate}%)` : '0'}
          </div>
        </div>

        {/* Card 5: Lockdown Defense (Opp PPG) */}
        <div
          onClick={() => topDefense && handleOpenDetailModal(topDefense)}
          className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl cursor-pointer hover:border-emerald-500/60 transition shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Defense</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-white truncate">
              {topDefense ? topDefense.playerName : '—'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {topDefense ? topDefense.teamName : ''}
            </div>
          </div>
          <div className="text-xs font-black text-emerald-400">
            {topDefense ? `${topDefense.opponentAverageScore.toFixed(1)} Opp PPG` : '0'}
          </div>
        </div>

        {/* Card 6: Hot Hand / Win Streak */}
        <div
          onClick={() => topStreak && handleOpenDetailModal(topStreak)}
          className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl cursor-pointer hover:border-rose-500/60 transition shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Best Streak</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="my-1">
            <div className="text-sm font-black text-white truncate">
              {topStreak ? topStreak.playerName : '—'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {topStreak ? topStreak.teamName : ''}
            </div>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs font-black text-rose-400">
              {topStreak ? `🔥 ${topStreak.longestWinStreak} in a row` : '0'}
            </span>
            {topStreak && (
              <StreakBadge currentStreak={topStreak.currentStreak} size="xs" />
            )}
          </div>
        </div>
      </div>

      {/* Main Controls Card */}
      <div className="bg-slate-800/90 border border-slate-700 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Main 4 Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'players'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Player Statistics
            </button>
            <button
              onClick={() => setActiveTab('leaders')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'leaders'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" /> Billiards Leaders
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'weekly'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" /> Weekly Progression
            </button>
            <button
              onClick={() => setActiveTab('league')}
              className={`px-3.5 py-2 rounded-lg font-bold text-xs sm:text-sm transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'league'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" /> Team Benchmarks
            </button>
          </div>

          {/* Right Action: Handicap Explainer */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => handleOpenHandicapModal(null)}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 font-bold cursor-pointer transition"
            >
              <HelpCircle className="w-4 h-4" /> Handicap Formula Guide
            </button>
          </div>
        </div>

        {/* Filter Bar (for player tables) */}
        {(activeTab === 'players' || activeTab === 'weekly') && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search player name or team..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white outline-hidden"
                />
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">Filter Team:</span>
                <select
                  value={selectedTeamFilter}
                  onChange={(e) => setSelectedTeamFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 outline-hidden font-medium cursor-pointer"
                >
                  <option value="ALL">All Teams ({tournament.teams.length})</option>
                  {tournament.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Mode Switch (Standard Billiards vs Advanced Matrix) in Players tab */}
            {activeTab === 'players' && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode('standard')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'standard'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard Stats
                </button>
                <button
                  onClick={() => setViewMode('advanced')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    viewMode === 'advanced'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/50 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Advanced Billiards Matrix
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: PLAYER STATISTICS & BILLIARDS MATRIX (DEFAULT) */}
      {activeTab === 'players' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-900/60 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Player Leaderboard &amp; Billiards Metrics</span>
                <span className="text-xs font-normal text-slate-400">
                  ({filteredStats.length} players shown)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click on any player row to open their full billiards card, game history, and head-to-head records.
              </p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-3">
              <span>Sort by: <strong className="text-emerald-400">{String(sortField)}</strong> ({sortAsc ? 'Asc' : 'Desc'})</span>
            </div>
          </div>

          {/* Trend & Streak Legend + Quick Filter Toolbar */}
          <div className="px-4 py-2.5 bg-slate-850/90 border-b border-slate-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-300">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Streak Trends:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[10px] shadow-xs">
                <Flame className="w-2.5 h-2.5" /> Hot (4+ W)
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/70 font-bold text-[10px]">
                <TrendingUp className="w-2.5 h-2.5" /> Win (1-3 W)
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-700/70 font-bold text-[10px]">
                <TrendingDown className="w-2.5 h-2.5" /> Loss (1-2 L)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/95 text-rose-200 border border-rose-500 font-black text-[10px] shadow-xs">
                ❄️ Slump (3+ L)
              </span>
              <span className="text-[10px] text-slate-500 hidden lg:inline">
                • Color-coded dots show last 3–5 racks (hover for details)
              </span>
            </div>

            {/* Quick Trend Filter Chips */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] text-slate-400 font-semibold">Filter:</span>
              <button
                onClick={() => setStreakFilter('ALL')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  streakFilter === 'ALL'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStreakFilter('HOT')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-black transition cursor-pointer flex items-center gap-1 ${
                  streakFilter === 'HOT'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                    : 'text-emerald-400 hover:text-emerald-300 bg-slate-900 border border-emerald-800/80'
                }`}
              >
                <Flame className="w-3 h-3" /> Hot (3+ W)
              </button>
              <button
                onClick={() => setStreakFilter('WIN')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  streakFilter === 'WIN'
                    ? 'bg-emerald-800 text-emerald-100 shadow-xs'
                    : 'text-emerald-300 hover:text-white bg-slate-900 border border-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Winning
              </button>
              <button
                onClick={() => setStreakFilter('LOSS')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  streakFilter === 'LOSS'
                    ? 'bg-rose-900 text-rose-100 shadow-xs'
                    : 'text-rose-400 hover:text-white bg-slate-900 border border-slate-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> In Slump
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-3 sm:px-4 text-center">Rank</th>
                  <th
                    onClick={() => handleSort('playerName')}
                    className="py-3 px-3 sm:px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Player</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('teamName')}
                    className="py-3 px-3 sm:px-4 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>Team</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('handicap')}
                    className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>HCP</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('gamesPlayed')}
                    className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>GP</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>

                  {viewMode === 'standard' ? (
                    <>
                      <th
                        onClick={() => handleSort('gamesWon')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>W-L</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('gwp')}
                        className="py-3 px-2 sm:px-3 text-right cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Win %</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('totalScore')}
                        className="py-3 px-2 sm:px-3 text-right cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Pts</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('averageScore')}
                        className="py-3 px-2 sm:px-3 text-right cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>PPG</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('eightBallsSunk')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>8-Balls</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('pointDifferential')}
                        className="py-3 px-2 sm:px-3 text-right cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>+/- Diff</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('powerRating')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Power</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('currentStreak')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Streak &amp; Form</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    </>
                  ) : (
                    <>
                      <th
                        onClick={() => handleSort('perfectTens')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>10s</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('shutoutsDelivered')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>10-0 Sweeps</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('opponentAverageScore')}
                        className="py-3 px-2 sm:px-3 text-right cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-end gap-1">
                          <span>Opp PPG</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('homeWinRate')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Break W%</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('awayWinRate')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Away W%</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('longestWinStreak')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Best Streak</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('currentStreak')}
                        className="py-3 px-2 sm:px-3 text-center cursor-pointer hover:text-white"
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span>Streak &amp; Form</span>
                          <ArrowUpDown className="w-3 h-3" />
                        </div>
                      </th>
                    </>
                  )}
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {filteredStats.map((p, index) => (
                  <tr
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="hover:bg-slate-750/70 transition cursor-pointer group"
                  >
                    <td className="py-3 px-3 sm:px-4 text-center font-bold">
                      {index === 0 ? (
                        <span className="text-amber-400 font-black">#1 👑</span>
                      ) : index === 1 ? (
                        <span className="text-slate-300 font-black">#2 🥈</span>
                      ) : index === 2 ? (
                        <span className="text-amber-500 font-black">#3 🥉</span>
                      ) : (
                        <span className="text-slate-500">#{index + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-1.5">
                        <span>{p.playerName}</span>
                        {p.isCaptain && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-black px-1.5 py-0.5 rounded-sm border border-amber-500/30">
                            CPT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-slate-400 text-xs truncate max-w-[120px]">
                      {p.teamName}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenHandicapModal(p);
                        }}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 hover:text-white hover:bg-emerald-800 font-black text-xs transition cursor-pointer"
                        title={`Handicap ${p.handicap} - Click for formula`}
                      >
                        {p.handicap}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center text-slate-300 font-semibold">
                      {p.gamesPlayed}
                    </td>

                    {viewMode === 'standard' ? (
                      <>
                        <td className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                          <span className="text-emerald-400 font-bold">{p.gamesWon}</span>
                          <span className="text-slate-500 text-xs"> - </span>
                          <span className="text-slate-400">{p.gamesLost}</span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-right font-bold text-teal-300">
                          {p.gwp}%
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-right font-black text-amber-400 text-sm sm:text-base">
                          {p.totalScore}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-right font-black text-white text-sm sm:text-base">
                          {p.averageScore.toFixed(1)}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-indigo-300">
                            🎱 {p.eightBallsSunk}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-right font-bold whitespace-nowrap">
                          <span
                            className={
                              p.pointDifferential > 0
                                ? 'text-emerald-400'
                                : p.pointDifferential === 0
                                ? 'text-slate-400'
                                : 'text-rose-400'
                            }
                          >
                            {p.pointDifferential > 0 ? `+${p.pointDifferential}` : p.pointDifferential}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-teal-300 font-black text-xs">
                            {p.powerRating}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                          <StreakBadge
                            currentStreak={p.currentStreak}
                            longestWinStreak={p.longestWinStreak}
                            gameLog={p.gameLog}
                            showTrend={true}
                            maxTrendCount={4}
                            size="sm"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold text-amber-300">
                          🌟 {p.perfectTens}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold text-teal-300">
                          ⚡ {p.shutoutsDelivered}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-right font-bold text-slate-200">
                          🛡️ {p.opponentAverageScore.toFixed(1)}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold text-emerald-400">
                          {p.homeWinRate}%
                          <span className="text-[10px] text-slate-500 block">({p.homeGamesWon}W)</span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold text-slate-300">
                          {p.awayWinRate}%
                          <span className="text-[10px] text-slate-500 block">({p.awayGamesWon}W)</span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-bold">
                          <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-950/60 border border-amber-600/50 px-2 py-0.5 rounded-md text-xs font-black">
                            🔥 {p.longestWinStreak} W
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center whitespace-nowrap">
                          <StreakBadge
                            currentStreak={p.currentStreak}
                            longestWinStreak={p.longestWinStreak}
                            gameLog={p.gameLog}
                            showTrend={true}
                            maxTrendCount={5}
                            size="sm"
                            showLabel={true}
                          />
                        </td>
                      </>
                    )}

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailModal(p);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-700/80 rounded-lg transition cursor-pointer"
                        title={`View full billiards details for ${p.playerName}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BILLIARDS CATEGORY LEADERS */}
      {activeTab === 'leaders' && (
        <div className="space-y-6">
          <div className="bg-slate-800/90 border border-slate-700 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">Billiards Honors &amp; Leaderboards</h3>
            </div>
            <p className="text-xs text-slate-400">
              Honoring league standout players across key offensive, defensive, and clutch disciplines. Click on any player card to view their complete performance record.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category 1: Scoring Champion */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 text-sm">
                  <Trophy className="w-4 h-4" />
                  <span>Total Points</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Points MVP</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.topScorers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-amber-400 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <span className="font-black text-amber-400 text-xs sm:text-sm pl-2">
                      {p.totalScore} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 2: Scoring Average (PPG) */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Scoring Avg (PPG)</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Marksman</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.topAverageScorers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-emerald-400 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <span className="font-black text-emerald-400 text-xs sm:text-sm pl-2">
                      {p.averageScore.toFixed(2)} PPG
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 3: 8-Ball Closers */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-indigo-300 text-sm">
                  <span>🎱 8-Ball Closers</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Finisher</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.top8BallClosers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-indigo-300 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <span className="font-black text-indigo-300 text-xs sm:text-sm pl-2">
                      🎱 {p.eightBallsSunk} ({p.eightBallRate}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 4: Win Percentage (GWP) */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-teal-400 text-sm">
                  <Award className="w-4 h-4" />
                  <span>Win Rate (GWP)</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Consistency</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.topWinPctPlayers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-teal-400 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <span className="font-black text-teal-400 text-xs sm:text-sm pl-2">
                      {p.gwp}% ({p.gamesWon}W)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 5: Clean Sweepers (Perfect 10s & Shutouts) */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>10s &amp; Shutouts</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Clean Sweep</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.topShutoutPlayers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-amber-300 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <span className="font-bold text-amber-300 text-xs pl-2">
                      🌟 {p.perfectTens} | ⚡ {p.shutoutsDelivered}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 6: Lockdown Defense (Opponent PPG) */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Lockdown Defense</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Lowest Opp PPG</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.topDefensivePlayers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-emerald-400 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400 text-xs pl-2">
                      🛡️ {p.opponentAverageScore.toFixed(2)} allowed
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 7: Net Point Differential (+/-) */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-teal-300 text-sm">
                  <BarChart3 className="w-4 h-4" />
                  <span>Net Margin (+/-)</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Run Differential</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.topDifferentialPlayers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-teal-300 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <span className="font-black text-emerald-400 text-xs sm:text-sm pl-2">
                      {p.pointDifferential >= 0 ? `+${p.pointDifferential}` : p.pointDifferential} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category 8: Win Streaks */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 text-sm">
                  <Flame className="w-4 h-4" />
                  <span>Win Streaks</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Hot Hands</span>
              </div>
              <div className="space-y-2">
                {leagueOverview.topStreakPlayers.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.playerId}
                    onClick={() => handleOpenDetailModal(p)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-750 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-rose-400 w-4">#{idx + 1}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate">{p.playerName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.teamName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-400 text-xs sm:text-sm pl-2 whitespace-nowrap">
                        🔥 {p.longestWinStreak} Ws
                      </span>
                      <StreakBadge currentStreak={p.currentStreak} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY AVERAGE SCORE AND HANDICAP FOR EACH WEEK */}
      {activeTab === 'weekly' && (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl p-4 sm:p-5">
          <div className="mb-3">
            <h3 className="text-lg font-black text-white">
              Weekly Progression: Player Average Score &amp; Handicap
            </h3>
            <p className="text-xs text-slate-400">
              Tracks each player&apos;s cumulative average score (pts/game) and evolving handicap after each pool day. Click on any player name to inspect their full billiards card.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="py-3 px-3">Player</th>
                  <th className="py-3 px-3">Team</th>
                  {weeksList.map((week) => (
                    <th key={week} className="py-3 px-3 text-center border-l border-slate-800">
                      Week {week}
                      <span className="block text-[9px] text-slate-500 font-normal">Avg / HCP</span>
                    </th>
                  ))}
                  <th className="py-3 px-3 text-center border-l border-slate-700 bg-emerald-950/40 text-emerald-300">
                    Current
                    <span className="block text-[9px] text-emerald-400 font-normal">Avg / HCP</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredStats.map((player) => (
                  <tr
                    key={player.playerId}
                    onClick={() => handleOpenDetailModal(player)}
                    className="hover:bg-slate-750/70 transition cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-bold text-white hover:text-emerald-300 whitespace-nowrap">
                      {player.playerName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{player.teamName}</td>
                    {weeksList.map((weekNum) => {
                      const weekEntry = player.weeklyStats.find((w) => w.week === weekNum);
                      const hasPlayed = weekEntry && weekEntry.cumulativeAverage > 0;
                      return (
                        <td
                          key={weekNum}
                          className="py-2.5 px-3 text-center border-l border-slate-800 whitespace-nowrap"
                        >
                          {hasPlayed ? (
                            <div className="inline-flex items-center gap-1 font-bold">
                              <span className="text-slate-200">{weekEntry.cumulativeAverage.toFixed(1)}</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1 py-0.5 rounded border border-emerald-800">
                                H{weekEntry.cumulativeHandicap}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-center border-l border-slate-700 bg-emerald-950/30 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-black text-white">
                        <span className="text-sm text-emerald-400">{player.averageScore.toFixed(1)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenHandicapModal(player);
                          }}
                          className="w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-black flex items-center justify-center transition cursor-pointer shadow-xs"
                          title={`Click to view formula breakdown for ${player.playerName}`}
                        >
                          {player.handicap}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenHandicapModal(player);
                          }}
                          className="p-0.5 text-slate-400 hover:text-emerald-300 transition cursor-pointer"
                          title={`Explain formula for ${player.playerName}`}
                          aria-label={`Explain formula for ${player.playerName}`}
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LEAGUE & TEAM BENCHMARKS */}
      {activeTab === 'league' && (
        <LeagueOverviewPanel
          overview={leagueOverview}
          onSelectTeam={(teamId) => {
            setSelectedTeamFilter(teamId);
            setActiveTab('players');
          }}
          onSelectPlayer={(player) => {
            handleOpenDetailModal(player);
          }}
        />
      )}

      {/* Dedicated Player Billiards Profile & Rack History Modal */}
      <PlayerDetailModal
        player={selectedPlayerForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenHandicapModal={(p) => {
          setIsDetailModalOpen(false);
          handleOpenHandicapModal(p);
        }}
      />

      {/* Handicap Formula Modal */}
      <HandicapFormulaModal
        isOpen={isHandicapModalOpen}
        player={selectedHandicapPlayer}
        onClose={() => setIsHandicapModalOpen(false)}
      />
    </div>
  );
};
