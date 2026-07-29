import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthBanner } from './components/AuthBanner';
import { TaskList } from './components/TaskList';
import { Database, ShieldCheck, UserCheck, Flame } from 'lucide-react';

const MainContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <AuthBanner />
        ) : (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-black text-slate-100">
                      Welcome back, {user.displayName || 'User'}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Google Authenticated
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your account is connected to Firestore. All updates synchronize in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span>Document Scope: <code className="text-amber-300/90 font-mono">/tasks</code></span>
              </div>
            </div>

            <TaskList />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Firebase Auth & Firestore Integration Active</span>
          </div>
          <p>© {new Date().getFullYear()} Firebase Applet. Built with Google Cloud Firestore.</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
