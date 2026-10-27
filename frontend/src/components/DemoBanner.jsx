import React from 'react';
import { AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DemoBanner() {
  const { resetAllDemoData } = useAuth();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800 z-50">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          DEMO / PROTOTYPE DATA ONLY
        </span>
        <span className="hidden sm:inline text-slate-400">
          Built for Smart India Hackathon (SIH) • Fictional APAAR IDs • Not connected to real government APIs
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          Privacy-by-Design Active
        </span>
        <button
          onClick={resetAllDemoData}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700"
          title="Reset database to initial clean seed state"
        >
          <RefreshCw className="w-3 h-3" />
          <span className="hidden md:inline">Reset Demo</span>
        </button>
      </div>
    </div>
  );
}
