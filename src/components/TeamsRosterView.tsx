import React, { useState } from 'react';
import { Users, Award, UserCheck, Phone, Edit2, Check, X } from 'lucide-react';
import { Player, Team, TournamentData } from '../types';

interface TeamsRosterViewProps {
  tournament: TournamentData;
  onUpdatePlayerName: (playerId: string, newName: string) => void;
  onUpdateTeamName: (teamId: string, newName: string) => void;
}

export const TeamsRosterView: React.FC<TeamsRosterViewProps> = ({
  tournament,
  onUpdatePlayerName,
  onUpdateTeamName,
}) => {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState('');

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [tempTeamName, setTempTeamName] = useState('');

  const handleStartEditPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setTempPlayerName(player.name);
  };

  const handleSavePlayerName = (playerId: string) => {
    if (tempPlayerName.trim()) {
      onUpdatePlayerName(playerId, tempPlayerName.trim());
    }
    setEditingPlayerId(null);
  };

  const handleStartEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setTempTeamName(team.name);
  };

  const handleSaveTeamName = (teamId: string) => {
    if (tempTeamName.trim()) {
      onUpdateTeamName(teamId, tempTeamName.trim());
    }
    setEditingTeamId(null);
  };

  return (
    <div id="teams-roster-view" className="space-y-6">
      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tournament.teams.map((team, tIdx) => (
          <div
            key={team.id}
            className="bg-slate-800/90 border-2 border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
          >
            <div>
              {/* Team Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/70 mb-4">
                {editingTeamId === team.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={tempTeamName}
                      onChange={(e) => setTempTeamName(e.target.value)}
                      className="bg-slate-900 border border-emerald-500 rounded-lg px-2.5 py-1 text-base font-bold text-white outline-hidden flex-1"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveTeamName(team.id)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTeamId(null)}
                      className="p-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                        {tIdx + 1}
                      </span>
                      <h3 className="text-xl font-black text-white">{team.name}</h3>
                    </div>
                    <button
                      onClick={() => handleStartEditTeam(team)}
                      className="text-xs text-slate-400 hover:text-emerald-400 p-1 rounded-md"
                      title="Rename team"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Players List */}
              <div className="space-y-2.5">
                {team.players.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 bg-slate-900/80 border border-slate-700/70 rounded-xl flex items-center justify-between"
                  >
                    {editingPlayerId === player.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={tempPlayerName}
                          onChange={(e) => setTempPlayerName(e.target.value)}
                          className="bg-slate-800 border border-emerald-500 rounded-lg px-2 py-1 text-sm text-white font-medium outline-hidden flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePlayerName(player.id)}
                          className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-500"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPlayerId(null)}
                          className="p-1 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          {player.isCaptain ? (
                            <span className="p-1 bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/40" title="Team Captain">
                              <Award className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs flex items-center justify-center font-bold">
                              •
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-slate-100 text-sm">{player.name}</span>
                            {player.isCaptain && (
                              <span className="ml-2 text-[10px] text-amber-300 font-bold bg-amber-950 px-1.5 py-0.5 rounded-sm border border-amber-800">
                                CAPTAIN
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {player.phone && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {player.phone}
                            </span>
                          )}
                          <button
                            onClick={() => handleStartEditPlayer(player)}
                            className="p-1 text-slate-400 hover:text-white"
                            title="Edit Player Name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
              <span>{team.players.length} Active Roster Players</span>
              <span className="text-emerald-400 font-semibold">Table Ready</span>
            </div>
          </div>
        ))}
      </div>

      {/* Substitutes Log Section */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-amber-950 border border-amber-600/60 rounded-xl text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Substitute Players Log</h3>
            <p className="text-xs text-slate-400">
              Record of all guest / fill-in substitute players who played in league matches.
            </p>
          </div>
        </div>

        {tournament.substitutes.length === 0 ? (
          <div className="text-xs text-slate-400 italic bg-slate-900/60 p-4 rounded-xl border border-slate-700">
            No substitute players have been needed yet. When a regular player cannot attend a pool day, click the &quot;Sub&quot; button next to their name in the schedule to record a substitute player!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tournament.substitutes.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{sub.subName}</div>
                  <div className="text-slate-400 text-[11px]">Day {sub.dayNumber} Pool Play</div>
                </div>
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 font-bold rounded-md border border-amber-700 text-[10px]">
                  SUB
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
