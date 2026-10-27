import React, { useState, useEffect } from 'react';
import {
  Award,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  Upload,
  ArrowRight,
  ExternalLink,
  QrCode,
  Hash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function IssueCredentialPage({ onNavigate }) {
  const { institution, showToast } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [credentialType, setCredentialType] = useState('degree');
  const [title, setTitle] = useState('Bachelor of Technology in Computer Engineering');
  const [course, setCourse] = useState('Computer Engineering (Honours)');
  const [grade, setGrade] = useState('First Class with Distinction');
  const [cgpa, setCgpa] = useState('9.25');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [skills, setSkills] = useState('Distributed Systems, Cloud Architecture, Artificial Intelligence');
  const [description, setDescription] = useState('Four-year Bachelor of Technology Degree awarded upon successful completion of AICTE curriculum.');
  const [mockFileName, setMockFileName] = useState('official_signed_degree.pdf');
  const [submitting, setSubmitting] = useState(false);
  const [issuedResult, setIssuedResult] = useState(null);

  const instId = institution?.id || 'inst-dtu';

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await api.getInstitutionStudents(instId);
        if (res?.status === 'success') {
          setStudents(res.data);
          if (res.data.length > 0) setSelectedStudentId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    }
    loadStudents();
  }, [instId]);

  // Live mock hash calculation
  const liveHashPayload = `${instId}:${selectedStudentId}:${title}:${course}:${grade}:${cgpa}:${issueDate}`;
  const mockPreviewHash = Array.from(liveHashPayload).reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
  }, 0).toString(16).padStart(16, 'a') + 'e3b0c44298fc1c149afbf4c8996fb92427ae';

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Please select a student record', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        student_id: selectedStudentId,
        institution_id: instId,
        title,
        credential_type: credentialType,
        course,
        grade,
        cgpa: cgpa ? parseFloat(cgpa) : null,
        issue_date: issueDate,
        skills_covered: skills.split(',').map((s) => s.trim()).filter(Boolean),
        description,
      };

      const res = await api.issueCredential(payload);
      if (res?.status === 'success') {
        setIssuedResult(res.data);
        showToast('Academic credential successfully issued and cryptographically signed!', 'success');
      }
    } catch (err) {
      showToast('Failed to issue credential', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Issue Verifiable Academic Credential</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Institutional Registry Gateway
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Generate tamper-proof academic credentials with SHA-256 cryptographic hashes and AICTE digital signature endorsements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleIssue} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Student Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Target Student (APAAR ID Match)
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium text-slate-800"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} — {s.masked_apaar_id} ({s.enrollment_number})
                  </option>
                ))}
              </select>
              {selectedStudent && (
                <div className="mt-2 text-xs text-slate-500 flex items-center gap-2 font-mono">
                  <span>Enrolled: {selectedStudent.program}</span>
                  <span>•</span>
                  <span>Current CGPA: {selectedStudent.cgpa}</span>
                </div>
              )}
            </div>

            {/* Credential Type & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Credential Type
                </label>
                <select
                  value={credentialType}
                  onChange={(e) => setCredentialType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="degree">Degree Certificate</option>
                  <option value="marksheet">Consolidated Marksheet</option>
                  <option value="certificate">Academic Certificate</option>
                  <option value="internship">Internship Completion</option>
                  <option value="skill_badge">AICTE Skill Badge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  required
                />
              </div>
            </div>

            {/* Credential Title & Course */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Official Credential Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bachelor of Technology in Computer Engineering"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Course / Specialization
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                    Grade / CGPA Awarded
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="Grade (e.g. A+ / O)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="CGPA (9.2)"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Skills & Domains Covered (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                  Conferral Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Mock Certificate File Uploader */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Attach Digitally Signed Certificate PDF (Mock Storage)
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center bg-slate-50 transition-colors">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs text-slate-700 font-medium">
                  {mockFileName} (1.4 MB) • Mock Cryptographic HSM Key Attached
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Supabase Storage mock bucket: <code className="text-blue-700">academic-certificates-demo</code>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              {submitting ? 'Signing & Registering...' : 'Sign, Seal & Issue Credential'}
            </button>
          </form>
        </div>

        {/* Right Col: Live Cryptographic Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Hash className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Cryptographic Signature Engine
              </h2>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Simulated SHA-256 Hash</span>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 break-all select-all mt-1">
                {mockPreviewHash}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Issuer Authority Key</span>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 mt-1">
                RSA-SHA256-SIGN-AICTE-DTU-HSM-NODE
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Immutable Ledger Entry will be written to public audit logs upon submission.</span>
            </div>
          </div>

          {/* Success Box after Issuing */}
          {issuedResult && (
            <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 animate-fadeIn space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Credential Registered!
              </div>
              <div className="text-xs text-slate-700">
                Ref ID: <strong className="font-mono text-emerald-800">{issuedResult.id}</strong>
              </div>
              <p className="text-[11px] text-slate-600">
                Issued to {issuedResult.student_name}. Ready for QR code scanning and employer verification.
              </p>
              <button
                onClick={() => onNavigate('verifier-portal', { searchId: issuedResult.id })}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Test Verify in Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
