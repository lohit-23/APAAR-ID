import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Award,
  AlertTriangle,
  FileCheck,
  Search,
  Upload,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function InstitutionDashboard({ onNavigate }) {
  const { institution, showToast } = useAuth();
  const [instData, setInstData] = useState(null);
  const [students, setStudents] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const instId = institution?.id || 'inst-dtu';

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [instRes, stdRes, anomRes] = await Promise.all([
          api.getInstitution(instId),
          api.getInstitutionStudents(instId),
          api.getAnomalies({ institution_id: instId })
        ]);

        if (instRes?.status === 'success') setInstData(instRes.data);
        if (stdRes?.status === 'success') setStudents(stdRes.data);
        if (anomRes?.status === 'success') setAnomalies(anomRes.data);
      } catch (err) {
        console.error('Failed to load institution dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [instId]);

  const issuanceTrends = [
    { month: 'May', degrees: 450, marksheets: 1200, badges: 320 },
    { month: 'Jun', degrees: 1100, marksheets: 2800, badges: 540 },
    { month: 'Jul', degrees: 850, marksheets: 2100, badges: 480 },
    { month: 'Aug', degrees: 320, marksheets: 890, badges: 620 },
    { month: 'Sep', degrees: 240, marksheets: 750, badges: 780 },
    { month: 'Oct', degrees: 410, marksheets: 1150, badges: 910 },
  ];

  const programDistribution = [
    { name: 'Computer Eng.', value: 980, color: '#1d4ed8' },
    { name: 'Info. Tech', value: 720, color: '#4f46e5' },
    { name: 'Electronics (EXTC)', value: 650, color: '#059669' },
    { name: 'Mechanical Eng.', value: 590, color: '#f59e0b' },
    { name: 'Electrical Eng.', value: 480, color: '#8b5cf6' },
  ];

  const inst = instData || {
    name: 'Delhi Technological University (DTU) - AICTE Demo',
    code: 'DTU',
    aicte_id: 'AICTE-DEL-1092-2024',
    approval_status: 'AICTE Approved - Demo',
    accreditation: 'NAAC A++ (CGPA 3.65)',
    total_students: 3420,
    total_credentials: 12850,
    pending_verifications: 14,
    active_anomalies: 2
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Institution Banner Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
              <Building2 className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AICTE Approved – Demo Badge
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {inst.aicte_id}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                {inst.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Accreditation: {inst.accreditation} • State University Node
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate('institution-issue')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              Issue Credential
            </button>
            <button
              onClick={() => onNavigate('institution-bulk')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Enrolled Students</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{inst.total_students.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">All with mock APAAR IDs</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Credentials Issued</div>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">{inst.total_credentials.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">Digitally signed & hashed</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Pending Verifications</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{inst.pending_verifications}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5">Employer queue</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase">AI Anomaly Alerts</div>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{inst.active_anomalies || anomalies.length}</div>
            <div className="text-[11px] text-rose-700 font-medium mt-0.5">Requires audit review</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Monthly Credential Issuance Trends
              </h2>
              <p className="text-xs text-slate-500">Degrees, Semester Marksheets & Micro-Credentials</p>
            </div>
            <div className="text-xs font-semibold text-blue-700">FY 2024 Cycle</div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="marksheets" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Marksheets" />
                <Bar dataKey="degrees" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Degrees" />
                <Bar dataKey="badges" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Skill Badges" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Enrolled Branch Breakdown
            </h2>
            <p className="text-xs text-slate-500 mb-4">AICTE approved intake</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={programDistribution}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {programDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-2">
              {programDistribution.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-slate-900">{item.value} students</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Grid: Directory, Issue, Quality */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigate('institution-students')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Student Directory</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Search student records by mock APAAR ID, enrollment number, or name. View individual dossiers.
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-700">
            Open Student Directory <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('institution-bulk')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Bulk CSV Ingestion</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Upload institutional CSV batches, automatically generate mock APAAR IDs, and run format validations.
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-700">
            Launch Bulk Ingestion <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('institution-quality')}
          className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl w-fit mb-3 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Data Quality & AI Sentinel</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Audit duplicate credentials, flag anomalous CGPA jumps, and inspect missing internship records.
          </p>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-700">
            View AI Anomaly Dashboard <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
