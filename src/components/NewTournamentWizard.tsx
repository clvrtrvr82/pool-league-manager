import React, { useState } from 'react';
import { Calendar, Users, TableProperties, Award, ArrowRight, ArrowLeft, Check, Sparkles, X } from 'lucide-react';
import { Team, TournamentConfig, TournamentData } from '../types';
import { generateTournamentSchedule } from '../utils/scheduler';

interface NewTournamentWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (tournament: TournamentData) => void;
}

const DAYS_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_TEAM_NAMES = [
  'Rack Runners',
  '8-Ball Hustlers',
  'Corner Pocket Aces',
  'Break & Run Masters',
  'Cue Ball Wizards',
  'Chalk It Up',
  'Side Pocket Snipers',
  'Table Sweepers',
];

const DEFAULT_SAMPLE_PLAYERS = [
  ['Frank Reynolds', 'Dennis Reynolds', 'Charlie Kelly', 'Mac McDonald'],
  ['Hank Hill', 'Dale Gribble', 'Bill Dauterive', 'Jeff Boomhauer'],
  ['Walter Sobchak', 'The Dude Lebowski', 'Donny Kerabatsos', 'Jesus Quintana'],
  ['Ron Swanson', 'Tom Haverford', 'Andy Dwyer', 'Ben Wyatt'],
  ['Dwight Schrute', 'Jim Halpert', 'Stanley Hudson', 'Michael Scott'],
  ['Archie Bunker', 'George Jefferson', 'Fred Sanford', 'Barney Fife'],
  ['Tony Soprano', 'Paulie Gualtieri', 'Silvio Dante', 'Christopher Moltisanti'],
  ['Vince Lombardi', 'Mike Ditka', 'John Madden', 'Bill Cowher'],
];

