import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  Award,
  Building2,
  Users,
  ArrowRight,
  Fingerprint,
  QrCode,
  FileCheck,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onNavigate }) {
  const { switchRole } = useAuth();
  const [quickSearchId, setQuickSearchId] = useState('');

  const handleQuickVerify = (e) => {
    e.preventDefault();
    if (!quickSearchId.trim()) return;
    onNavigate('verifier-portal', { searchId: quickSearchId.trim() });
  };

  const handleRoleQuickStart = (roleKey, targetRoute) => {
    switchRole(roleKey);
    onNavigate(targetRoute);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 border-b border-slate-800">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-br from-blue-600/15 via-indigo-500/10 to-amber-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* National Initiative Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-xs font-semibold text-blue-200 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Smart India Hackathon 2024 • AICTE Prototype
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              One Nation, One Student ID: <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                ShikshaSetu AI Platform
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
              An APAAR ID-based student data management and cryptographic verification ecosystem for AICTE-approved institutions. Privacy-first, tamper-evident, and instant.
            </p>

            {/* Quick Credential Verification Widget */}
            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/20 shadow-2xl mb-8">
              <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={quickSearchId}
                    onChange={(e) => setQuickSearchId(e.target.value)}
                    placeholder="Enter Mock APAAR ID or Credential ID (e.g. CRED-DTU-2024-DEG-01)"
                    className="w-full pl-10 pr-4 py-3 bg-white/95 text-slate-900 text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  Verify Record
                </button>
              </form>

              {/* Sample test pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 pt-2 border-t border-white/10 text-[11px] text-slate-300">
                <span className="text-slate-400">Quick Test Records:</span>
                <button
                  type="button"
                  onClick={() => setQuickSearchId('CRED-DTU-2024-DEG-01')}
                  className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-amber-200 border border-white/10 transition-colors"
                >
                  Authentic Degree
                </button>
                <button
                  type="button"
                  onClick={() => setQuickSearchId('CRED-TAMPERED-MOCK-99')}
                  className="bg-rose-500/20 hover:bg-rose-500/30 px-2 py-0.5 rounded text-rose-300 border border-rose-500/30 transition-colors"
                >
                  Tampered Demo Record
                </button>
                <button
                  type="button"
                  onClick={() => setQuickSearchId('APAAR-2024-8921-4402')}
                  className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-blue-200 border border-white/10 transition-colors"
                >
                  Student APAAR ID
                </button>
              </div>
            </div>

            {/* Live Prototype Metrics Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl pt-6 border-t border-slate-800 text-left">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-amber-400">8</div>
                <div className="text-xs text-slate-400">Fictional Demo Students</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-blue-400">3</div>
                <div className="text-xs text-slate-400">AICTE Demo Institutions</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-emerald-400">100%</div>
                <div className="text-xs text-slate-400">Privacy Consented</div>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                <div className="text-2xl font-black text-purple-400">SHA-256</div>
                <div className="text-xs text-slate-400">Cryptographic Hashes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Showcase & Fast-Switcher Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Role-Based Access Control
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3 mb-3">
              Explore ShikshaSetu by User Role
            </h2>
            <p className="text-sm text-slate-600">
              Select any of the 4 personas below to experience the platform from that user’s perspective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student Role */}
            <div className="bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">1. Student</h3>
                <div className="text-xs text-blue-700 font-semibold mb-3">Aarav Sharma (DTU)</div>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-1.5">• Masked APAAR ID Card</li>
                  <li className="flex items-center gap-1.5">• Credential Wallet & QR</li>
                  <li className="flex items-center gap-1.5">• Granular Consent Manager</li>
                  <li className="flex items-center gap-1.5">• Prototype AI Insights</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleQuickStart('student', 'student-dashboard')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
              >
                Launch Student Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Institution Admin Role */}
            <div className="bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">2. Institution Admin</h3>
                <div className="text-xs text-indigo-700 font-semibold mb-3">Dean DTU (AICTE Demo)</div>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-1.5">• Issue Signed Credentials</li>
                  <li className="flex items-center gap-1.5">• Bulk CSV Student Upload</li>
                  <li className="flex items-center gap-1.5">• Student Directory Search</li>
                  <li className="flex items-center gap-1.5">• Data Quality & AI Sentinel</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleQuickStart('institution', 'institution-dashboard')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
              >
                Launch Institution Admin
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Verifier Role */}
            <div className="bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">3. Verifier Gateway</h3>
                <div className="text-xs text-emerald-700 font-semibold mb-3">TCS Campus Recruitment</div>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-1.5">• QR Code & Hash Verifier</li>
                  <li className="flex items-center gap-1.5">• 5 Verification States</li>
                  <li className="flex items-center gap-1.5">• Privacy Consented Fields Only</li>
                  <li className="flex items-center gap-1.5">• Visual Tamper Detection</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleQuickStart('verifier', 'verifier-portal')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
              >
                Launch Verifier Portal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Super Admin Role */}
            <div className="bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">4. Super Admin</h3>
                <div className="text-xs text-purple-700 font-semibold mb-3">AICTE Central Operations</div>
                <ul className="text-xs text-slate-600 space-y-2 mb-6">
                  <li className="flex items-center gap-1.5">• Pan-Institutional Metrics</li>
                  <li className="flex items-center gap-1.5">• Institution Approvals</li>
                  <li className="flex items-center gap-1.5">• Full Audit Trail & Logs</li>
                  <li className="flex items-center gap-1.5">• Blockchain Ledger Health</li>
                </ul>
              </div>
              <button
                onClick={() => handleRoleQuickStart('super_admin', 'admin-dashboard')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
              >
                Launch Super Admin
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Architectural Highlights */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
              Built for NEP 2020 & AICTE Guidelines
            </h2>
            <p className="text-sm text-slate-600">
              Solving fake degrees, manual document delays, and privacy leakage through an automated cryptographic pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4 font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Privacy-by-Design</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students retain sovereign ownership over their academic data. Verifiers only see fields (e.g. CGPA, Degree, Skills) explicitly authorized by active, time-limited student consent.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">AI Sentinel & Anomaly Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Machine learning models audit student records in real time. Flags duplicate certificates, abnormal CGPA spikes, missing mandatory internships, and format mismatches.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 font-bold">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Tamper-Evident SHA-256 Ledger</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every credential issuance, verification query, and consent modification is cryptographically hashed and recorded into an immutable audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
