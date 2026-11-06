import React from 'react';
import { Outlet } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { ToastContainer } from '../components/Toast';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative selection:bg-indigo-500 selection:text-white">
      {/* Subtle modern background gradient & light grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">WorkSync</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-400">
              Enterprise
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">Systems Normal</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* Minimal Clean Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        <p>&copy; {new Date().getFullYear()} WorkSync Technologies Inc. All rights reserved.</p>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default AuthLayout;
