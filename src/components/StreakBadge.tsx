import React from 'react';
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PlayerGameRecord } from '../types';

interface StreakBadgeProps {
  currentStreak: {
    type: 'W' | 'L' | '-';
    count: number;
  };
  longestWinStreak?: number;
  gameLog?: PlayerGameRecord[];
  showTrend?: boolean;
  maxTrendCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  currentStreak,
  longestWinStreak,
  gameLog,
  showTrend = false,
  maxTrendCount = 5,
  size = 'sm',
  showLabel = false,
  className = '',
}) => {
  const { type, count } = currentStreak;

  // Determine styling based on win vs loss and magnitude
  let badgeClasses = '';
  let icon = null;
  let text = '—';
  let title = 'No games recorded';

  if (type === 'W') {
    if (count >= 4) {
      // Hot Hand Streak (4+ Wins) - Glowing / high intensity
      badgeClasses =
        'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-xs shadow-emerald-500/30 ring-1 ring-emerald-400/40';
      icon = <Flame className={size === 'xs' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />;
      text = `W${count}`;
      title = `Hot Streak: ${count} consecutive wins!`;
    } else if (count >= 2) {
      // Solid Win Streak (2-3 Wins) - Bright emerald
      badgeClasses =
        'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 shadow-xs';
      icon = <TrendingUp className={size === 'xs' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />;
      text = `W${count}`;
      title = `Win Streak: ${count} wins in a row`;
    } else {
      // 1 Win - Clean emerald tint
      badgeClasses =
        'bg-emerald-950/60 text-emerald-400 border-emerald-700/60';
      icon = <TrendingUp className={size === 'xs' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />;
      text = `W1`;
      title = `Won last game (1 win streak)`;
    }
  } else if (type === 'L') {
    if (count >= 3) {
      // Cold Slump (3+ Losses) - Deep warning rose
      badgeClasses =
        'bg-rose-950/95 text-rose-200 border-rose-500/90 shadow-xs shadow-rose-900/40 ring-1 ring-rose-500/30';
      icon = <span className={size === 'xs' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]'}>❄️</span>;
      text = `L${count}`;
      title = `Slump: ${count} consecutive losses`;
    } else if (count === 2) {
      // 2 Losses - Warning rose
      badgeClasses =
        'bg-rose-950/80 text-rose-300 border-rose-600/70';
      icon = <TrendingDown className={size === 'xs' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />;
      text = `L2`;
      title = `Loss Streak: 2 losses in a row`;
    } else {
      // 1 Loss - Muted rose
      badgeClasses =
        'bg-rose-950/50 text-rose-400 border-rose-800/60';
      icon = <TrendingDown className={size === 'xs' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />;
      text = `L1`;
      title = `Lost last game (1 loss streak)`;
    }
  } else {
    // Neutral
    badgeClasses = 'bg-slate-850 text-slate-500 border-slate-700/60';
    icon = <Minus className="w-2.5 h-2.5" />;
    text = '—';
    title = 'No active streak';
  }

  // Size padding
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-0.5 rounded',
    sm: 'px-2 py-0.5 text-xs gap-1 rounded-md',
    md: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    lg: 'px-3 py-1.5 text-sm gap-2 rounded-xl',
  }[size];

  // Recent form trail (e.g. last 5 games)
  const recentGames = gameLog && gameLog.length > 0 ? gameLog.slice(-maxTrendCount) : [];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Primary Color-Coded Streak Badge */}
      <span
        title={title}
        className={`inline-flex items-center font-black tracking-tight border uppercase transition cursor-default select-none ${badgeClasses} ${sizeClasses}`}
      >
        {icon}
        <span>{text}</span>
        {showLabel && (
          <span className="opacity-80 text-[9px] font-bold tracking-normal lowercase ml-0.5">
            {type === 'W' ? (count >= 3 ? 'hot' : 'streak') : type === 'L' ? (count >= 3 ? 'slump' : 'streak') : ''}
          </span>
        )}
      </span>

      {/* Visual Form Sequence (Recent W/L dots/pills) */}
      {showTrend && recentGames.length > 0 && (
        <div className="flex items-center gap-1" title={`Recent ${recentGames.length} games (oldest to newest)`}>
          {recentGames.map((game, i) => {
            const isWin = game.isWinner;
            const tooltip = `Wk ${game.dayNumber} (T${game.tableNumber}): ${
              isWin ? 'Won' : 'Lost'
            } ${game.myScore}-${game.opponentScore} vs ${game.opponentName}${
              game.sunk8Ball ? ' (8-ball sunk 🎱)' : ''
            }`;

            return (
              <span
                key={game.gameId || i}
                title={tooltip}
                className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-[9px] cursor-help transition transform hover:scale-110 select-none shadow-2xs ${
                  isWin
                    ? 'bg-emerald-500 text-slate-950 border border-emerald-300'
                    : 'bg-rose-600 text-white border border-rose-400'
                }`}
              >
                {isWin ? 'W' : 'L'}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
