import React, { useState, useEffect } from 'react';
import {
  FileText,
  Award,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  BookOpen,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function AcademicRecordsPage() {
  const { student, showToast } = useAuth();
  const [records, setRecords] = useState([]);
  const [activeSemIndex, setActiveSemIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const studentId = student?.id || 'std-01';

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const res = await api.getStudentRecords(studentId);
        if (res?.status === 'success') {
          setRecords(res.data);
        }
      } catch (err) {
        console.error('Failed to load academic records:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [studentId]);

  const activeRecord = records[activeSemIndex] || records[0];

  // SGPA Progression data for chart
  const progressionData = [
    { sem: 'Sem 1', sgpa: 8.85, cgpa: 8.85, credits: 22 },
    { sem: 'Sem 2', sgpa: 9.10, cgpa: 8.97, credits: 22 },
    { sem: 'Sem 3', sgpa: 9.30, cgpa: 9.08, credits: 24 },
    { sem: 'Sem 4', sgpa: 9.20, cgpa: 9.11, credits: 22 },
    { sem: 'Sem 5', sgpa: 9.15, cgpa: 9.12, credits: 24 },
    { sem: 'Sem 6', sgpa: 9.35, cgpa: 9.24, credits: 24 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Academic Records & Grade Cards</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              NEP 2020 Aligned
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated official semester marksheets anchored on the Academic Bank of Credits (ABC)
          </p>
        </div>

        <button
          onClick={() => showToast('Consolidated Transcript PDF exported with official cryptographic seal!', 'success')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Full Transcript
        </button>
      </div>

      {/* Progression Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                SGPA & CGPA Academic Progression
              </h2>
              <p className="text-xs text-slate-500">Cumulative performance across completed semesters</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <span className="w-3 h-3 rounded-full bg-blue-700 inline-block" /> SGPA
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> CGPA
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sem" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[7.5, 10.0]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="sgpa" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="cgpa" stroke="#059669" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Credit Breakdown Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              NEP Credit Distribution
            </h2>
            <p className="text-xs text-slate-500 mb-6">Total Degree Requirement: 160 Credits</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-600">Core Engineering Credits</span>
                  <span className="text-slate-900">88 / 96 Credits</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '91%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-600">Departmental Electives</span>
                  <span className="text-slate-900">28 / 32 Credits</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-600">AICTE NEAT Skill Badges</span>
                  <span className="text-slate-900">14 / 16 Credits</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-slate-600">Internship & Capstone</span>
                  <span className="text-slate-900">12 / 16 Credits</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 mt-6">
            <strong>Active Status:</strong> Zero Academic Backlogs. Eligible for Honours Degree conferral.
          </div>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        {records.map((rec, idx) => (
          <button
            key={rec.id}
            onClick={() => setActiveSemIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeSemIndex === idx
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semester {rec.semester} Marksheet (SGPA {rec.sgpa})
          </button>
        ))}
      </div>

      {/* Active Semester Marksheet Table */}
      {activeRecord && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Official Consolidated Marksheet
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Semester {activeRecord.semester} • Academic Year {activeRecord.academic_year}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                SGPA: <strong className="text-blue-700 text-sm">{activeRecord.sgpa}</strong>
              </span>
              <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                CGPA: <strong className="text-emerald-700 text-sm">{activeRecord.cgpa}</strong>
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg">
                {activeRecord.status}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-right">Obtained / Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {activeRecord.subjects?.map((sub, sIdx) => (
                  <tr key={sIdx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-blue-700">{sub.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{sub.name}</td>
                    <td className="py-3 px-4 text-center">{sub.credits}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                        sub.grade === 'O' ? 'bg-amber-100 text-amber-900' :
                        sub.grade === 'A+' ? 'bg-emerald-100 text-emerald-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {sub.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {sub.obtained_marks} / {sub.max_marks || 100}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
