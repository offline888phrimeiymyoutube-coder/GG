import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, LogOut, CheckSquare, ShieldCheck, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signInWithGoogle, signOutUser, loading } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <CheckSquare className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-lg text-slate-100 tracking-tight">
                Firebase Flow
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Auth & Firestore
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Secure Auth & Realtime Data Storage
            </p>
          </div>
        </div>

        {/* User Auth Controls */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="h-9 w-28 bg-slate-800 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5 bg-slate-800/80 border border-slate-700/60 rounded-full pl-2 pr-3 py-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full ring-1 ring-amber-500/50 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <p className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                    {user.displayName || 'Authenticated User'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={signOutUser}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 shadow-md shadow-amber-500/20 transition-all cursor-pointer transform active:scale-95"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Google
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
