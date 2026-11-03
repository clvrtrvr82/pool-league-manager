import React, { useMemo } from 'react';
import { Trophy, Shield, Award } from 'lucide-react';
import { TournamentData } from '../types';
import { computeTeamStandings } from '../utils/stats';

interface TeamStandingsProps {
  tournament: TournamentData;
}

export const TeamStandings: React.FC<TeamStandingsProps> = ({ tournament }) => {
  const standings = useMemo(() => computeTeamStandings(tournament), [tournament]);

  return (
    <div id="team-standings" className="space-y-6">
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-950 border border-amber-600/70 rounded-xl text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">League Team Standings</h2>
              <p className="text-xs text-slate-400">Ranked by Total Points accumulated across all matches</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {tournament.teams.length} Teams Competing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Team Name</th>
                <th className="py-3.5 px-4">Team Captain</th>
                <th className="py-3.5 px-4 text-center">Matches (W - L)</th>
                <th className="py-3.5 px-4 text-center">Games Won</th>
                <th className="py-3.5 px-4 text-right">Avg Pts / Game</th>
                <th className="py-3.5 px-4 text-right">Total Team Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {standings.map((team, idx) => (
                <tr key={team.teamId} className="hover:bg-slate-750/50 transition">
                  <td className="py-3.5 px-4 font-black">
                    {idx === 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <Award className="w-4 h-4" /> 1st
                      </span>
                    ) : idx === 1 ? (
                      <span className="text-slate-300">2nd</span>
                    ) : idx === 2 ? (
                      <span className="text-amber-600">3rd</span>
                    ) : (
                      <span className="text-slate-500">#{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white text-base">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>{team.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{team.captainName}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-emerald-400 font-bold">{team.matchesWon}</span>
                    <span className="text-slate-500"> - </span>
                    <span className="text-slate-400">{team.matchesLost}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-white font-bold">{team.gamesWon}</span>
                    <span className="text-slate-500 text-xs"> / {team.gamesPlayed}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                    {team.pointsPerGame.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-400 text-lg">
                    {team.totalPoints} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
