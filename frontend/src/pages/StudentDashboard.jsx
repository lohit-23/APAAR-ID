import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Lock,
  FileText,
  Calendar,
  Building2,
  Clock,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import QRCodeModal from '../components/QRCodeModal';
import CertificateModal from '../components/CertificateModal';

export default function StudentDashboard({ onNavigate }) {
  const { student, showToast } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedApaar, setCopiedApaar] = useState(false);
  const [selectedCredForQr, setSelectedCredForQr] = useState(null);
  const [selectedCredForCert, setSelectedCredForCert] = useState(null);

  const studentId = student?.id || 'std-01';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [credsRes, timeRes, aiRes] = await Promise.all([
          api.getCredentials({ student_id: studentId }),
          api.getStudentTimeline(studentId),
          api.getStudentAiInsights(studentId)
        ]);

        if (credsRes?.status === 'success') setCredentials(credsRes.data);
        if (timeRes?.status === 'success') setTimeline(timeRes.data);
        if (aiRes?.status === 'success') setInsights(aiRes.insights);
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  const handleCopyApaar = () => {
    const apaarText = student?.apaar_id || 'APAAR-2024-8921-4402';
    navigator.clipboard.writeText(apaarText);
    setCopiedApaar(true);
    showToast('Mock APAAR ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedApaar(false), 2000);
  };

  const studentData = student || {
    full_name: 'Aarav Sharma',
    apaar_id: 'APAAR-2024-8921-4402',
    masked_apaar_id: 'XXXX-XXXX-4402',
    enrollment_number: '2021/DTU/CO/402',
    program: 'B.Tech Computer Engineering',
    institution_name: 'Delhi Technological University (DTU) - AICTE Demo',
    cgpa: 9.24,
    current_semester: 7,
    profile_completion: 92,
    masked_aadhaar: 'XXXX-XXXX-9142',
    abc_account_id: 'ABC-IND-99210-441'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Welcome & Quick APAAR Card Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Indian Gov / APAAR Official Identity Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800">
          {/* Subtle Tricolor Ribbon inside card */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <GraduationCap className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Government of India • Ministry of Education
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  APAAR Digital Academic Identity
                </h1>
                <p className="text-xs text-blue-200">
                  Automated Permanent Academic Account Registry (Demo)
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              AICTE Verified Active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 bg-white/5 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Student Name</div>
              <div className="text-lg font-bold text-white">{studentData.full_name}</div>
              <div className="text-xs text-slate-300 mt-0.5">{studentData.program}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Enrolled Institution</div>
              <div className="text-sm font-semibold text-white">{studentData.institution_name}</div>
              <div className="text-xs text-slate-300 mt-0.5">Enrollment: {studentData.enrollment_number}</div>
            </div>

            <div className="sm:col-span-2 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-amber-300 uppercase font-mono font-semibold tracking-wider">
                  Masked Mock APAAR ID
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold tracking-widest text-amber-400">
                  {studentData.masked_apaar_id}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyApaar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/15 transition-all"
                  title="Copy APAAR ID"
                >
                  {copiedApaar ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedApaar ? 'Copied' : 'Copy ID'}
                </button>
                <button
                  onClick={() => setSelectedCredForQr(credentials[0] || { id: 'CRED-DTU-2024-DEG-01', apaar_id: studentData.apaar_id, title: 'APAAR Student Identity Card' })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  View ID QR
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
            <span className="font-mono text-[11px]">ABC ID: {studentData.abc_account_id}</span>
            <span className="font-mono text-[11px]">Aadhaar Masked: {studentData.masked_aadhaar}</span>
            <span className="text-emerald-400 font-semibold">142/160 NEP Credits Earned</span>
          </div>
        </div>

        {/* Right: Academic Performance & Profile Completion */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Academic Health</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                Sem {studentData.current_semester}
              </span>
            </div>

            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100 mb-5">
              <div className="text-4xl font-extrabold text-blue-900 tracking-tight font-serif">
                {studentData.cgpa}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Cumulative Grade Point (CGPA / 10.0)</div>
              <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                First Class with Distinction
              </div>
            </div>

            {/* Profile completion meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Profile & Document Completion</span>
                <span className="text-blue-700">{studentData.profile_completion}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${studentData.profile_completion}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {studentData.profile_completion < 100
                  ? 'Complete your 8-week internship record to achieve 100% degree readiness.'
                  : 'All mandatory graduation requirements met.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex gap-2">
            <button
              onClick={() => onNavigate('student-insights')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs rounded-xl transition-colors border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Insights
            </button>
            <button
              onClick={() => onNavigate('student-consent')}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-600" />
              Consent
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('student-wallet')}
          className="flex items-center justify-between p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Credential Wallet</div>
              <div className="text-xs text-slate-500">{credentials.length} verified credentials</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('student-records')}
          className="flex items-center justify-between p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Academic Marksheets</div>
              <div className="text-xs text-slate-500">Semesters 1-6 records</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('student-consent')}
          className="flex items-center justify-between p-4 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 hover:border-blue-400 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Consent Manager</div>
              <div className="text-xs text-slate-500">Selective field sharing</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('student-insights')}
          className="flex items-center justify-between p-4 bg-white hover:bg-indigo-50/50 rounded-2xl border border-indigo-200 hover:border-indigo-400 transition-all text-left group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">AI Insights</div>
              <div className="text-xs text-indigo-600 font-medium">Missing docs & skills</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 transition-colors" />
        </button>
      </div>

      {/* Main Content Grid: Recent Credentials & Academic Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Credentials in Wallet */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Registered Academic Credentials</h2>
            <button
              onClick={() => onNavigate('student-wallet')}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              View Full Wallet
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {credentials.slice(0, 3).map((cred) => (
              <div
                key={cred.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {cred.credential_type}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{cred.id}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{cred.title}</h3>
                  <div className="text-xs text-slate-500">
                    {cred.institution_name} • Issued on {cred.issue_date}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setSelectedCredForCert(cred)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    View Certificate
                  </button>
                  <button
                    onClick={() => setSelectedCredForQr(cred)}
                    className="p-2 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors"
                    title="View QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Academic Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Academic Timeline</h2>
            <span className="text-[11px] text-slate-400">Ledger History</span>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pt-2 pb-2">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Node dot */}
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                  item.type === 'verification' ? 'bg-emerald-500' :
                  item.type === 'credential' ? 'bg-blue-600' :
                  item.type === 'milestone' ? 'bg-amber-500' : 'bg-slate-500'
                }`} />

                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {item.date}
                </div>
                <div className="font-bold text-slate-900 text-xs mt-0.5">{item.title}</div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={!!selectedCredForQr}
        onClose={() => setSelectedCredForQr(null)}
        credential={selectedCredForQr}
        onNavigateToVerify={(id) => onNavigate('verifier-portal', { searchId: id })}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={!!selectedCredForCert}
        onClose={() => setSelectedCredForCert(null)}
        credential={selectedCredForCert}
        student={studentData}
      />
    </div>
  );
}
