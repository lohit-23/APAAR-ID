import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  GraduationCap,
  Award,
  ChevronRight,
  X,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function StudentDirectoryPage() {
  const { institution, showToast } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [copiedApaar, setCopiedApaar] = useState(false);

  const instId = institution?.id || 'inst-dtu';

  const loadStudents = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.getInstitutionStudents(instId, query);
      if (res?.status === 'success') {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(searchQuery);
  }, [instId, searchQuery]);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await api.getStudentDetail(student.id);
      if (res?.status === 'success') {
        setStudentDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load student details:', err);
    }
  };

  const handleCopyApaar = (apaar) => {
    navigator.clipboard.writeText(apaar);
    setCopiedApaar(true);
    showToast('Mock APAAR ID copied!', 'success');
    setTimeout(() => setCopiedApaar(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Student Directory & Dossiers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {students.length} Registered Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search students enrolled at {institution?.name || 'Delhi Technological University'} by mock APAAR ID, enrollment ID, or name.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by APAAR ID, Name, Roll No..."
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Students List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((std) => (
          <div
            key={std.id}
            onClick={() => handleSelectStudent(std)}
            className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start gap-3 mb-4">
                <img
                  src={std.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={std.full_name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-base truncate group-hover:text-blue-700 transition-colors">
                    {std.full_name}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {std.masked_apaar_id}
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">
                    {std.program}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Enrollment</span>
                  <div className="text-slate-800 font-bold truncate">{std.enrollment_number}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Cumulative CGPA</span>
                  <div className="text-emerald-700 font-bold">{std.cgpa} / 10.0</div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Semester {std.current_semester}</span>
              <span className="text-blue-700 font-semibold group-hover:underline flex items-center gap-0.5">
                View Dossier <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Student Dossier Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="tricolor-stripe" />

            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudent.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={selectedStudent.full_name}
                  className="w-12 h-12 rounded-2xl object-cover border"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedStudent.full_name}</h3>
                  <div className="text-xs text-slate-500">{selectedStudent.program}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* APAAR Identity Strip */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-300">Permanent Academic ID</div>
                  <div className="text-lg font-mono font-bold tracking-wider text-white">
                    {selectedStudent.apaar_id}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyApaar(selectedStudent.apaar_id)}
                  className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg"
                >
                  {copiedApaar ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedApaar ? 'Copied' : 'Copy APAAR ID'}
                </button>
              </div>

              {/* Key Records Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Enrollment</span>
                  <div className="font-bold text-slate-800">{selectedStudent.enrollment_number}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">CGPA</span>
                  <div className="font-bold text-emerald-700">{selectedStudent.cgpa} / 10.0</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Semester</span>
                  <div className="font-bold text-slate-800">Sem {selectedStudent.current_semester}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Graduation Year</span>
                  <div className="font-bold text-slate-800">{selectedStudent.graduation_year}</div>
                </div>
              </div>

              {/* Confidential Identifiers (Privacy Masked) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  National Academic Registry Linkages
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Academic Bank of Credits</span>
                    <div className="font-mono font-bold text-blue-900 mt-0.5">{selectedStudent.abc_account_id}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Masked Aadhaar KYC</span>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">{selectedStudent.masked_aadhaar}</div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
