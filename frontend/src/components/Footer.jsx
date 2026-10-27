import React from 'react';
import { ShieldCheck, Award, GraduationCap, ExternalLink, Heart } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      {/* Tricolor stripe */}
      <div className="tricolor-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                ShikshaSetu<span className="text-amber-400">.AI</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              AICTE-aligned APAAR ID student data management and cryptographic verification platform. Built for Smart India Hackathon.
            </p>
            <div className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy-by-Design Architecture
            </div>
          </div>

          {/* Col 2: Platform Pillars */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Core Capabilities</h4>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => onNavigate && onNavigate('student-dashboard')} className="hover:text-white transition-colors">APAAR Academic Wallet</button></li>
              <li><button onClick={() => onNavigate && onNavigate('student-consent')} className="hover:text-white transition-colors">Granular Consent Manager</button></li>
              <li><button onClick={() => onNavigate && onNavigate('verifier-portal')} className="hover:text-white transition-colors">Zero-Trust Verifier Gateway</button></li>
              <li><button onClick={() => onNavigate && onNavigate('institution-quality')} className="hover:text-white transition-colors">AI Anomaly & Tamper Sentinel</button></li>
              <li><button onClick={() => onNavigate && onNavigate('admin-audit')} className="hover:text-white transition-colors">Immutable Audit Trail</button></li>
            </ul>
          </div>

          {/* Col 3: Problem Statement */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">SIH Problem Statement</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              “Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions.”
            </p>
            <p className="text-[10px] text-amber-400/90 mt-2 font-mono">
              National Academic Depository (NAD) & NEP 2020 Aligned
            </p>
          </div>

          {/* Col 4: Prototype Rules */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Demo Disclaimers</h4>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-[10px] text-slate-300 leading-relaxed space-y-1.5">
              <p>• Uses fictional student data and mock APAAR IDs only.</p>
              <p>• Not connected to live DigiLocker, Aadhaar, or AICTE government APIs.</p>
              <p>• Verifiers access only consented fields (DPDP Act 2023 aligned).</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © 2024 ShikshaSetu AI • Smart India Hackathon Prototype. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Security: SHA-256 Mock Signatures</span>
            <span>•</span>
            <span>FastAPI + React + Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
