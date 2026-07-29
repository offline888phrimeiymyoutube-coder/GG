import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Database, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthBanner: React.FC = () => {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-slate-100 shadow-xl my-6">
      {authError && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-sm flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-300">Authentication Warning</p>
              <p className="text-xs text-red-300/80 mt-0.5">{authError}</p>
            </div>
          </div>
          <button
            onClick={clearAuthError}
            className="text-xs text-red-400 hover:text-red-200 font-medium px-2 py-1 rounded bg-red-900/30 hover:bg-red-900/50 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Firebase Authentication & Cloud Storage</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Sign in to unlock personalized Firestore persistence
        </h2>

        <p className="text-slate-400 text-sm leading-relaxed max-w-xl mx-auto">
          Your tasks and notes are saved directly in your private Firestore collection, secured by server-side Firebase Security Rules tied to your Google Identity.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left my-6 max-w-2xl mx-auto">
          <div className="bg-slate-800/50 border border-slate-700/50 p-3.5 rounded-xl flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Google OAuth</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Secure Google Sign-In with Firebase Auth</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-3.5 rounded-xl flex items-start space-x-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Firestore Sync</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Realtime updates across device sessions</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 p-3.5 rounded-xl flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Security Rules</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Isolated user data authorization</p>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center px-6 py-3 text-sm font-bold rounded-xl text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};
