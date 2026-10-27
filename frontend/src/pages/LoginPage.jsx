import React from 'react';
import {
  GraduationCap,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Lock,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onNavigate }) {
  const { switchRole } = useAuth();

  const demoPersonas = [
    {
      role: 'student',
      title: 'Student Demo Persona',
      name: 'Aarav Sharma',
      badge: 'APAAR ID: XXXX-XXXX-4402',
      institution: 'Delhi Technological University (DTU)',
      icon: GraduationCap,
      color: 'from-blue-600 to-indigo-700',
      description: 'Access Academic Wallet, inspect SHA-256 hashes, generate QR verification codes, manage granular consent, and view Prototype AI Insights.',
      targetRoute: 'student-dashboard'
    },
    {
      role: 'institution',
      title: 'Institution Admin Persona',
      name: 'Dr. R.K. Singhal (Dean)',
      badge: 'DTU (AICTE Approved - Demo)',
      institution: 'Delhi Technological University',
      icon: Building2,
      color: 'from-indigo-600 to-purple-700',
      description: 'Issue digitally signed credentials, execute bulk CSV student imports, search student dossiers, and review AI anomaly sentinel alerts.',
      targetRoute: 'institution-dashboard'
    },
    {
      role: 'verifier',
      title: 'Verifier Persona (Employer)',
      name: 'Pooja Mehta (Talent Acquisition)',
      badge: 'Tata Consultancy Services (TCS)',
      institution: 'Corporate Campus Gateway',
      icon: CheckCircle2,
      color: 'from-emerald-600 to-teal-700',
      description: 'Perform public zero-trust credential verifications, inspect cryptographic hashes, evaluate consent statuses, and test tamper detection.',
      targetRoute: 'verifier-portal'
    },
    {
      role: 'super_admin',
      title: 'Super Admin Persona',
      name: 'Prof. T. G. Sitharam (Central Node)',
      badge: 'AICTE Apex Consortium Node',
      institution: 'Ministry of Education / AICTE',
      icon: SlidersHorizontal,
      color: 'from-purple-700 to-pink-800',
      description: 'Pan-institutional operational oversight, institution accreditation approvals, comprehensive audit trail inspections, and ledger health checks.',
      targetRoute: 'admin-dashboard'
    }
  ];

  const handleSelectRole = (p) => {
    switchRole(p.role);
    onNavigate(p.targetRoute);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center animate-fadeIn">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <UserCheck className="w-4 h-4 text-blue-700" />
            EVALUATOR DEMO LOGIN
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Prototype Persona
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Experience ShikshaSetu AI by logging in instantly as any of the four designated user roles. No passwords required for demonstration.
          </p>
        </div>

        {/* 4 Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demoPersonas.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.role}
                onClick={() => handleSelectRole(p)}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs uppercase font-bold text-slate-400">{p.title}</div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {p.name}
                      </h2>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {p.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                  <span>Sign In as {p.title.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-slate-400 pt-4">
          All data is mock demonstration data created exclusively for the Smart India Hackathon.
        </div>
      </div>
    </div>
  );
}
