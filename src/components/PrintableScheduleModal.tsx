import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  Calendar,
  Filter,
  CheckSquare,
  Square,
  Users,
  Layers,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  Trophy,
} from 'lucide-react';
import { TournamentData, MatchPairing, PoolDay } from '../types';

interface PrintableScheduleModalProps {
  isOpen: boolean;
  tournament: TournamentData;
  onClose: () => void;
  initialDayNumber?: number;
}

export const PrintableScheduleModal: React.FC<PrintableScheduleModalProps> = ({
  isOpen,
  tournament,
  onClose,
  initialDayNumber,
}) => {
  const { days, teams, config } = tournament;

  // Filter States
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [groupMode, setGroupMode] = useState<'byDay' | 'byTeam'>('byDay');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [detailLevel, setDetailLevel] = useState<'summary' | 'detailed'>('summary');

  // Multi-day selection state (defaults to all days)
  const [selectedDayNumbers, setSelectedDayNumbers] = useState<number[]>(() =>
    days.map((d) => d.dayNumber)
  );

  // Helper to retrieve team
  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  // Quick Day Selection Handlers
  const handleSelectAllDays = () => {
    setSelectedDayNumbers(days.map((d) => d.dayNumber));
  };

  const handleSelectOnlyCurrentDay = () => {
    if (initialDayNumber) {
      setSelectedDayNumbers([initialDayNumber]);
    } else if (days.length > 0) {
      setSelectedDayNumbers([days[0].dayNumber]);
    }
  };

  const handleSelectUpcomingDays = () => {
    const upcoming = days.filter((d) => !d.isCompleted).map((d) => d.dayNumber);
    setSelectedDayNumbers(upcoming.length > 0 ? upcoming : days.map((d) => d.dayNumber));
  };

  const handleClearDays = () => {
    setSelectedDayNumbers([]);
  };

  const toggleDaySelection = (dayNum: number) => {
    setSelectedDayNumbers((prev) =>
      prev.includes(dayNum) ? prev.filter((n) => n !== dayNum) : [...prev, dayNum].sort((a, b) => a - b)
    );
  };

  // Filtered days and matches
  const filteredDays = useMemo(() => {
    return days
      .filter((day) => selectedDayNumbers.includes(day.dayNumber))
      .map((day) => {
        const matchingMatches = day.matches.filter((match) => {
          // Team filter
          if (
            selectedTeamId !== 'all' &&
            match.homeTeamId !== selectedTeamId &&
            match.awayTeamId !== selectedTeamId
          ) {
            return false;
          }

          // Status filter
          const isMatchDone =
            match.isCompleted || (match.games.length > 0 && match.games.every((g) => g.completed));

          if (statusFilter === 'completed' && !isMatchDone) return false;
          if (statusFilter === 'upcoming' && isMatchDone) return false;

          return true;
        });

        return {
          ...day,
          matches: matchingMatches,
        };
      })
      .filter((day) => day.matches.length > 0);
  }, [days, selectedDayNumbers, selectedTeamId, statusFilter]);

  // Total count of printable matches
  const totalMatchesToPrint = useMemo(() => {
    return filteredDays.reduce((acc, d) => acc + d.matches.length, 0);
  }, [filteredDays]);

  // Team-centric grouping
  const teamSchedules = useMemo(() => {
    const targetTeams =
      selectedTeamId === 'all' ? teams : teams.filter((t) => t.id === selectedTeamId);

    return targetTeams.map((team) => {
      const matchesForTeam: {
        day: PoolDay;
        match: MatchPairing;
        isHome: boolean;
        opponentTeamId: string;
      }[] = [];

      days.forEach((day) => {
        if (!selectedDayNumbers.includes(day.dayNumber)) return;

        day.matches.forEach((match) => {
          const isMatchDone =
            match.isCompleted || (match.games.length > 0 && match.games.every((g) => g.completed));

          if (statusFilter === 'completed' && !isMatchDone) return;
          if (statusFilter === 'upcoming' && isMatchDone) return;

          if (match.homeTeamId === team.id) {
            matchesForTeam.push({
              day,
              match,
              isHome: true,
              opponentTeamId: match.awayTeamId,
            });
          } else if (match.awayTeamId === team.id) {
            matchesForTeam.push({
              day,
              match,
              isHome: false,
              opponentTeamId: match.homeTeamId,
            });
          }
        });
      });

      return {
        team,
        matches: matchesForTeam,
      };
    }).filter((t) => t.matches.length > 0);
  }, [teams, selectedTeamId, days, selectedDayNumbers, statusFilter]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const selectedTeamName =
    selectedTeamId === 'all'
      ? 'All Teams'
      : teams.find((t) => t.id === selectedTeamId)?.name || 'Selected Team';

  return (
    <div
      id="printable-schedule-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-6 overflow-y-auto backdrop-blur-xs printable-modal-overlay"
    >
      <div
        id="printable-schedule-modal"
        className="bg-slate-900 border-2 border-emerald-600/50 rounded-2xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl text-slate-100 relative my-auto max-h-[96vh] flex flex-col printable-modal-container"
      >
        {/* MODAL CONTROL HEADER (hidden when printing) */}
        <div className="print:hidden pb-4 border-b border-slate-800 shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" /> Print Season Schedule
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your printable sheet for the entire season, specific teams, or selected game days.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-print-schedule-now"
                onClick={handlePrint}
                disabled={totalMatchesToPrint === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition shadow-lg cursor-pointer"
                title="Send directly to printer or save as PDF"
              >
                <Printer className="w-4 h-4" /> Print Now
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* FILTER TOOLBAR */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Filter 1: Grouping View */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" /> Layout Format
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setGroupMode('byDay')}
                    className={`py-1.5 px-2 rounded-md font-bold text-center transition cursor-pointer ${
                      groupMode === 'byDay'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    By Day / Week
                  </button>
                  <button
                    onClick={() => setGroupMode('byTeam')}
                    className={`py-1.5 px-2 rounded-md font-bold text-center transition cursor-pointer ${
                      groupMode === 'byTeam'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    By Team Card
                  </button>
                </div>
              </div>

              {/* Filter 2: Team Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-400" /> Filter by Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">All Teams ({teams.length})</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Match Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-amber-400" /> Match Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as 'all' | 'upcoming' | 'completed')
                  }
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="all">All Games (Full Season)</option>
                  <option value="upcoming">Upcoming (Unplayed Only)</option>
                  <option value="completed">Completed / Scored Only</option>
                </select>
              </div>

              {/* Filter 4: Detail Level */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Game Details
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setDetailLevel('summary')}
                    className={`py-1.5 px-2 rounded-md font-bold text-center transition cursor-pointer ${
                      detailLevel === 'summary'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Match Summary
                  </button>
                  <button
                    onClick={() => setDetailLevel('detailed')}
                    className={`py-1.5 px-2 rounded-md font-bold text-center transition cursor-pointer ${
                      detailLevel === 'detailed'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Includes player roster matchups for each individual game"
                  >
                    + Lineups (10 Games)
                  </button>
                </div>
              </div>
            </div>

            {/* DAY SELECTOR ROW */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <span>Select Game Days to Include:</span>
                  <span className="text-emerald-400 font-bold">
                    ({selectedDayNumbers.length} of {days.length} selected)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    onClick={handleSelectAllDays}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Select All
                  </button>
                  {initialDayNumber && (
                    <button
                      onClick={handleSelectOnlyCurrentDay}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                    >
                      Day {initialDayNumber} Only
                    </button>
                  )}
                  <button
                    onClick={handleSelectUpcomingDays}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Upcoming Only
                  </button>
                  <button
                    onClick={handleClearDays}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold transition"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Day Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {days.map((day) => {
                  const isSelected = selectedDayNumbers.includes(day.dayNumber);
                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => toggleDaySelection(day.dayNumber)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs border border-emerald-500'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-3 h-3 text-emerald-200" />
                      ) : (
                        <Square className="w-3 h-3 text-slate-500" />
                      )}
                      <span>
                        Day {day.dayNumber}
                        <span className="text-[10px] font-normal opacity-75 ml-1">
                          ({day.dateString.slice(5)})
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SELECTION SUMMARY BADGE */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div>
                Showing{' '}
                <strong className="text-emerald-400 font-bold">{totalMatchesToPrint}</strong> match
                {totalMatchesToPrint === 1 ? '' : 'es'} across{' '}
                <strong className="text-emerald-400 font-bold">{filteredDays.length}</strong> pool
                day{filteredDays.length === 1 ? '' : 's'} •{' '}
                <span className="text-slate-300">{selectedTeamName}</span>
              </div>
              {totalMatchesToPrint === 0 && (
                <span className="text-rose-400 font-bold">
                  No games match your current filters. Please select at least one day or team.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PRINTABLE CANVAS (White paper styling, maximum ink contrast) */}
        <div
          id="printable-schedule-canvas"
          className="overflow-y-auto mt-3 p-6 bg-white text-black rounded-xl print:p-0 print:m-0 print:border-none print:shadow-none font-sans text-xs flex-1"
        >
          {/* Header Banner */}
          <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] uppercase tracking-wider font-extrabold text-gray-600">
                Official League Schedule
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black">
                {config.name}
              </h1>
              <div className="text-xs font-bold text-gray-800 mt-0.5">
                {selectedTeamId === 'all'
                  ? `Full Season Schedule — All Teams (${teams.length} Teams)`
                  : `Team Schedule: ${selectedTeamName}`}
              </div>
            </div>
            <div className="text-right text-[11px] text-gray-700 space-y-0.5">
              <div>Format: 8-Ball • {config.pointsPerBall} pt/ball + {config.pointsFor8Ball} pts for 8-Ball</div>
              <div>⚡ <strong>Home Team Breaks First</strong> on every game</div>
              <div className="text-[10px] text-gray-600 font-medium">Round 1: Visitor vs Home • Round 2: Teams Swap Roles</div>
              <div className="text-[10px] text-gray-500">
                Printed: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Quick Team Roster Directory Legend (Only in full season view) */}
          {selectedTeamId === 'all' && (
            <div className="mb-5 p-2.5 bg-gray-100 border border-gray-400 rounded-md print-page-break-avoid">
              <div className="text-[11px] font-black uppercase tracking-wider text-gray-800 mb-1">
                Participating Teams & Captains:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                {teams.map((t) => {
                  const captain = t.players.find((p) => p.isCaptain);
                  return (
                    <div key={t.id} className="border-l-2 border-black pl-1.5">
                      <div className="font-extrabold text-gray-900">{t.name}</div>
                      <div className="text-[10px] text-gray-600">
                        Capt: {captain?.name || 'Unassigned'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EMPTY NOTICE */}
          {totalMatchesToPrint === 0 && (
            <div className="text-center py-12 text-gray-500 italic text-sm">
              No matches found for the selected team or day filters. Please adjust your selection in the options above.
            </div>
          )}

          {/* MODE 1: GROUPED BY DAY / WEEK */}
          {groupMode === 'byDay' && (
            <div className="space-y-6">
              {filteredDays.map((day) => {
                return (
                  <div
                    key={day.dayNumber}
                    className="border-2 border-black rounded-lg overflow-hidden print-page-break-avoid"
                  >
                    {/* Day Header */}
                    <div className="bg-gray-200 px-3 py-2 border-b-2 border-black flex justify-between items-center font-bold text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-black">
                          WEEK / DAY {day.dayNumber}
                        </span>
                        <span className="text-gray-700 font-semibold">
                          — {day.dayOfWeek}, {day.dateString}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-700 flex items-center gap-2">
                        {day.isCompleted ? (
                          <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            Day Completed
                          </span>
                        ) : (
                          <span>{day.matches.length} Match{day.matches.length === 1 ? '' : 'es'} Scheduled</span>
                        )}
                      </div>
                    </div>

                    {/* Matches Table */}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-black text-[11px] font-bold text-gray-800">
                          <th className="py-1.5 px-3 border-r border-black w-24 text-center">Table / Time</th>
                          <th className="py-1.5 px-3 border-r border-black font-extrabold text-blue-900">
                            ⚡ Home Team (Breaks Round 1)
                          </th>
                          <th className="py-1.5 px-3 border-r border-black font-extrabold text-gray-900">
                            Visiting Team (Breaks Round 2)
                          </th>
                          <th className="py-1.5 px-3 border-r border-black w-32 text-center">
                            Result / Score
                          </th>
                          <th className="py-1.5 px-3 w-40 text-center">
                            Captains &amp; Breaks
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-medium text-xs">
                        {day.matches.map((match) => {
                          const homeTeam = getTeam(match.homeTeamId);
                          const awayTeam = getTeam(match.awayTeamId);

                          const homeScoreTotal = match.games.reduce((acc, g) => {
                            const isHome = (g.homeTeamId || match.homeTeamId) === match.homeTeamId;
                            return acc + (isHome ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
                          }, 0);

                          const awayScoreTotal = match.games.reduce((acc, g) => {
                            const isAway = (g.homeTeamId || match.homeTeamId) === match.awayTeamId;
                            return acc + (isAway ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
                          }, 0);

                          const isMatchScored = match.games.some((g) => g.completed);
                          const isMatchDone =
                            match.isCompleted || (match.games.length > 0 && match.games.every((g) => g.completed));

                          return (
                            <React.Fragment key={match.id}>
                              <tr className="h-10 hover:bg-gray-50">
                                <td className="py-1 px-3 border-r border-black text-center font-bold">
                                  <div>Table {match.tableNumber}</div>
                                  {match.timeSlot && (
                                    <div className="text-[10px] text-gray-600 font-normal">
                                      {match.timeSlot}
                                    </div>
                                  )}
                                </td>
                                <td className="py-1 px-3 border-r border-black font-bold text-gray-900">
                                  <div className="text-sm font-black text-blue-900">⚡ {homeTeam?.name}</div>
                                  <div className="text-[10px] text-gray-600">
                                    Capt: {homeTeam?.players.find((p) => p.isCaptain)?.name || 'None'}
                                  </div>
                                </td>
                                <td className="py-1 px-3 border-r border-black font-bold text-gray-900">
                                  <div className="text-sm font-black">{awayTeam?.name}</div>
                                  <div className="text-[10px] text-gray-600">
                                    Capt: {awayTeam?.players.find((p) => p.isCaptain)?.name || 'None'}
                                  </div>
                                </td>
                                <td className="py-1 px-3 border-r border-black text-center">
                                  {isMatchScored ? (
                                    <div>
                                      <span className="font-black text-sm">
                                        {homeScoreTotal} - {awayScoreTotal}
                                      </span>
                                      {isMatchDone ? (
                                        <div className="text-[10px] font-bold text-gray-700 uppercase">
                                          Final
                                        </div>
                                      ) : (
                                        <div className="text-[10px] text-gray-500">
                                          In Progress
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 font-semibold italic text-[11px]">
                                      Scheduled
                                    </span>
                                  )}
                                </td>
                                <td className="py-1 px-3 text-center text-[10px] text-gray-600">
                                  <div>Round 1: ⚡ {homeTeam?.name} breaks</div>
                                  <div>Round 2: ⚡ {awayTeam?.name} breaks</div>
                                </td>
                              </tr>

                              {/* DETAILED LINEUPS (if enabled) */}
                              {detailLevel === 'detailed' && (
                                <tr>
                                  <td colSpan={5} className="p-2 bg-gray-50 border-t border-gray-300">
                                    <div className="text-[10px] font-black uppercase tracking-wider text-gray-700 mb-1">
                                      Individual Matchups (All Players Face Each Opponent Once Per Round • Home Breaks First):
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                      {/* Round 1 */}
                                      <div className="border border-gray-300 rounded p-1.5 bg-white">
                                        <div className="font-bold text-gray-800 text-[10px] border-b border-gray-200 pb-0.5 mb-1 flex items-center justify-between">
                                          <span>ROUND 1 ({awayTeam?.name} vs {homeTeam?.name})</span>
                                          <span className="text-blue-900 font-black">⚡ {homeTeam?.name} Breaks</span>
                                        </div>
                                        <div className="space-y-0.5">
                                          {match.games
                                            .filter((g) => g.roundNumber === 1)
                                            .map((g) => (
                                              <div
                                                key={g.id}
                                                className="flex justify-between items-center text-[10px]"
                                              >
                                                <span className="font-bold text-gray-600 w-12">
                                                  Game {g.gameNumber}:
                                                </span>
                                                <span className="flex-1 font-medium text-gray-900 truncate">
                                                  ⚡ {g.homePlayerName} vs {g.awayPlayerName}
                                                </span>
                                                {g.completed && (
                                                  <span className="font-bold text-gray-900 ml-1">
                                                    {g.homeScore?.totalPoints}–{g.awayScore?.totalPoints}
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                        </div>
                                      </div>

                                      {/* Round 2 */}
                                      <div className="border border-gray-300 rounded p-1.5 bg-white">
                                        <div className="font-bold text-gray-800 text-[10px] border-b border-gray-200 pb-0.5 mb-1 flex items-center justify-between">
                                          <span>ROUND 2 REMATCH ({homeTeam?.name} vs {awayTeam?.name})</span>
                                          <span className="text-blue-900 font-black">⚡ {awayTeam?.name} Breaks</span>
                                        </div>
                                        <div className="space-y-0.5">
                                          {match.games
                                            .filter((g) => g.roundNumber === 2)
                                            .map((g) => (
                                              <div
                                                key={g.id}
                                                className="flex justify-between items-center text-[10px]"
                                              >
                                                <span className="font-bold text-gray-600 w-12">
                                                  Game {g.gameNumber}:
                                                </span>
                                                <span className="flex-1 font-medium text-gray-900 truncate">
                                                  ⚡ {g.homePlayerName} vs {g.awayPlayerName}
                                                </span>
                                                {g.completed && (
                                                  <span className="font-bold text-gray-900 ml-1">
                                                    {g.homeScore?.totalPoints}–{g.awayScore?.totalPoints}
                                                  </span>
                                                )}
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: GROUPED BY TEAM */}
          {groupMode === 'byTeam' && (
            <div className="space-y-6">
              {teamSchedules.map(({ team, matches }) => {
                const captain = team.players.find((p) => p.isCaptain);
                return (
                  <div
                    key={team.id}
                    className="border-2 border-black rounded-lg overflow-hidden print-page-break-avoid"
                  >
                    {/* Team Header */}
                    <div className="bg-gray-200 px-3 py-2 border-b-2 border-black flex justify-between items-center font-bold text-sm">
                      <div>
                        <span className="text-base font-black text-black">{team.name}</span>
                        <span className="text-xs text-gray-700 font-semibold ml-2">
                          (Captain: {captain?.name || 'Unassigned'})
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-800">
                        {matches.length} Scheduled Match{matches.length === 1 ? '' : 'es'}
                      </div>
                    </div>

                    {/* Team Matches Table */}
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b border-black text-[11px] font-bold text-gray-800">
                          <th className="py-1.5 px-3 border-r border-black w-20 text-center">Day / Date</th>
                          <th className="py-1.5 px-3 border-r border-black w-24 text-center">Table / Time</th>
                          <th className="py-1.5 px-3 border-r border-black w-24 text-center">Side (R1)</th>
                          <th className="py-1.5 px-3 border-r border-black font-extrabold text-black">
                            Opponent Team
                          </th>
                          <th className="py-1.5 px-3 border-r border-black w-28 text-center">Result</th>
                          <th className="py-1.5 px-3 text-center w-36">Opponent Captain</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black font-medium text-xs">
                        {matches.map(({ day, match, isHome, opponentTeamId }) => {
                          const opponentTeam = getTeam(opponentTeamId);
                          const opponentCaptain = opponentTeam?.players.find((p) => p.isCaptain);

                          const myPoints = match.games.reduce((acc, g) => {
                            if (!g.completed) return acc;
                            const isMeHome = (g.homeTeamId || match.homeTeamId) === team.id;
                            return acc + (isMeHome ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
                          }, 0);

                          const oppPoints = match.games.reduce((acc, g) => {
                            if (!g.completed) return acc;
                            const isOppHome = (g.homeTeamId || match.homeTeamId) === opponentTeamId;
                            return acc + (isOppHome ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
                          }, 0);

                          const isPlayed = match.games.some((g) => g.completed);
                          const isFinished =
                            match.isCompleted || (match.games.length > 0 && match.games.every((g) => g.completed));

                          return (
                            <tr key={match.id} className="h-9 hover:bg-gray-50">
                              <td className="py-1 px-3 border-r border-black text-center font-bold">
                                <div>Day {day.dayNumber}</div>
                                <div className="text-[10px] text-gray-600 font-normal">
                                  {day.dateString}
                                </div>
                              </td>
                              <td className="py-1 px-3 border-r border-black text-center font-bold">
                                <div>Table {match.tableNumber}</div>
                                {match.timeSlot && (
                                  <div className="text-[10px] text-gray-600 font-normal">
                                    {match.timeSlot}
                                  </div>
                                )}
                              </td>
                              <td className="py-1 px-3 border-r border-black text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                                    isHome
                                      ? 'bg-gray-900 text-white'
                                      : 'bg-gray-200 text-gray-800'
                                  }`}
                                >
                                  {isHome ? '⚡ HOME (R1 Break)' : 'VISITOR (R2 Break)'}
                                </span>
                              </td>
                              <td className="py-1 px-3 border-r border-black font-bold text-gray-900">
                                <span className="text-sm font-black">{opponentTeam?.name}</span>
                              </td>
                              <td className="py-1 px-3 border-r border-black text-center">
                                {isPlayed ? (
                                  <div>
                                    <span
                                      className={`font-black text-sm ${
                                        myPoints > oppPoints
                                          ? 'text-black'
                                          : myPoints < oppPoints
                                          ? 'text-gray-700'
                                          : 'text-black'
                                      }`}
                                    >
                                      {myPoints} - {oppPoints}
                                    </span>
                                    {isFinished && (
                                      <div className="text-[9px] font-bold text-gray-600 uppercase">
                                        {myPoints > oppPoints ? 'WIN' : myPoints < oppPoints ? 'LOSS' : 'TIE'}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 italic text-[11px]">Scheduled</span>
                                )}
                              </td>
                              <td className="py-1 px-3 text-center text-[10px] text-gray-700">
                                {opponentCaptain?.name || 'None'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          {/* Printable Document Footer */}
          <div className="mt-6 pt-3 border-t-2 border-black flex justify-between items-center text-[10px] text-gray-600 print-page-break-avoid">
            <div>
              <strong>Pool League Official Regulations:</strong> 10 games per match • Round 1 & Round 2 alternate home break advantage.
            </div>
            <div>
              Coordinator Signature: ___________________________
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
