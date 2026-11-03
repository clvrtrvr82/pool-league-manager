import React, { useState } from 'react';
import {
  X,
  Database,
  GitBranch,
  ExternalLink,
  Check,
  Copy,
  Server,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { ServerDBStatus } from '../utils/storage';

interface RailwayDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverStatus: ServerDBStatus | null;
  onRefreshStatus: () => void;
}

export const RailwayDeployModal: React.FC<RailwayDeployModalProps> = ({
  isOpen,
  onClose,
  serverStatus,
  onRefreshStatus,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [repoUrl, setRepoUrl] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const gitUrlToUse = repoUrl.trim() || 'https://github.com/YOUR_USERNAME/pool-league-manager.git';

  const gitCommands = [
    `git init -b main`,
    `git add .`,
    `git commit -m "Deploy Pool League Manager with Railway and PostgreSQL"`,
    `git remote add origin ${gitUrlToUse}`,
    `git push -u origin main`,
  ].join('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-emerald-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center shadow-lg">
              <Cloud className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Deploy to Railway & GitHub
              </h2>
              <p className="text-xs text-slate-400">
                Full-Stack App + PostgreSQL Database setup guide
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Current Live Database Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
            serverStatus?.type === 'postgres' && serverStatus.connected
              ? 'bg-emerald-950/40 border-emerald-500/40'
              : 'bg-slate-800/60 border-slate-700'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                serverStatus?.type === 'postgres' && serverStatus.connected
                  ? 'bg-emerald-900/60 text-emerald-400'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white">Database Status</h4>
                  {serverStatus?.type === 'postgres' && serverStatus.connected ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PostgreSQL Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Local / Preview Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {serverStatus?.message || 'Server database online and saving data.'}
                </p>
                {serverStatus?.type !== 'postgres' && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    When running on Railway with the PostgreSQL database plugin added, Railway automatically connects via <code className="text-emerald-400 font-mono">DATABASE_URL</code>.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onRefreshStatus}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Ping server status"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Check
            </button>
          </div>

          {/* Step 1: Push to GitHub */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <h3>Publish to Your GitHub Repository</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create an empty repository on{' '}
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                github.com/new <ExternalLink className="w-3 h-3" />
              </a>{' '}
              (e.g., <code className="text-purple-300 font-mono">pool-league-manager</code>), then run these commands in your project terminal:
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste your GitHub repo URL here (optional)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="relative group bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                <pre>{gitCommands}</pre>
                <button
                  onClick={() => handleCopy(gitCommands, 1)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-sans font-semibold flex items-center gap-1.5 border border-slate-700 transition shadow"
                >
                  {copiedIndex === 1 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Git Commands
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Deploy on Railway */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              <h3>Connect Repository in Railway</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
              <li>
                Go to{' '}
                <a
                  href="https://railway.app/new"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline font-semibold inline-flex items-center gap-1"
                >
                  railway.app/new <ExternalLink className="w-3 h-3" />
                </a>{' '}
                and click <strong>"Deploy from GitHub repo"</strong>.
              </li>
              <li>
                Select your <strong>pool-league-manager</strong> repository.
              </li>
              <li>
                Railway will automatically read our included <code className="text-emerald-300 font-mono">railway.json</code> configuration, build the full-stack app, and launch your server!
              </li>
            </ol>
          </div>

          {/* Step 3: Add PostgreSQL Database */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              <h3>Add PostgreSQL Database on Railway (1-Click)</h3>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
              <li>
                In your Railway Project canvas, click the <strong>"+ New"</strong> button (or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl/Cmd + K</kbd>).
              </li>
              <li>
                Choose <strong>"Database"</strong> → <strong>"Add PostgreSQL"</strong>.
              </li>
              <li>
                <strong>Done!</strong> Railway automatically provisions the PostgreSQL database and wires the <code className="text-teal-300 font-mono">DATABASE_URL</code> variable directly into your web service.
              </li>
              <li>
                The app will automatically create the tables (<code className="text-teal-300 font-mono">tournaments</code>) and persist all scores, teams, player stats, and schedules forever!
              </li>
            </ol>
          </div>

          {/* Included Files info */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-purple-400" /> Pre-Configured Railway Files in this Project:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> <code className="font-mono text-slate-300">railway.json</code> (Nixpacks deploy config)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> <code className="font-mono text-slate-300">server.ts</code> (Express API + static server)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> <code className="font-mono text-slate-300">src/server/db.ts</code> (PostgreSQL + auto-migration)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> <code className="font-mono text-slate-300">Procfile</code> &amp; <code className="font-mono text-slate-300">Dockerfile</code> (Universal container support)
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Pushing commits to GitHub will automatically trigger new builds on Railway.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
