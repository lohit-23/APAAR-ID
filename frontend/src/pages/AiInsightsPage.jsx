import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertCircle,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Compass,
  FileWarning
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function AiInsightsPage({ onNavigate }) {
  const { student, showToast } = useAuth();
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = student?.id || 'std-01';

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      try {
        const res = await api.getStudentAiInsights(studentId);
        if (res?.status === 'success') {
          setInsightsData(res.insights);
        }
      } catch (err) {
        console.error('Failed to load AI insights:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [studentId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Banner: Labeled "Prototype AI Insight" */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              PROTOTYPE AI INSIGHT
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              AI Academic Advisory & Document Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automated audit of your APAAR profile against AICTE curricular standards, identifying missing graduation requirements and tailored career skills.
            </p>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center shrink-0">
            <span className="text-[10px] text-slate-300 uppercase font-semibold">Degree Readiness</span>
            <div className="text-2xl font-black text-amber-300 font-serif">
              {insightsData?.academic_strengths?.readiness_index || 94}%
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-300 shrink-0" />
          <span>Demonstration Data: Synthesized by ShikshaSetu prototype heuristic ML models.</span>
        </div>
      </div>

      {/* 3 Core Insight Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 1. Missing Documents Audit */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <FileWarning className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Missing Documents Audit</h2>
              <p className="text-[11px] text-slate-500">Requirements for NEP degree clearance</p>
            </div>
          </div>

          <div className="space-y-3">
            {insightsData?.missing_documents?.map((doc, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-900 text-xs">{doc.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.urgency === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.urgency} Urgency
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{doc.reason}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
                  <span>Action: {doc.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Suggested AICTE Skill Badges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Recommended Skill Badges</h2>
              <p className="text-[11px] text-slate-500">Aligned with curriculum and market demand</p>
            </div>
          </div>

          <div className="space-y-3">
            {insightsData?.recommended_skills?.map((skill, sIdx) => (
              <div key={sIdx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-sm transition-all space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-900 text-xs">{skill.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {skill.match_rate.split(' ')[0]} Match
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{skill.provider} • ~{skill.estimated_hours} hrs</div>
                <p className="text-xs text-slate-600">{skill.match_rate}</p>
                <button
                  onClick={() => showToast(`Enrolled in AICTE demo badge: ${skill.name}`, 'success')}
                  className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  View on AICTE NEAT
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Academic Strengths Summary */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Strengths Summary</h2>
              <p className="text-[11px] text-slate-500">Cohort benchmarking and strengths</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-[10px] uppercase font-bold text-blue-700">Cohort Ranking</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {insightsData?.academic_strengths?.overall_classification || 'Elite Academic Standout'}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CGPA Trajectory</span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {insightsData?.academic_strengths?.cgpa_performance}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Proficiency Domains</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {insightsData?.academic_strengths?.core_domains?.map((d, dIdx) => (
                  <span key={dIdx} className="text-xs px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Integrity Audit</span>
              <div className="flex items-center gap-2 mt-1 text-xs text-emerald-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {insightsData?.academic_strengths?.tamper_proof_integrity_score}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
