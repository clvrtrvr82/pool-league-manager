import React from 'react';
import { Printer, X } from 'lucide-react';
import { TournamentData } from '../types';

interface PrintableScoreSheetProps {
  isOpen: boolean;
  tournament: TournamentData;
  dayNumber: number;
  onClose: () => void;
}

export const PrintableScoreSheet: React.FC<PrintableScoreSheetProps> = ({
  isOpen,
  tournament,
  dayNumber,
  onClose,
}) => {
  if (!isOpen) return null;

  const day = tournament.days.find((d) => d.dayNumber === dayNumber) || tournament.days[0];
  const getTeam = (teamId: string) => tournament.teams.find((t) => t.id === teamId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="print-scoresheet-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-6 overflow-y-auto backdrop-blur-xs printable-modal-overlay">
      <div className="bg-slate-900 border-2 border-emerald-600/50 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl text-slate-100 relative my-auto max-h-[95vh] flex flex-col printable-modal-container">
        {/* Modal Top Bar (hidden during actual browser print) */}
        <div className="print:hidden flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-emerald-400" /> Printable Pool Night Scoresheet
            </h2>
            <p className="text-xs text-slate-400">
              Print this sheet out for the captains and players to track game scores at the pool tables.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" /> Print Now
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CANVAS (White background, high contrast for ink) */}
        <div className="overflow-y-auto mt-4 p-6 bg-white text-black rounded-xl print:p-0 print:m-0 print:border-none print:shadow-none font-sans text-xs">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-black">
                {tournament.config.name}
              </h1>
              <div className="text-sm font-bold text-gray-800 mt-1">
                Official Scoresheet — Day {day?.dayNumber} ({day?.dayOfWeek}, {day?.dateString})
              </div>
              <div className="text-[11px] text-gray-700 mt-0.5 font-medium">
                Format: Round 1 Team 2 (Visitor) vs Team 1 (Home). Round 2 Team 1 (Visitor) vs Team 2 (Home). <strong>Home team breaks first in all games.</strong> Each player plays each opponent once per round.
              </div>
            </div>
            <div className="text-right text-[11px] text-gray-700">
              <div>1 pt / ball pocketed + 3 pts for 8-ball (Max 10 pts)</div>
              <div className="font-bold text-emerald-800 mt-0.5">⚡ = Breaks First</div>
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-6">
            {day?.matches.map((match) => {
              const homeTeam = getTeam(match.homeTeamId);
              const awayTeam = getTeam(match.awayTeamId);

              const r1Games = match.games.filter((g) => g.roundNumber === 1);
              const r2Games = match.games.filter((g) => g.roundNumber === 2);

              const team1TotalMatchPoints = match.games.reduce((acc, g) => {
                const isTeam1Home = (g.homeTeamId || match.homeTeamId) === match.homeTeamId;
                return acc + (isTeam1Home ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
              }, 0);

              const team2TotalMatchPoints = match.games.reduce((acc, g) => {
                const isTeam2Home = (g.homeTeamId || match.homeTeamId) === match.awayTeamId;
                return acc + (isTeam2Home ? (g.homeScore?.totalPoints || 0) : (g.awayScore?.totalPoints || 0));
              }, 0);

              return (
                <div key={match.id} className="border-2 border-black rounded-lg overflow-hidden">
                  {/* Match Header */}
                  <div className="bg-gray-200 px-3 py-2 border-b-2 border-black flex justify-between items-center font-bold text-sm">
                    <div>
                      Table {match.tableNumber} {match.timeSlot && `(${match.timeSlot})`}
                    </div>
                    <div className="text-base font-black">
                      {awayTeam?.name} <span className="text-xs text-gray-600 font-bold">(Visiting Team)</span>
                      <span className="font-normal text-gray-600 mx-2">vs</span>
                      {homeTeam?.name} <span className="text-xs text-gray-700 font-black">(Home Team • Breaks R1)</span>
                    </div>
                    <div className="text-xs text-gray-700">
                      Captains: {homeTeam?.players.find((p) => p.isCaptain)?.name} / {awayTeam?.players.find((p) => p.isCaptain)?.name}
                    </div>
                  </div>

                  {/* Games Table */}
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-black text-[11px] font-bold">
                        <th className="py-1 px-2 border-r border-black w-12 text-center">Game</th>
                        <th className="py-1 px-2 border-r border-black w-14 text-center">Set</th>
                        <th className="py-1 px-3 border-r border-black font-extrabold text-blue-900">
                          ⚡ Home Team (Breaks First)
                        </th>
                        <th className="py-1 px-2 border-r border-black w-20 text-center">Balls (0-7)</th>
                        <th className="py-1 px-2 border-r border-black w-16 text-center">8-Ball (+3)</th>
                        <th className="py-1 px-2 border-r-2 border-black w-16 text-center bg-gray-200 font-black">Home Score</th>
                        <th className="py-1 px-3 border-r border-black font-extrabold text-gray-900">
                          Visiting Team
                        </th>
                        <th className="py-1 px-2 border-r border-black w-20 text-center">Balls (0-7)</th>
                        <th className="py-1 px-2 border-r border-black w-16 text-center">8-Ball (+3)</th>
                        <th className="py-1 px-2 w-16 text-center bg-gray-200 font-black">Visitor Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black font-medium text-xs">
                      {/* Round 1 Section Header */}
                      <tr className="bg-gray-200 font-black text-xs border-y border-black">
                        <td colSpan={10} className="py-1 px-3 text-left">
                          <div className="flex justify-between items-center">
                            <span>
                              ROUND 1: {awayTeam?.name} (Visitor) vs {homeTeam?.name} (Home Team) {r1Games.length > 0 && `— Games ${r1Games[0].gameNumber}–${r1Games[r1Games.length - 1].gameNumber}`}
                            </span>
                            <span className="font-bold text-gray-800">
                              ⚡ {homeTeam?.name} Breaks First in all Round 1 games
                            </span>
                          </div>
                        </td>
                      </tr>
                      {r1Games.map((g) => (
                        <tr key={g.id} className="h-8">
                          <td className="py-1 px-2 border-r border-black text-center font-bold">
                            #{g.gameNumber}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center text-[10px] text-gray-600">
                            Round 1
                          </td>
                          <td className="py-1 px-3 border-r border-black font-bold">
                            <span className="text-blue-900 font-black mr-1">⚡</span>
                            {g.homePlayerName} {g.homeIsSub && '(Sub)'}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.homeScore ? g.homeScore.ballsPocketed : ''}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.homeScore?.sunk8Ball ? 'YES [✓]' : ''}
                          </td>
                          <td className="py-1 px-2 border-r-2 border-black text-center font-black text-sm bg-gray-50">
                            {g.completed && g.homeScore ? g.homeScore.totalPoints : ''}
                          </td>
                          <td className="py-1 px-3 border-r border-black font-bold">
                            {g.awayPlayerName} {g.awayIsSub && '(Sub)'}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.awayScore ? g.awayScore.ballsPocketed : ''}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.awayScore?.sunk8Ball ? 'YES [✓]' : ''}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-sm bg-gray-50">
                            {g.completed && g.awayScore ? g.awayScore.totalPoints : ''}
                          </td>
                        </tr>
                      ))}

                      {/* Distinct Round 2 Rematch Header Break */}
                      <tr className="bg-gray-300 font-black text-xs border-y-2 border-black">
                        <td colSpan={10} className="py-1.5 px-3 text-left tracking-wide">
                          <div className="flex justify-between items-center">
                            <span>
                              ROUND 2 REMATCH: {homeTeam?.name} (Visitor) vs {awayTeam?.name} (Home Team) {r2Games.length > 0 && `— Games ${r2Games[0].gameNumber}–${r2Games[r2Games.length - 1].gameNumber}`}
                            </span>
                            <span className="font-bold text-gray-800">
                              ⚡ {awayTeam?.name} Breaks First in all Round 2 games (Home/Visitor Swapped)
                            </span>
                          </div>
                        </td>
                      </tr>
                      {r2Games.map((g) => (
                        <tr key={g.id} className="h-8">
                          <td className="py-1 px-2 border-r border-black text-center font-bold">
                            #{g.gameNumber}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center text-[10px] text-gray-600">
                            Round 2
                          </td>
                          <td className="py-1 px-3 border-r border-black font-bold">
                            <span className="text-blue-900 font-black mr-1">⚡</span>
                            {g.homePlayerName} {g.homeIsSub && '(Sub)'}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.homeScore ? g.homeScore.ballsPocketed : ''}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.homeScore?.sunk8Ball ? 'YES [✓]' : ''}
                          </td>
                          <td className="py-1 px-2 border-r-2 border-black text-center font-black text-sm bg-gray-50">
                            {g.completed && g.homeScore ? g.homeScore.totalPoints : ''}
                          </td>
                          <td className="py-1 px-3 border-r border-black font-bold">
                            {g.awayPlayerName} {g.awayIsSub && '(Sub)'}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.awayScore ? g.awayScore.ballsPocketed : ''}
                          </td>
                          <td className="py-1 px-2 border-r border-black text-center">
                            {g.completed && g.awayScore?.sunk8Ball ? 'YES [✓]' : ''}
                          </td>
                          <td className="py-1 px-2 text-center font-black text-sm bg-gray-50">
                            {g.completed && g.awayScore ? g.awayScore.totalPoints : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100 border-t-2 border-black font-black text-xs">
                        <td colSpan={10} className="py-2 px-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-extrabold text-blue-900">
                              {homeTeam?.name}: {team1TotalMatchPoints} pts
                            </span>
                            <span className="text-gray-500 font-bold">Match Point Total</span>
                            <span className="font-extrabold text-gray-900">
                              {awayTeam?.name}: {team2TotalMatchPoints} pts
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Signatures footer */}
                  <div className="bg-gray-50 p-2 text-[10px] flex justify-between border-t border-black text-gray-700">
                    <div>Home Captain Signature: _______________________</div>
                    <div>Away Captain Signature: _______________________</div>
                    <div>Date Verified: _______________________</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