export const NewTournamentWizard: React.FC<NewTournamentWizardProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [step, setStep] = useState<number>(1);

  // Question answers
  const [tournamentName, setTournamentName] = useState('Wednesday Night 8-Ball League');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    // Default to next Wednesday or today
    d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7 || 7));
    return d.toISOString().slice(0, 10);
  });
  const [poolDaysPerWeek, setPoolDaysPerWeek] = useState(1);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>(['Wednesday']);
  const [totalPoolDays, setTotalPoolDays] = useState(8);
  const [numTables, setNumTables] = useState(2);
  const [numTeams, setNumTeams] = useState(4);
  const [playersPerTeam, setPlayersPerTeam] = useState(3);

  // Dynamic Teams and Player names
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [playerNames, setPlayerNames] = useState<string[][]>([]);

  if (!isOpen) return null;

  // Sync team & player matrices when reaching step 4 or 5
  const initializeRosters = () => {
    const newTeamNames: string[] = [];
    const newPlayerNames: string[][] = [];

    for (let t = 0; t < numTeams; t++) {
      newTeamNames.push(teamNames[t] || DEFAULT_TEAM_NAMES[t % DEFAULT_TEAM_NAMES.length] || `Team ${t + 1}`);
      const teamPlayers: string[] = [];
      const sampleTeam = DEFAULT_SAMPLE_PLAYERS[t % DEFAULT_SAMPLE_PLAYERS.length] || [];
      for (let p = 0; p < playersPerTeam; p++) {
        teamPlayers.push(
          playerNames[t]?.[p] || sampleTeam[p] || (p === 0 ? `Captain ${t + 1}` : `Player ${p + 1}`)
        );
      }
      newPlayerNames.push(teamPlayers);
    }
    setTeamNames(newTeamNames);
    setPlayerNames(newPlayerNames);
  };

  const handleToggleDay = (day: string) => {
    if (selectedDaysOfWeek.includes(day)) {
      if (selectedDaysOfWeek.length > 1) {
        setSelectedDaysOfWeek(selectedDaysOfWeek.filter((d) => d !== day));
      }
    } else {
      setSelectedDaysOfWeek([...selectedDaysOfWeek, day]);
    }
  };

  const handleGoToNextStep = () => {
    if (step === 3) {
      initializeRosters();
    }
    setStep(step + 1);
  };

  const handleFinish = () => {
    const finalTeams: Team[] = [];

    for (let t = 0; t < numTeams; t++) {
      const teamId = `team-${t + 1}`;
      const tName = teamNames[t] || `Team ${t + 1}`;
      const playersList = [];

      for (let p = 0; p < playersPerTeam; p++) {
        const playerId = `t${t + 1}-p${p + 1}`;
        const pName = playerNames[t]?.[p] || (p === 0 ? `Player ${p + 1} (Captain)` : `Player ${p + 1}`);
        playersList.push({
          id: playerId,
          name: pName,
          teamId,
          isCaptain: p === 0, // Player 1 is always Captain
        });
      }

      finalTeams.push({
        id: teamId,
        name: tName,
        captainId: playersList[0].id,
        players: playersList,
      });
    }

    const config: TournamentConfig = {
      id: 'tourney-' + Date.now(),
      name: tournamentName.trim() || 'Pool League Tournament',
      startDate,
      poolDaysPerWeek,
      selectedDaysOfWeek,
      totalPoolDays,
      numTables,
      numTeams,
      playersPerTeam,
      pointsPerBall: 1,
      pointsFor8Ball: 3,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const days = generateTournamentSchedule(config, finalTeams);

    const tournament: TournamentData = {
      config,
      teams: finalTeams,
      days,
      substitutes: [],
    };

    onCreated(tournament);
    onClose();
  };

  return (
    <div id="new-tournament-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 overflow-y-auto backdrop-blur-xs">
      <div className="bg-slate-900 border-2 border-emerald-600/50 rounded-2xl max-w-2xl w-full p-5 sm:p-8 shadow-2xl text-slate-100 relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-400 mb-2">
            <span>New Tournament Setup</span>
            <span>Step {step} of 5</span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Tournament Name & Start Date */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <Award className="w-7 h-7 text-emerald-400" /> Tournament Name &amp; Start Date
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Let&apos;s start with the basic details for your pool league.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-semibold text-slate-200 mb-1">
                  League or Tournament Name
                </label>
                <input
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-lg text-white font-medium outline-hidden"
                  placeholder="e.g. Wednesday Night 8-Ball League"
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-slate-200 mb-1">
                  When does the tournament start?
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-lg text-white font-medium outline-hidden"
                  />
                  <Calendar className="w-5 h-5 text-slate-400 absolute right-4 top-4 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Matches will begin on or after this date.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pool Days & Schedule Duration */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <Calendar className="w-7 h-7 text-emerald-400" /> Pool Days &amp; Total Weeks
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Configure which days your league gathers to play.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-base font-semibold text-slate-200 mb-2">
                  How many Pool Days per week?
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPoolDaysPerWeek(num)}
                      className={`py-3 text-center text-lg font-bold rounded-xl border-2 transition ${
                        poolDaysPerWeek === num
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {num} {num === 1 ? 'Day' : 'Days'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-slate-200 mb-2">
                  Which day(s) are the Pool Days on?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DAYS_OPTIONS.map((day) => {
                    const isSelected = selectedDaysOfWeek.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-emerald-600/90 border-emerald-400 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{day}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-200" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-slate-200 mb-1">
                  How many Pool Days (Total Weeks of Play)?
                </label>
                <div className="flex items-center gap-3">
                  {[6, 8, 10, 12, 16].map((weeks) => (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => setTotalPoolDays(weeks)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-base transition ${
                        totalPoolDays === weeks
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {weeks}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-sm text-slate-400">Or custom number:</span>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={totalPoolDays}
                    onChange={(e) => setTotalPoolDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-center text-white font-bold"
                  />
                  <span className="text-sm text-slate-400">days total</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Tables, Teams & Players Per Team */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <TableProperties className="w-7 h-7 text-emerald-400" /> Tables, Teams &amp; Players
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Define the size and layout of your tournament.
              </p>
            </div>

            <div className="space-y-5">
              {/* Question: How many tables are you using? */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <label className="block text-base font-semibold text-slate-200 mb-2">
                  How many pool tables are you using?
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 6, 8].map((tbl) => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setNumTables(tbl)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-base transition ${
                        numTables === tbl
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {tbl}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-emerald-400/90 mt-2">
                  ✓ Matches and shifts will be evenly distributed across Table 1 to Table {numTables}.
                </p>
              </div>

              {/* Question: How many teams? */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <label className="block text-base font-semibold text-slate-200 mb-2">
                  How many teams are participating?
                </label>
                <div className="flex items-center gap-3">
                  {[4, 6, 8, 10].map((teamsCount) => (
                    <button
                      key={teamsCount}
                      type="button"
                      onClick={() => setNumTeams(teamsCount)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-base transition ${
                        numTeams === teamsCount
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {teamsCount} Teams
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-sm text-slate-400">Custom team count:</span>
                  <input
                    type="number"
                    min="2"
                    max="16"
                    value={numTeams}
                    onChange={(e) => setNumTeams(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-center text-white font-bold"
                  />
                </div>
              </div>

              {/* Question: How many players per team? */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80">
                <label className="block text-base font-semibold text-slate-200 mb-2">
                  How many players per team?
                </label>
                <div className="flex items-center gap-3">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPlayersPerTeam(count)}
                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-base transition ${
                        playersPerTeam === count
                          ? 'bg-emerald-600 border-emerald-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Player 1 will automatically be designated as Captain for each team.
                </p>

                {/* Match Format & Break Rules Info Box */}
                <div className="mt-3 p-3 bg-slate-900 border border-emerald-700/60 rounded-xl text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>⚡ Weekly Match Structure &amp; Break Rules:</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <strong className="text-white">Round 1:</strong> Team 2 vs Team 1 (Home). Each player of each team plays each player of the opposing team once. <strong>Home team breaks first.</strong>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <strong className="text-white">Round 2:</strong> Team 1 vs Team 2 (Home). Teams alternate home/visiting. Each player plays each opponent once. <strong>Home team breaks first.</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Team Names */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                  <Users className="w-7 h-7 text-emerald-400" /> Name Your Teams
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  You can keep the suggested team names or rename them to your local favorites.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTeamNames(DEFAULT_TEAM_NAMES.slice(0, numTeams));
                }}
                className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Reset Names
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
              {Array.from({ length: numTeams }).map((_, idx) => (
                <div key={idx} className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl">
                  <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    Team {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={teamNames[idx] || ''}
                    onChange={(e) => {
                      const updated = [...teamNames];
                      updated[idx] = e.target.value;
                      setTeamNames(updated);
                    }}
                    placeholder={`Team ${idx + 1}`}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-lg px-3 py-2 text-white font-medium outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Player Names (Player 1 is Captain) */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Award className="w-7 h-7 text-emerald-400" /> Enter Player Names
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  Player 1 of every team is always the <strong>Captain</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const prefilled: string[][] = [];
                  for (let t = 0; t < numTeams; t++) {
                    const sample = DEFAULT_SAMPLE_PLAYERS[t % DEFAULT_SAMPLE_PLAYERS.length] || [];
                    const row: string[] = [];
                    for (let p = 0; p < playersPerTeam; p++) {
                      row.push(sample[p] || (p === 0 ? `Captain Team ${t + 1}` : `Player ${p + 1}`));
                    }
                    prefilled.push(row);
                  }
                  setPlayerNames(prefilled);
                }}
                className="text-xs px-3 py-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" /> Fill Sample Names
              </button>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {Array.from({ length: numTeams }).map((_, tIdx) => (
                <div key={tIdx} className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl">
                  <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      {tIdx + 1}
                    </span>
                    {teamNames[tIdx] || `Team ${tIdx + 1}`}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from({ length: playersPerTeam }).map((__, pIdx) => {
                      const isCaptain = pIdx === 0;
                      return (
                        <div key={pIdx}>
                          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                            <span>
                              {isCaptain ? '★ Player 1 (Captain)' : `Player ${pIdx + 1}`}
                            </span>
                            {isCaptain && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-sm border border-amber-500/30">
                                CAPTAIN
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={playerNames[tIdx]?.[pIdx] || ''}
                            onChange={(e) => {
                              const updated = playerNames.map((row) => [...row]);
                              if (!updated[tIdx]) updated[tIdx] = [];
                              updated[tIdx][pIdx] = e.target.value;
                              setPlayerNames(updated);
                            }}
                            placeholder={isCaptain ? 'Captain Name' : `Player ${pIdx + 1} Name`}
                            className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-white outline-hidden ${
                              isCaptain ? 'border-amber-500/50 focus:border-amber-400' : 'border-slate-700 focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 font-bold hover:bg-slate-700 flex items-center gap-2 text-sm sm:text-base transition"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-semibold transition"
            >
              Cancel
            </button>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleGoToNextStep}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 text-base shadow-lg shadow-emerald-950 transition"
            >
              Next Step <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-2 text-base shadow-xl transition"
            >
              <Check className="w-5 h-5 stroke-[3]" /> Create Tournament &amp; Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
