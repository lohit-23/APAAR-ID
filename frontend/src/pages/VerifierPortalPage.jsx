import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  QrCode,
  FileText,
  Lock,
  ExternalLink,
  History,
  Building2,
  User,
  Hash,
  Fingerprint,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function VerifierPortalPage({ initialSearchId }) {
  const { showToast } = useAuth();
  const [identifier, setIdentifier] = useState(initialSearchId || 'CRED-DTU-2024-DEG-01');
  const [verifierName, setVerifierName] = useState('Tata Consultancy Services (TCS) - Campus Hiring');
  const [accessToken, setAccessToken] = useState('TCS-GRANT-TOKEN-9981-ACTIVE');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationLogs, setVerificationLogs] = useState([]);

  // Preset test cases for evaluation
  const testPresets = [
    {
      label: '✓ Authentic Verified Degree',
      id: 'CRED-DTU-2024-DEG-01',
      verifier: 'Tata Consultancy Services (TCS) - Campus Hiring',
      token: 'TCS-GRANT-TOKEN-9981-ACTIVE',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300'
    },
    {
      label: '⚠ Tampered Credential Alert',
      id: 'CRED-TAMPERED-MOCK-99',
      verifier: 'Accenture Strategy - Background Verification',
      token: '',
      color: 'bg-rose-50 text-rose-800 border-rose-300'
    },
    {
      label: '⏳ Expired Consent Case',
      id: 'CRED-DTU-2024-DEG-01',
      verifier: 'Infosys Technologies Ltd - Background Screening',
      token: 'INFY-GRANT-TOKEN-EXPIRED-001',
      color: 'bg-amber-50 text-amber-800 border-amber-300'
    },
    {
      label: '🔒 Consent Required (Zero-Access)',
      id: 'CRED-DTU-2024-DEG-01',
      verifier: 'Unknown Third-Party Employer',
      token: '',
      color: 'bg-blue-50 text-blue-800 border-blue-300'
    }
  ];

  const loadLogs = async () => {
    try {
      const res = await api.getVerificationLogs();
      if (res?.status === 'success') {
        setVerificationLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  useEffect(() => {
    loadLogs();
    if (initialSearchId) {
      handleVerify(null, initialSearchId);
    }
  }, [initialSearchId]);

  const handleVerify = async (e, customId) => {
    if (e) e.preventDefault();
    const queryId = customId || identifier;
    if (!queryId.trim()) return;

    setLoading(true);
    setVerificationResult(null);

    try {
      const res = await api.verifyCredential({
        identifier: queryId.trim(),
        verifier_name: verifierName,
        access_token: accessToken.trim() || undefined
      });

      setVerificationResult(res);
      loadLogs();

      if (res.verification_state === 'Verified') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0B2545', '#16A34A', '#FF9933']
        });
        showToast('Credential cryptographically verified successfully!', 'success');
      } else if (res.verification_state === 'Tampered') {
        showToast('CRITICAL: Cryptographic signature mismatch detected!', 'error');
      } else if (res.verification_state === 'Consent Required') {
        showToast('Privacy Shield: Student consent required for record access', 'info');
      } else if (res.verification_state === 'Expired') {
        showToast('Consent token expired', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setIdentifier(preset.id);
    setVerifierName(preset.verifier);
    setAccessToken(preset.token);
    handleVerify(null, preset.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Zero-Trust Credential Verifier Gateway</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            AICTE Public Portal
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Instant institutional credential verification enforcing student consent policies and cryptographic SHA-256 seal integrity.
        </p>
      </div>

      {/* Preset Test Case Buttons for Hackathon Judges */}
      <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Fingerprint className="w-4 h-4 text-blue-700" />
          Quick Test Presets for Evaluators & Judges:
        </div>
        <div className="flex flex-wrap gap-2">
          {testPresets.map((preset, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleApplyPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] shadow-sm ${preset.color}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Verification Input Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Credential Identifier, Mock APAAR ID, or QR Payload
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. CRED-DTU-2024-DEG-01, CRED-TAMPERED-MOCK-99, or APAAR-2024-8921-4402"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                Verifier Organization
              </label>
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                placeholder="Verifier Organization Name"
                className="w-full px-3.5 py-3 bg-slate-50 text-slate-900 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="w-full sm:w-auto flex-1 max-w-md">
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Optional Consent Access Token (e.g. TCS-GRANT-TOKEN-9981-ACTIVE)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Verifying Cryptographic Ledger...' : 'Run Cryptographic Audit'}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result Display */}
      {verificationResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* STATE 1: VERIFIED (GREEN) */}
          {verificationResult.verification_state === 'Verified' && (
            <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="tricolor-stripe absolute top-0 left-0 right-0" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                      AICTE Verified Status
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      AUTHENTIC ACADEMIC RECORD VERIFIED
                    </h2>
                    <p className="text-xs text-slate-500">
                      Signature key validated against institutional root certificate
                    </p>
                  </div>
                </div>

                <div className="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-sm uppercase tracking-wider">
                  State: Verified
                </div>
              </div>

              {/* Student and Credential Consented Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6">
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-700" />
                    Student Details (Under Active Consent)
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div>Student Name: <strong className="text-slate-900">{verificationResult.student?.full_name}</strong></div>
                    <div>Masked APAAR ID: <code className="font-mono text-blue-700">{verificationResult.student?.masked_apaar_id}</code></div>
                    <div>Program: <strong>{verificationResult.student?.program}</strong></div>
                    <div>Enrolled Institution: <strong>{verificationResult.student?.institution_name}</strong></div>
                    {verificationResult.student?.cgpa && (
                      <div>Graduation CGPA: <strong className="text-emerald-700">{verificationResult.student?.cgpa} / 10.0</strong></div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-700" />
                    Conferred Credential
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div>Credential Title: <strong className="text-slate-900">{verificationResult.verification_result?.credential_title}</strong></div>
                    <div>Awarding Institution: <strong>{verificationResult.verification_result?.institution_name}</strong></div>
                    <div>Conferral Date: <strong>{verificationResult.verification_result?.issue_date}</strong></div>
                    <div>Grade: <strong>{verificationResult.verification_result?.grade}</strong></div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Seal & Consent Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cryptographic Hash</span>
                  <div className="font-mono text-[11px] text-slate-700 break-all truncate mt-0.5 select-all">
                    {verificationResult.verification_result?.credential_hash}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Digital Signature Status</span>
                  <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                    {verificationResult.verification_result?.digital_signature_status}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Privacy-by-Design Filter</span>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Visible: {verificationResult.verification_result?.consented_fields?.join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: TAMPERED (RED ALERT) */}
          {verificationResult.verification_state === 'Tampered' && (
            <div className="bg-rose-50/50 rounded-3xl border-2 border-rose-500 p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md animate-bounce">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                      Cryptographic Anomaly Alert
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-rose-950">
                      TAMPERED RECORD DETECTED
                    </h2>
                    <p className="text-xs text-rose-800">
                      SHA-256 Checksum failed! Record does not match institutional ledger signature.
                    </p>
                  </div>
                </div>

                <div className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-xs shadow-sm uppercase tracking-wider">
                  State: Tampered
                </div>
              </div>

              {/* Visual Tamper-Detection Indicator */}
              <div className="bg-white p-6 rounded-2xl border border-rose-300 space-y-4 mb-6">
                <div className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Visual Tamper-Detection Breakdown:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
                      Registered Issuer Master Hash:
                    </span>
                    <div className="text-emerald-700 font-bold break-all mt-1">
                      {verificationResult.tamper_details?.expected_hash}
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-600 uppercase font-sans font-semibold">
                      Altered / Injected Hash (Mismatch):
                    </span>
                    <div className="text-rose-700 font-bold break-all mt-1">
                      {verificationResult.tamper_details?.calculated_hash}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-rose-100/70 rounded-xl text-xs text-rose-950 font-medium">
                  <strong>Fraud Sentinel Report:</strong> Candidate CGPA or marks were modified post-issuance. The alteration has been registered in the platform audit ledger.
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: CONSENT REQUIRED (YELLOW) */}
          {verificationResult.verification_state === 'Consent Required' && (
            <div className="bg-amber-50 rounded-3xl border-2 border-amber-400 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    Privacy-by-Design Enforcement
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                    STUDENT CONSENT REQUIRED
                  </h2>
                  <p className="text-xs text-amber-800">
                    The student has not authorized {verifierName} to view their full academic records.
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-amber-300 text-xs text-slate-700 space-y-2">
                <p>
                  In accordance with the <strong>Digital Personal Data Protection (DPDP) Act 2023</strong> and ShikshaSetu privacy-by-design policy, academic records are sealed until the candidate approves your request.
                </p>
                <div className="pt-2 border-t border-slate-200 font-mono text-slate-600">
                  Student Masked Reference: <strong className="text-slate-900">{verificationResult.consent_required_info?.masked_apaar_id}</strong>
                </div>
              </div>
            </div>
          )}

          {/* STATE 4: EXPIRED (ORANGE) */}
          {verificationResult.verification_state === 'Expired' && (
            <div className="bg-amber-50 rounded-3xl border-2 border-amber-500 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-amber-950">
                    CONSENT GRANT EXPIRED
                  </h2>
                  <p className="text-xs text-amber-800">
                    The access window granted by the candidate has lapsed.
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-300 text-xs text-slate-700">
                {verificationResult.message}
              </div>
            </div>
          )}

          {/* STATE 5: INVALID (GRAY) */}
          {verificationResult.verification_state === 'Invalid' && (
            <div className="bg-slate-100 rounded-3xl border-2 border-slate-300 p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-600 text-white flex items-center justify-center">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    RECORD NOT FOUND / INVALID IDENTIFIER
                  </h2>
                  <p className="text-xs text-slate-600">
                    No academic credential matching this hash or APAAR ID is registered in the institutional repository.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History of Verification Attempts */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">Verification Ledger History</h2>
          </div>
          <span className="text-xs text-slate-500">Live Audit Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Credential / APAAR ID</th>
                <th className="py-2.5 px-3">Verifier</th>
                <th className="py-2.5 px-3">Verification State</th>
                <th className="py-2.5 px-3">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {verificationLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {log.timestamp.split('T')[0]} {log.timestamp.split('T')[1]?.slice(0, 5)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                    {log.credential_id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-800">{log.verifier_name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      log.verification_state === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                      log.verification_state === 'Tampered' ? 'bg-rose-100 text-rose-800' :
                      log.verification_state === 'Expired' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.verification_state}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">{log.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
