import React from 'react';
import { Monitor, X, Download, MousePointerClick, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallHelpModal: React.FC<InstallHelpModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div id="install-help-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-emerald-600/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-950 border border-emerald-600 rounded-xl text-emerald-400">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Double-Click Desktop App Setup</h2>
            <p className="text-sm text-slate-400">Run Pool League Manager right from your computer desktop</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold text-emerald-400 text-base mb-2 flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" /> How to launch with a Desktop Icon:
            </h3>
            {isInstalled ? (
              <div className="flex items-start gap-2 text-emerald-300 bg-emerald-950/60 p-3 rounded-lg border border-emerald-700/50">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  <strong>Already installed!</strong> Look for the <strong>Pool League Manager</strong> icon on your desktop or application launcher. Double-click it anytime to run offline!
                </p>
              </div>
            ) : isInstallable ? (
              <div className="space-y-3">
                <p>
                  Click the button below to install this app directly to your desktop. Windows / Mac will place the 8-Ball icon directly onto your desktop.
                </p>
                <button
                  onClick={async () => {
                    await install();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-base shadow-lg transition"
                >
                  <Download className="w-5 h-5" /> Install App to Desktop Now
                </button>
              </div>
            ) : isIOS ? (
              <p>
                On iPad/iPhone: Tap the <strong>Share</strong> button in Safari, then tap <strong>&quot;Add to Home Screen&quot;</strong>.
              </p>
            ) : (
              <div className="space-y-2">
                <p>
                  <strong>Option A:</strong> Look at your browser&apos;s address bar (at the top right in Chrome or Edge) for the small <strong>&ldquo;Install Pool League&rdquo;</strong> computer icon and click it.
                </p>
                <p>
                  <strong>Option B:</strong> Click the browser menu (<strong>⋮</strong> three dots) &gt; <strong>Save and share</strong> &gt; <strong>Install page as app</strong> or <strong>Create shortcut...</strong> (Check &quot;Open as window&quot;).
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 space-y-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Save &amp; Open Your League Data
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>
                <strong>Automatic Backup:</strong> Every score entered is immediately saved to your computer&apos;s local storage.
              </li>
              <li>
                <strong>Save to Computer (.json file):</strong> Click &ldquo;Save to Computer&rdquo; anytime to export a backup file you can keep in your Documents or email to other players.
              </li>
              <li>
                <strong>Open from Computer:</strong> Use &ldquo;Open Saved&rdquo; to load any previously saved league file.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
