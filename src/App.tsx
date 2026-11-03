import React, { useState, useEffect } from 'react';
import {
  TournamentData,
  IndividualGame,
  GameScore,
} from './types';
import {
  loadTournamentFromStorage,
  saveTournamentToStorage,
  queueTournamentSave,
  fetchCurrentTournamentFromServer,
  fetchServerStatus,
  ServerDBStatus,
  exportTournamentToFile,
  importTournamentFromFile,
  createSampleTournament,
} from './utils/storage';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { StatsDashboard } from './components/StatsDashboard';
import { TeamStandings } from './components/TeamStandings';
import { TeamsRosterView } from './components/TeamsRosterView';
import { NewTournamentWizard } from './components/NewTournamentWizard';
import { ScoreEntryModal } from './components/ScoreEntryModal';
import { SubstituteModal } from './components/SubstituteModal';
import { InstallHelpModal } from './components/InstallHelpModal';
import { PrintableScoreSheet } from './components/PrintableScoreSheet';
import { RailwayDeployModal } from './components/RailwayDeployModal';
import { Check, Info, Monitor, AlertCircle } from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  const [tournament, setTournament] = useState<TournamentData>(() => {
    const saved = loadTournamentFromStorage();
    if (saved) return saved;
    return createSampleTournament();
  });

  const [activeTab, setActiveTab] = useState<'schedule' | 'stats' | 'standings' | 'teams'>('schedule');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // Modal States
  const [isNewWizardOpen, setIsNewWizardOpen] = useState(false);
  const [scoreModal, setScoreModal] = useState<{
    isOpen: boolean;
    game: IndividualGame | null;
    tableNumber: number;
  }>({
    isOpen: false,
    game: null,
    tableNumber: 1,
  });

  const [subModal, setSubModal] = useState<{
    isOpen: boolean;
    game: IndividualGame | null;
    side: 'home' | 'away';
  }>({
    isOpen: false,
    game: null,
    side: 'home',
  });

  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isRailwayModalOpen, setIsRailwayModalOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerDBStatus | null>(null);
  const [printableDayNumber, setPrintableDayNumber] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { isInstallable, install } = usePWAInstall();

  // Load status and check for server-stored tournament on boot
  useEffect(() => {
    fetchServerStatus().then((status) => {
      if (status) {
        setServerStatus(status);
      }
    });

    fetchCurrentTournamentFromServer().then((remoteData) => {
      if (remoteData && remoteData.config?.id) {
        setTournament(remoteData);
      }
    });
  }, []);

  const refreshServerStatus = () => {
    fetchServerStatus().then((status) => {
      if (status) {
        setServerStatus(status);
      }
    });
  };

  // Auto-save on any change to tournament (localStorage + Railway PostgreSQL debounced sync)
  useEffect(() => {
    if (tournament) {
      queueTournamentSave(tournament);
    }
  }, [tournament]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Score Saving Handler
  const handleSaveScore = (gameId: string, homeScore: GameScore, awayScore: GameScore) => {
    setTournament((prev) => {
      const updatedDays = prev.days.map((day) => {
        const updatedMatches = day.matches.map((match) => {
          const updatedGames = match.games.map((g) => {
            if (g.id === gameId) {
              return {
                ...g,
                homeScore,
                awayScore,
                completed: true,
              };
            }
            return g;
          });
          return { ...match, games: updatedGames };
        });
        return { ...day, matches: updatedMatches };
      });

      return {
        ...prev,
        days: updatedDays,
        config: { ...prev.config, lastModified: new Date().toISOString() },
      };
    });

    showToast(`Score recorded: ${homeScore.playerName} (${homeScore.totalPoints}) vs ${awayScore.playerName} (${awayScore.totalPoints})`);
  };

  // Clear single game score
  const handleClearGame = (gameId: string) => {
    let clearedGameNum: number | undefined;
    setTournament((prev) => {
      const updatedDays = prev.days.map((day) => {
        const updatedMatches = day.matches.map((match) => {
          const updatedGames = match.games.map((g) => {
            if (g.id === gameId) {
              clearedGameNum = g.gameNumber;
              return {
                ...g,
                homeScore: undefined,
                awayScore: undefined,
                completed: false,
              };
            }
            return g;
          });
          const allCompleted = updatedGames.length > 0 && updatedGames.every((g) => g.completed);
          return { ...match, games: updatedGames, isCompleted: allCompleted };
        });
        const allMatchesDone = updatedMatches.length > 0 && updatedMatches.every((m) => m.isCompleted);
        return { ...day, matches: updatedMatches, isCompleted: allMatchesDone };
      });

      return {
        ...prev,
        days: updatedDays,
        config: { ...prev.config, lastModified: new Date().toISOString() },
      };
    });

    showToast(clearedGameNum ? `Cleared score for Game #${clearedGameNum}.` : 'Score cleared.');
  };

  // Clear all games in a specific round of a match
  const handleClearRound = (matchId: string, roundNumber: number) => {
    let clearedCount = 0;
    setTournament((prev) => {
      const updatedDays = prev.days.map((day) => {
        const updatedMatches = day.matches.map((match) => {
          if (match.id !== matchId) return match;
          const updatedGames = match.games.map((g) => {
            if (g.roundNumber === roundNumber && g.completed) {
              clearedCount++;
              return {
                ...g,
                homeScore: undefined,
                awayScore: undefined,
                completed: false,
              };
            }
            return g;
          });
          const allCompleted = updatedGames.length > 0 && updatedGames.every((g) => g.completed);
          return { ...match, games: updatedGames, isCompleted: allCompleted };
        });
        const allMatchesDone = updatedMatches.length > 0 && updatedMatches.every((m) => m.isCompleted);
        return { ...day, matches: updatedMatches, isCompleted: allMatchesDone };
      });

      return {
        ...prev,
        days: updatedDays,
        config: { ...prev.config, lastModified: new Date().toISOString() },
      };
    });

    showToast(`Cleared ${clearedCount} score(s) in Round ${roundNumber}.`);
  };

  // Clear all games in a match
  const handleClearMatch = (matchId: string) => {
    let clearedCount = 0;
    setTournament((prev) => {
      const updatedDays = prev.days.map((day) => {
        const updatedMatches = day.matches.map((match) => {
          if (match.id !== matchId) return match;
          const updatedGames = match.games.map((g) => {
            if (g.completed) clearedCount++;
            return {
              ...g,
              homeScore: undefined,
              awayScore: undefined,
              completed: false,
            };
          });
          return { ...match, games: updatedGames, isCompleted: false };
        });
        return { ...day, matches: updatedMatches, isCompleted: false };
      });

      return {
        ...prev,
        days: updatedDays,
        config: { ...prev.config, lastModified: new Date().toISOString() },
      };
    });

    showToast(`Cleared ${clearedCount} match score(s).`);
  };

  // Clear all scores on a specific day
  const handleClearDay = (dayNumber: number) => {
    let clearedCount = 0;
    setTournament((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const updatedMatches = day.matches.map((match) => {
          const updatedGames = match.games.map((g) => {
            if (g.completed) clearedCount++;
            return {
              ...g,
              homeScore: undefined,
              awayScore: undefined,
              completed: false,
            };
          });
          return { ...match, games: updatedGames, isCompleted: false };
        });
        return { ...day, matches: updatedMatches, isCompleted: false };
      });

      return {
        ...prev,
        days: updatedDays,
        config: { ...prev.config, lastModified: new Date().toISOString() },
      };
    });

    showToast(`Cleared ${clearedCount} score(s) for Day ${dayNumber}.`);
  };

  // Clear all scores across the tournament
  const handleClearAll = () => {
    let clearedCount = 0;
    setTournament((prev) => {
      const updatedDays = prev.days.map((day) => {
        const updatedMatches = day.matches.map((match) => {
          const updatedGames = match.games.map((g) => {
            if (g.completed) clearedCount++;
            return {
              ...g,
              homeScore: undefined,
              awayScore: undefined,
              completed: false,
            };
          });
          return { ...match, games: updatedGames, isCompleted: false };
        });
        return { ...day, matches: updatedMatches, isCompleted: false };
      });

      return {
        ...prev,
        days: updatedDays,
        config: { ...prev.config, lastModified: new Date().toISOString() },
      };
    });

    showToast(`Cleared all ${clearedCount} score(s) across the tournament.`);
  };

  // Substitute Player Handler
  const handleApplySub = (
    gameId: string,
    side: 'home' | 'away',
    subName: string,
    applyToAllTonight: boolean
  ) => {
    setTournament((prev) => {
      const targetSubId = `sub-${Date.now()}`;
      
      // Determine the target player id being substituted
      let targetPlayerId = '';
      for (const day of prev.days) {
        for (const match of day.matches) {
          const foundGame = match.games.find((g) => g.id === gameId);
          if (foundGame) {
            targetPlayerId = side === 'home' ? foundGame.homePlayerId : foundGame.awayPlayerId;
            break;
          }
        }
        if (targetPlayerId) break;
      }

      const updatedDays = prev.days.map((day) => {
        const updatedMatches = day.matches.map((match) => {
          const updatedGames = match.games.map((g) => {
            if (applyToAllTonight) {
              // Replace player across all their games tonight (both Round 1 and Round 2)
              let updated = { ...g };
              if (g.homePlayerId === targetPlayerId) {
                updated.homePlayerName = subName;
                updated.homeIsSub = true;
                if (updated.homeScore) {
                  updated.homeScore = {
                    ...updated.homeScore,
                    playerName: subName,
                    isSubstitute: true,
                    substituteForId: targetPlayerId,
                  };
                }
              }
              if (g.awayPlayerId === targetPlayerId) {
                updated.awayPlayerName = subName;
                updated.awayIsSub = true;
                if (updated.awayScore) {
                  updated.awayScore = {
                    ...updated.awayScore,
                    playerName: subName,
                    isSubstitute: true,
                    substituteForId: targetPlayerId,
                  };
                }
              }
              return updated;
            } else if (g.id === gameId) {
              // Single game substitution
              if (side === 'home') {
                return {
                  ...g,
                  homePlayerName: subName,
                  homeIsSub: true,
                  homeScore: g.homeScore
                    ? {
                        ...g.homeScore,
                        playerName: subName,
                        isSubstitute: true,
                        substituteForId: g.homePlayerId,
                      }
                    : undefined,
                };
              } else {
                return {
                  ...g,
                  awayPlayerName: subName,
                  awayIsSub: true,
                  awayScore: g.awayScore
                    ? {
                        ...g.awayScore,
                        playerName: subName,
                        isSubstitute: true,
                        substituteForId: g.awayPlayerId,
                      }
                    : undefined,
                };
              }
            }
            return g;
          });

          return { ...match, games: updatedGames };
        });
        return { ...day, matches: updatedMatches };
      });

      const updatedSubs = [
        ...prev.substitutes,
        {
          id: targetSubId,
          originalPlayerId: targetPlayerId,
          subName,
          gameId,
          dayNumber: selectedDayNumber,
        },
      ];

      return {
        ...prev,
        days: updatedDays,
        substitutes: updatedSubs,
        config: { ...prev.config, lastModified: new Date().toISOString() },
      };
    });

    showToast(`Substitute "${subName}" assigned for tonight's play.`);
  };

  // Revert Substitute back to original roster player
  const handleRevertSub = (gameId: string, side: 'home' | 'away', applyToAllTonight: boolean) => {
    setTournament((prev) => {
      // Find original target player ID
      let targetPlayerId = '';
      for (const day of prev.days) {
        for (const match of day.matches) {
          const foundGame = match.games.find((g) => g.id === gameId);
          if (foundGame) {
            targetPlayerId = side === 'home' ? foundGame.homePlayerId : foundGame.awayPlayerId;
            break;
          }
        }
        if (targetPlayerId) break;
      }

      const allPlayers = prev.teams.flatMap((t) => t.players);

      const updatedDays = prev.days.map((day) => {
        const updatedMatches = day.matches.map((match) => {
          const updatedGames = match.games.map((g) => {
            if (applyToAllTonight) {
              let updated = { ...g };
              if (g.homePlayerId === targetPlayerId) {
                const orig = allPlayers.find((p) => p.id === g.homePlayerId);
                updated.homePlayerName = orig ? orig.name : g.homePlayerName;
                updated.homeIsSub = false;
              }
              if (g.awayPlayerId === targetPlayerId) {
                const orig = allPlayers.find((p) => p.id === g.awayPlayerId);
                updated.awayPlayerName = orig ? orig.name : g.awayPlayerName;
                updated.awayIsSub = false;
              }
              return updated;
            } else if (g.id === gameId) {
              if (side === 'home') {
                const orig = allPlayers.find((p) => p.id === g.homePlayerId);
                return {
                  ...g,
                  homePlayerName: orig ? orig.name : g.homePlayerName,
                  homeIsSub: false,
                };
              } else {
                const orig = allPlayers.find((p) => p.id === g.awayPlayerId);
                return {
                  ...g,
                  awayPlayerName: orig ? orig.name : g.awayPlayerName,
                  awayIsSub: false,
                };
              }
            }
            return g;
          });
          return { ...match, games: updatedGames };
        });
        return { ...day, matches: updatedMatches };
      });

      return {
        ...prev,
        days: updatedDays,
      };
    });

    showToast('Reverted to original roster player.');
  };

  // Toggle Day Completed
  const handleToggleDayCompleted = (dayNumber: number) => {
    setTournament((prev) => {
      const updatedDays = prev.days.map((d) => {
        if (d.dayNumber === dayNumber) {
          return { ...d, isCompleted: !d.isCompleted };
        }
        return d;
      });
      return { ...prev, days: updatedDays };
    });
  };

  // Update Player Name throughout tournament
  const handleUpdatePlayerName = (playerId: string, newName: string) => {
    setTournament((prev) => {
      const updatedTeams = prev.teams.map((t) => ({
        ...t,
        players: t.players.map((p) => (p.id === playerId ? { ...p, name: newName } : p)),
      }));

      const updatedDays = prev.days.map((day) => ({
        ...day,
        matches: day.matches.map((match) => ({
          ...match,
          games: match.games.map((g) => {
            let hp = g.homePlayerName;
            let ap = g.awayPlayerName;
            if (g.homePlayerId === playerId && !g.homeIsSub) hp = newName;
            if (g.awayPlayerId === playerId && !g.awayIsSub) ap = newName;
            return {
              ...g,
              homePlayerName: hp,
              awayPlayerName: ap,
            };
          }),
        })),
      }));

      return {
        ...prev,
        teams: updatedTeams,
        days: updatedDays,
      };
    });
    showToast(`Updated player name to "${newName}"`);
  };

  // Update Team Name throughout tournament
  const handleUpdateTeamName = (teamId: string, newName: string) => {
    setTournament((prev) => {
      const updatedTeams = prev.teams.map((t) =>
        t.id === teamId ? { ...t, name: newName } : t
      );
      return { ...prev, teams: updatedTeams };
    });
    showToast(`Updated team name to "${newName}"`);
  };

  // Save to computer file (.json)
  const handleSaveToComputer = () => {
    exportTournamentToFile(tournament);
    showToast(`Saved "${tournament.config.name}" to your computer!`);
  };

  // Open from computer file (.json)
  const handleOpenFromFile = async (file: File) => {
    try {
      const data = await importTournamentFromFile(file);
      setTournament(data);
      setSelectedDayNumber(1);
      showToast(`Successfully opened "${data.config.name}"!`);
    } catch (err) {
      alert(`Error loading file: ${err instanceof Error ? err.message : 'Invalid tournament file'}`);
    }
  };

  // Load sample demo
  const handleLoadSample = () => {
    if (window.confirm('Load sample 4-team pool league with ready-made schedule and Week 1 scores?')) {
      const sample = createSampleTournament();
      setTournament(sample);
      setSelectedDayNumber(1);
      showToast('Loaded demo tournament!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-5 h-5 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        tournament={tournament}
        activeTab={activeTab}
        serverStatus={serverStatus}
        onTabChange={setActiveTab}
        onOpenNewWizard={() => setIsNewWizardOpen(true)}
        onSaveToComputer={handleSaveToComputer}
        onOpenFromFile={handleOpenFromFile}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenRailwayModal={() => setIsRailwayModalOpen(true)}
        onLoadSample={handleLoadSample}
      />

      {/* Quick Desktop Install Banner (if installable and not installed) */}
      {isInstallable && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-700/40 py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-emerald-300">
              <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Want a <strong>desktop icon</strong> to double-click and open anytime?
              </span>
            </div>
            <button
              onClick={() => install()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md transition whitespace-nowrap"
            >
              Install to Desktop
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {activeTab === 'schedule' && (
          <ScheduleView
            tournament={tournament}
            selectedDayNumber={selectedDayNumber}
            onSelectDay={setSelectedDayNumber}
            onOpenScoreModal={(game, tableNumber) =>
              setScoreModal({ isOpen: true, game, tableNumber })
            }
            onOpenSubModal={(game, side) => setSubModal({ isOpen: true, game, side })}
            onPrintDay={(dayNum) => setPrintableDayNumber(dayNum)}
            onToggleDayCompleted={handleToggleDayCompleted}
            onClearGame={handleClearGame}
            onClearRound={handleClearRound}
            onClearMatch={handleClearMatch}
            onClearDay={handleClearDay}
            onClearAll={handleClearAll}
          />
        )}

        {activeTab === 'stats' && <StatsDashboard tournament={tournament} />}

        {activeTab === 'standings' && <TeamStandings tournament={tournament} />}

        {activeTab === 'teams' && (
          <TeamsRosterView
            tournament={tournament}
            onUpdatePlayerName={handleUpdatePlayerName}
            onUpdateTeamName={handleUpdateTeamName}
          />
        )}
      </main>

      {/* Pop-up Modals */}
      <NewTournamentWizard
        isOpen={isNewWizardOpen}
        onClose={() => setIsNewWizardOpen(false)}
        onCreated={(newTournament) => {
          setTournament(newTournament);
          setSelectedDayNumber(1);
          setActiveTab('schedule');
          showToast(`Tournament "${newTournament.config.name}" created!`);
        }}
      />

      <ScoreEntryModal
        isOpen={scoreModal.isOpen}
        game={scoreModal.game}
        tableNumber={scoreModal.tableNumber}
        dayNumber={selectedDayNumber}
        onClose={() => setScoreModal({ isOpen: false, game: null, tableNumber: 1 })}
        onSaveScore={handleSaveScore}
        onClearGame={handleClearGame}
        onClearRound={handleClearRound}
        onClearMatch={handleClearMatch}
        onClearDay={handleClearDay}
        onClearAll={handleClearAll}
      />

      <SubstituteModal
        isOpen={subModal.isOpen}
        game={subModal.game}
        side={subModal.side}
        tournament={tournament}
        onClose={() => setSubModal({ isOpen: false, game: null, side: 'home' })}
        onApplySub={handleApplySub}
        onRevertSub={handleRevertSub}
      />

      <InstallHelpModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      <RailwayDeployModal
        isOpen={isRailwayModalOpen}
        onClose={() => setIsRailwayModalOpen(false)}
        serverStatus={serverStatus}
        onRefreshStatus={refreshServerStatus}
      />

      <PrintableScoreSheet
        isOpen={printableDayNumber !== null}
        tournament={tournament}
        dayNumber={printableDayNumber || 1}
        onClose={() => setPrintableDayNumber(null)}
      />
    </div>
  );
}
