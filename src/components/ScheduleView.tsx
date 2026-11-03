import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, UserCheck, Trophy, Printer, Activity, Trash2, Calendar } from 'lucide-react';
import { IndividualGame, MatchPairing, PoolDay, TournamentData } from '../types';
import { ClearScoreDialog, ClearScope } from './ClearScoreDialog';
import { PrintableScheduleModal } from './PrintableScheduleModal';

interface ScheduleViewProps {
  tournament: TournamentData;
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  onOpenScoreModal: (game: IndividualGame, tableNumber: number) => void;
  onOpenSubModal: (game: IndividualGame, side: 'home' | 'away') => void;
  onPrintDay: (dayNumber: number) => void;
  onToggleDayCompleted: (dayNumber: number) => void;
  onClearGame?: (gameId: string) => void;
  onClearRound?: (matchId: string, roundNumber: number) => void;
  onClearMatch?: (matchId: string) => void;
  onClearDay?: (dayNumber: number) => void;
  onClearAll?: () => void;
  onPrintSchedule?: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  tournament,
  selectedDayNumber,
  onSelectDay,
  onOpenScoreModal,
  onOpenSubModal,
  onPrintDay,
  onToggleDayCompleted,
  onClearGame,
  onClearRound,
  onClearMatch,
  onClearDay,
  onClearAll,
  onPrintSchedule,
}) => {
  const { days, teams } = tournament;
  const currentDay = days.find((d) => d.dayNumber === selectedDayNumber) || days[0];

  const [clearDialogState, setClearDialogState] = useState<{
    isOpen: boolean;
    initialScope: ClearScope;
    game?: IndividualGame | null;
    match?: MatchPairing | null;
  }>({
    isOpen: false,
    initialScope: 'game',
  });

  const [isPrintScheduleOpen, setIsPrintScheduleOpen] = useState(false);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);

  // Tournament-wide match completion stats
  const totalLeagueMatches = useMemo(() => {
    return days.reduce((acc, d) => acc + d.matches.length, 0);
  }, [days]);

  const totalCompletedInTournament = useMemo(() => {
    return days.reduce((acc, d) => {
      return acc + d.matches.reduce((mAcc, m) => mAcc + m.games.filter((g) => g.completed).length, 0);
    }, 0);
  }, [days]);


  const completedLeagueMatches = useMemo(() => {
    return days.reduce((acc, d) => {
      return (
        acc +
        d.matches.filter(
          (m) => m.isCompleted || (m.games.length > 0 && m.games.every((g) => g.completed))
        ).length
      );
    }, 0);
  }, [days]);

  const inProgressLeagueMatches = useMemo(() => {
    return days.reduce((acc, d) => {
      return (
        acc +
        d.matches.filter((m) => {
          const isFullyCompleted =
            m.isCompleted || (m.games.length > 0 && m.games.every((g) => g.completed));
          if (isFullyCompleted) return false;
          return m.games.some((g) => g.completed);
        }).length
      );
    }, 0);
  }, [days]);

  const matchCompletionPercentage = useMemo(() => {
    if (totalLeagueMatches === 0) return 0;
    const pct = (completedLeagueMatches / totalLeagueMatches) * 100;
    return pct % 1 === 0 ? pct : parseFloat(pct.toFixed(1));
  }, [totalLeagueMatches, completedLeagueMatches]);

  if (!currentDay) {
    return (
      <div className="text-center py-16 text-slate-400">
        No schedule available. Please create a tournament first.
      </div>
    );
  }

  // Calculate day completion
  const totalGamesInDay = currentDay.matches.reduce((acc, m) => acc + m.games.length, 0);
  const completedGamesInDay = currentDay.matches.reduce(
    (acc, m) => acc + m.games.filter((g) => g.completed).length,
    0
  );
  const isDayFullyScored = totalGamesInDay > 0 && completedGamesInDay === totalGamesInDay;

  return (
    <div id="schedule-view" className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      {/* SIDEBAR SECTION (Quarter of the frame: lg:col-span-1) */}
      <aside className="lg:col-span-1 w-full space-y-5 lg:sticky lg:top-4">
        {/* Date & Day Navigation Section */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          {/* Day Navigation Header */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => onSelectDay(Math.max(1, selectedDayNumber - 1))}
              disabled={selectedDayNumber <= 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white transition"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-700/60">
              Day {currentDay.dayNumber} of {days.length}
            </span>

            <button
              onClick={() => onSelectDay(Math.min(days.length, selectedDayNumber + 1))}
              disabled={selectedDayNumber >= days.length}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white transition"
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Date info */}
          <div className="text-center pt-2 border-t border-slate-700/60">
            <div className="text-xs text-slate-400 font-semibold">{currentDay.dayOfWeek}</div>
            <h2 className="text-lg font-black text-white mt-0.5">{currentDay.dateString}</h2>

            <div className="mt-2">
              {currentDay.isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-900/60 px-2.5 py-0.5 rounded-md border border-emerald-700/50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Day Finalized
                </span>
              ) : isDayFullyScored ? (
                <span className="text-xs font-bold text-teal-300 bg-teal-950 px-2.5 py-0.5 rounded-md border border-teal-700/60">
                  Ready to Finalize
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  {completedGamesInDay} / {totalGamesInDay} games scored
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-700/60">
            <button
              id="btn-print-schedule-sidebar"
              onClick={() => {
                if (onPrintSchedule) {
                  onPrintSchedule();
                } else {
                  setIsPrintScheduleOpen(true);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer"
              title="Print full season schedule or select games"
            >
              <Calendar className="w-4 h-4" /> Print Schedule
            </button>

            <button
              onClick={() => onPrintDay(currentDay.dayNumber)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold rounded-xl text-xs sm:text-sm border border-slate-600 transition cursor-pointer"
              title="Print paper scoresheets for this pool day"
            >
              <Printer className="w-4 h-4" /> Print Day Scoresheet
            </button>

            <button
              onClick={() => onToggleDayCompleted(currentDay.dayNumber)}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer ${
                currentDay.isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {currentDay.isCompleted ? 'Completed' : 'Mark Day Done'}
            </button>

            {/* Clear Scores Action Button */}
            <button
              onClick={() =>
                setClearDialogState({
                  isOpen: true,
                  initialScope: 'day',
                  day: currentDay,
                })
              }
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Clear scores for this day or tournament"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear Scores...</span>
            </button>
          </div>

          {/* Quick Day Selector Grid */}
          <div className="pt-3 border-t border-slate-700/60">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              All Scheduled Days
            </div>
            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {days.map((d) => (
                <button
                  key={d.dayNumber}
                  onClick={() => onSelectDay(d.dayNumber)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold transition text-center cursor-pointer ${
                    d.dayNumber === selectedDayNumber
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                      : d.isCompleted
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-800'
                  }`}
                >
                  D{d.dayNumber} {d.isCompleted && '✓'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* League Tournament Progress Section */}
        <div
          id="league-matches-progress-bar"
          className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-950/90 border border-emerald-600/70 rounded-lg text-emerald-400 shadow-xs">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white">League Progress</h3>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-700/70">
              {matchCompletionPercentage}%
            </span>
          </div>

          {/* Visual Progress Track */}
          <div
            className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-700/80 p-0.5 shadow-inner"
            role="progressbar"
            aria-valuenow={matchCompletionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tournament league match completion progress"
          >
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, matchCompletionPercentage))}%` }}
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Completed:</span>
              <span className="font-bold text-emerald-400">{completedLeagueMatches} / {totalLeagueMatches} matches</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Remaining:</span>
              <span className="font-bold text-amber-400">{Math.max(0, totalLeagueMatches - completedLeagueMatches)} matches</span>
            </div>
            {inProgressLeagueMatches > 0 && (
              <div className="flex justify-between text-teal-300 pt-1 border-t border-slate-700/50 text-[11px]">
                <span>In Progress:</span>
                <span className="font-bold">{inProgressLeagueMatches} match</span>
              </div>
            )}
            {completedLeagueMatches === totalLeagueMatches && totalLeagueMatches > 0 && (
              <div className="pt-2 text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> All League Matches Complete!
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN MATCHES SECTION (Three quarters of the frame: lg:col-span-3) */}
      <div className="lg:col-span-3 w-full space-y-6">
        {/* Day Header & Action Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-md border border-emerald-700/60">
                Pool Day {currentDay.dayNumber} of {days.length}
              </span>
              <h2 className="text-xl font-black text-white">{currentDay.dayOfWeek}, {currentDay.dateString}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentDay.matches.length} table match{currentDay.matches.length === 1 ? '' : 'es'} • {completedGamesInDay} of {totalGamesInDay} individual games completed
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-print-schedule-top"
              onClick={() => {
                if (onPrintSchedule) {
                  onPrintSchedule();
                } else {
                  setIsPrintScheduleOpen(true);
                }
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Print full season schedule or select games"
            >
              <Calendar className="w-4 h-4" /> Print Schedule
            </button>
            <button
              onClick={() => onPrintDay(currentDay.dayNumber)}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-slate-600 transition cursor-pointer"
              title="Print paper scoresheet for this day"
            >
              <Printer className="w-4 h-4 text-slate-300" /> Day Scoresheet
            </button>
          </div>
        </div>

        {/* Weekly Game Schedule Rules Banner */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 font-black border border-emerald-700/70 text-[11px] flex items-center gap-1.5 shadow-xs">
              <span>⚡</span> Home Teams Break First
            </span>
            <span className="text-slate-300 font-medium">
              Each player plays each opponent once per round. Teams swap home/away in Round 2.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 shrink-0">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <strong className="text-emerald-400">Round 1:</strong> Visitor vs Home (Home Breaks)
            </span>
            <span>➔</span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <strong className="text-teal-400">Round 2:</strong> Visitor vs Home (Home Breaks)
            </span>
          </div>
        </div>

        {currentDay.matches.map((match: MatchPairing) => {
          const homeTeam = getTeam(match.homeTeamId);
          const awayTeam = getTeam(match.awayTeamId);

          const matchCompletedGames = match.games.filter((g) => g.completed).length;
          const matchHomePoints = match.games.reduce((acc, g) => {
            if (!g.completed) return acc;
            const isHomeTeamPlayingAsHome = (g.homeTeamId || match.homeTeamId) === match.homeTeamId;
            return acc + (isHomeTeamPlayingAsHome ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
          }, 0);
          const matchAwayPoints = match.games.reduce((acc, g) => {
            if (!g.completed) return acc;
            const isAwayTeamPlayingAsHome = (g.homeTeamId || match.homeTeamId) === match.awayTeamId;
            return acc + (isAwayTeamPlayingAsHome ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
          }, 0);

          // Split games into Round 1 and Round 2
          const round1Games = match.games.filter((g) => g.roundNumber === 1);
          const round2Games = match.games.filter((g) => g.roundNumber === 2);

          const renderGameRow = (game: IndividualGame, isRound1: boolean) => {
            const isHomeWinner = game.completed && game.homeScore?.isWinner;
            const isAwayWinner = game.completed && game.awayScore?.isWinner;

            return (
              <div
                key={game.id}
                className="py-3 px-3 sm:px-4 flex flex-col md:flex-row items-center justify-between gap-3 hover:bg-slate-800/70 rounded-xl transition"
              >
                {/* Game Label */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-black flex items-center justify-center shadow-xs">
                    #{game.gameNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                    Game {game.gameNumber}
                  </span>
                </div>

                {/* Players & Scores Matchup Row */}
                <div className="flex-1 w-full flex items-center justify-between sm:justify-center gap-2 sm:gap-6">
                  {/* Home Player (Breaks First) */}
                  <div className="flex items-center gap-2 flex-1 justify-end text-right">
                    <button
                      onClick={() => onOpenSubModal(game, 'home')}
                      className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-md transition text-xs flex items-center gap-1 cursor-pointer"
                      title="Substitute player if original cannot make it"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      <div className="font-bold text-sm sm:text-base text-white flex items-center justify-end gap-1.5">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-700/70 flex items-center gap-1 shadow-xs"
                          title="Home team breaks first in this game"
                        >
                          ⚡ BREAK
                        </span>
                        {isHomeWinner && <Trophy className="w-4 h-4 text-emerald-400 inline" />}
                        <span className={isHomeWinner ? 'text-emerald-300 font-extrabold' : ''}>
                          {game.homePlayerName}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-400/90 font-medium flex items-center justify-end gap-1">
                        <span>{game.homeTeamName || (isRound1 ? homeTeam?.name : awayTeam?.name)}</span>
                        {game.homeIsSub && (
                          <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded-sm border border-amber-800">
                            Sub
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Home Score Pill */}
                    <div
                      className={`min-w-[44px] py-1 px-2.5 rounded-xl text-center font-black text-sm border ${
                        game.completed && game.homeScore
                          ? isHomeWinner
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                            : 'bg-slate-900 text-slate-200 border-slate-700'
                          : 'bg-slate-900 text-slate-500 border-slate-700'
                      }`}
                    >
                      {game.completed && game.homeScore ? `${game.homeScore.totalPoints} pts` : '-'}
                    </div>
                  </div>

                  {/* VS Divider / Center Score Button */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenScoreModal(game, match.tableNumber)}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
                        game.completed
                          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/80'
                      }`}
                    >
                      {game.completed ? 'Edit Score' : '+ Enter Score'}
                    </button>
                    {game.completed && onClearGame && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Clear score for Game #${game.gameNumber} (${game.homePlayerName} vs ${game.awayPlayerName})?`)) {
                            onClearGame(game.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition border border-transparent hover:border-rose-900/60 cursor-pointer"
                        title="Clear this game score"
                        aria-label="Clear game score"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Away / Visiting Player */}
                  <div className="flex items-center gap-2 flex-1 justify-start text-left">
                    {/* Away Score Pill */}
                    <div
                      className={`min-w-[44px] py-1 px-2.5 rounded-xl text-center font-black text-sm border ${
                        game.completed && game.awayScore
                          ? isAwayWinner
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                            : 'bg-slate-900 text-slate-200 border-slate-700'
                          : 'bg-slate-900 text-slate-500 border-slate-700'
                      }`}
                    >
                      {game.completed && game.awayScore ? `${game.awayScore.totalPoints} pts` : '-'}
                    </div>

                    <div>
                      <div className="font-bold text-sm sm:text-base text-white flex items-center justify-start gap-1.5">
                        <span className={isAwayWinner ? 'text-emerald-300 font-extrabold' : ''}>
                          {game.awayPlayerName}
                        </span>
                        {isAwayWinner && <Trophy className="w-4 h-4 text-emerald-400 inline" />}
                      </div>
                      <div className="text-[11px] text-teal-400/90 font-medium flex items-center justify-start gap-1">
                        <span>{game.awayTeamName || (isRound1 ? awayTeam?.name : homeTeam?.name)}</span>
                        {game.awayIsSub && (
                          <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded-sm border border-amber-800">
                            Sub
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenSubModal(game, 'away')}
                      className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-md transition text-xs flex items-center gap-1 cursor-pointer"
                      title="Substitute player if original cannot make it"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div
              key={match.id}
              className="bg-slate-800/80 border-2 border-slate-700/80 hover:border-emerald-600/40 rounded-3xl overflow-hidden shadow-xl transition"
            >
              {/* Match Header: Clean Table assignment & Team Names */}
              <div className="bg-slate-900 p-4 sm:p-5 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-emerald-950 border border-emerald-600/80 rounded-xl text-emerald-400 font-black text-sm flex items-center gap-1.5 shadow-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                      {match.tableNumber}
                    </span>
                    <span>Table {match.tableNumber}</span>
                  </div>

                  {match.timeSlot && (
                    <span className="text-xs text-slate-400 font-medium">
                      ({match.timeSlot})
                    </span>
                  )}

                  {/* Clear Match Button */}
                  {matchCompletedGames > 0 && (
                    <button
                      onClick={() =>
                        setClearDialogState({
                          isOpen: true,
                          initialScope: 'match',
                          match,
                        })
                      }
                      className="px-2.5 py-1 text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Clear scores for this match, rounds, or games"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                      <span>Clear Match...</span>
                    </button>
                  )}
                </div>

                {/* Team Names & Live Match Score */}
                <div className="flex items-center justify-between sm:justify-center gap-3 sm:gap-6 flex-1 max-w-xl mx-auto">
                  {/* Home Team */}
                  <div className="text-right flex-1">
                    <div className="text-base sm:text-lg font-black text-white truncate" title={homeTeam?.name}>
                      {homeTeam?.name || 'Home Team'}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      Cap: {homeTeam?.players.find((p) => p.isCaptain)?.name || 'Captain'}
                    </div>
                  </div>

                  {/* Live Points Box */}
                  <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-950 border-2 border-slate-700 rounded-2xl font-black text-xl sm:text-2xl shadow-inner shrink-0">
                    <span className={matchHomePoints > matchAwayPoints ? 'text-emerald-400' : 'text-slate-200'}>
                      {matchHomePoints}
                    </span>
                    <span className="text-slate-600">:</span>
                    <span className={matchAwayPoints > matchHomePoints ? 'text-emerald-400' : 'text-slate-200'}>
                      {matchAwayPoints}
                    </span>
                  </div>

                  {/* Visiting Team */}
                  <div className="text-left flex-1">
                    <div className="text-base sm:text-lg font-black text-white truncate" title={awayTeam?.name}>
                      {awayTeam?.name || 'Visiting Team'}
                    </div>
                    <div className="text-xs text-teal-400 font-medium">
                      Cap: {awayTeam?.players.find((p) => p.isCaptain)?.name || 'Captain'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-semibold self-end sm:self-auto bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                  {matchCompletedGames} / {match.games.length} played
                </div>
              </div>

              {/* Individual Games List: Grouped into Round 1 and Round 2 */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* WINDOW 1: ROUND 1 */}
                <div className="bg-slate-900/90 border border-slate-700/90 rounded-2xl overflow-hidden shadow-inner">
                  {/* Round 1 Window Header */}
                  <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Round 1 {round1Games.length > 0 && `(Games ${round1Games[0].gameNumber}–${round1Games[round1Games.length - 1].gameNumber})`}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-800/80 flex items-center gap-1 shadow-xs">
                        ⚡ {homeTeam?.name} Breaks First
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold">
                        <span className="text-teal-400">{awayTeam?.name} (Visitor)</span>
                        <span className="text-slate-500 mx-1.5">vs</span>
                        <span className="text-emerald-400 font-black">{homeTeam?.name} (Home Team)</span>
                      </div>
                      {round1Games.some((g) => g.completed) && onClearRound && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Clear all Round 1 scores for Table ${match.tableNumber} (${homeTeam?.name} vs ${awayTeam?.name})?`
                              )
                            ) {
                              onClearRound(match.id, 1);
                            }
                          }}
                          className="px-2 py-0.5 text-[11px] font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/70 rounded-md flex items-center gap-1 transition cursor-pointer"
                          title="Clear all scores in Round 1"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Clear R1</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DIRECTLY ABOVE THE SCHEDULE: Just Home Team and Visiting Team */}
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs font-black uppercase tracking-wider flex items-center justify-between">
                    <div className="flex-1 text-right pr-6 text-emerald-400 flex items-center justify-end gap-1.5">
                      <span>⚡ Breaks First • Home Team ({homeTeam?.name})</span>
                    </div>
                    <span className="w-24 text-center text-slate-500 font-bold">
                      Score
                    </span>
                    <div className="flex-1 text-left pl-6 text-teal-400">
                      <span>Visiting Team ({awayTeam?.name})</span>
                    </div>
                  </div>

                  {/* Round 1 Games */}
                  <div className="p-2 sm:p-3 divide-y divide-slate-800/80 space-y-1">
                    {round1Games.map((game) => renderGameRow(game, true))}
                  </div>
                </div>

                {/* DISTINCT SEPARATION BETWEEN THE 2 ROUNDS */}
                <div className="relative flex items-center justify-center my-6 px-4">
                  <div className="grow border-t-2 border-dashed border-slate-700"></div>
                  <div className="mx-4 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-600 text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2 shadow-md">
                    <span>🔄</span>
                    <span>Round 2 • Teams Alternate Home &amp; Visitors ({awayTeam?.name} Now Breaks First)</span>
                  </div>
                  <div className="grow border-t-2 border-dashed border-slate-700"></div>
                </div>

                {/* WINDOW 2: ROUND 2 */}
                <div className="bg-slate-900/90 border border-slate-700/90 rounded-2xl overflow-hidden shadow-inner">
                  {/* Round 2 Window Header */}
                  <div className="bg-slate-950/90 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        Round 2 Rematch {round2Games.length > 0 && `(Games ${round2Games[0].gameNumber}–${round2Games[round2Games.length - 1].gameNumber})`}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-800/80 flex items-center gap-1 shadow-xs">
                        ⚡ {awayTeam?.name} Breaks First
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-bold">
                        <span className="text-teal-400">{homeTeam?.name} (Visitor)</span>
                        <span className="text-slate-500 mx-1.5">vs</span>
                        <span className="text-emerald-400 font-black">{awayTeam?.name} (Home Team)</span>
                      </div>
                      {round2Games.some((g) => g.completed) && onClearRound && (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Clear all Round 2 scores for Table ${match.tableNumber} (${awayTeam?.name} vs ${homeTeam?.name})?`
                              )
                            ) {
                              onClearRound(match.id, 2);
                            }
                          }}
                          className="px-2 py-0.5 text-[11px] font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-800/70 rounded-md flex items-center gap-1 transition cursor-pointer"
                          title="Clear all scores in Round 2"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                          <span>Clear R2</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* DIRECTLY ABOVE THE SCHEDULE: Just Home Team and Visiting Team */}
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs font-black uppercase tracking-wider flex items-center justify-between">
                    <div className="flex-1 text-right pr-6 text-emerald-400 flex items-center justify-end gap-1.5">
                      <span>⚡ Breaks First • Home Team ({awayTeam?.name})</span>
                    </div>
                    <span className="w-24 text-center text-slate-500 font-bold">
                      Score
                    </span>
                    <div className="flex-1 text-left pl-6 text-teal-400">
                      <span>Visiting Team ({homeTeam?.name})</span>
                    </div>
                  </div>

                  {/* Round 2 Games */}
                  <div className="p-2 sm:p-3 divide-y divide-slate-800/80 space-y-1">
                    {round2Games.map((game) => renderGameRow(game, false))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Score Dialog */}
      {clearDialogState.isOpen && (
        <ClearScoreDialog
          isOpen={clearDialogState.isOpen}
          onClose={() => setClearDialogState((prev) => ({ ...prev, isOpen: false }))}
          onConfirmClear={(scope, params) => {
            if (scope === 'game' && params.gameId && onClearGame) {
              onClearGame(params.gameId);
            } else if (scope === 'round' && params.matchId && params.roundNumber && onClearRound) {
              onClearRound(params.matchId, params.roundNumber);
            } else if (scope === 'match' && params.matchId && onClearMatch) {
              onClearMatch(params.matchId);
            } else if (scope === 'day' && params.dayNumber && onClearDay) {
              onClearDay(params.dayNumber);
            } else if (scope === 'all' && onClearAll) {
              onClearAll();
            }
          }}
          initialScope={clearDialogState.initialScope}
          game={clearDialogState.game}
          match={clearDialogState.match}
          currentDay={currentDay}
          totalGamesCompletedInTournament={totalCompletedInTournament}
        />
      )}

      {/* Printable Season Schedule Modal */}
      {isPrintScheduleOpen && (
        <PrintableScheduleModal
          isOpen={isPrintScheduleOpen}
          tournament={tournament}
          onClose={() => setIsPrintScheduleOpen(false)}
          initialDayNumber={currentDay.dayNumber}
        />
      )}
    </div>
  );
};
