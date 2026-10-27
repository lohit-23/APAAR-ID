import React, { useState, useEffect } from 'react';
import {
  Award,
  KeyRound,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import QRCodeModal from '../components/QRCodeModal';
import CertificateModal from '../components/CertificateModal';

export default function CredentialWalletPage({ onNavigate }) {
  const { student, showToast } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCredForQr, setSelectedCredForQr] = useState(null);
  const [selectedCredForCert, setSelectedCredForCert] = useState(null);

  const studentId = student?.id || 'std-01';

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const res = await api.getCredentials({ student_id: studentId });
      if (res?.status === 'success') {
        setCredentials(res.data);
      }
    } catch (err) {
      console.error('Failed to load credentials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, [studentId]);

  const handleCopyHash = (hash, id) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    showToast('Cryptographic SHA-256 hash copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleTamper = async (credId) => {
    try {
      const res = await api.toggleTamper(credId);
      if (res?.status === 'success') {
        const stateText = res.is_tampered ? 'TAMPERED (Demo Alert Triggered!)' : 'RESTORED (Original Signature Valid)';
        showToast(`Credential state updated to: ${stateText}`, res.is_tampered ? 'error' : 'success');
        loadCredentials();
      }
    } catch (err) {
      showToast('Failed to toggle tamper state', 'error');
    }
  };

  const filteredCredentials = credentials.filter((c) => {
    if (filterType === 'all') return true;
    return c.credential_type === filterType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Academic Credential Wallet</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              {credentials.length} Cryptographic Assets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-proof verifiable credentials issued by AICTE institutions and linked to APAAR ID: {student?.masked_apaar_id || 'XXXX-XXXX-4402'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Assets' },
            { id: 'degree', label: 'Degrees' },
            { id: 'marksheet', label: 'Marksheets' },
            { id: 'skill_badge', label: 'AICTE Badges' },
            { id: 'internship', label: 'Internships' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCredentials.map((cred) => {
          const isTampered = cred.is_tampered || cred.signature_status === 'Signature Tampered';

          return (
            <div
              key={cred.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm transition-all flex flex-col justify-between ${
                isTampered
                  ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-300'
                  : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div>
                {/* Top badge bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    cred.credential_type === 'degree' ? 'bg-purple-100 text-purple-800' :
                    cred.credential_type === 'skill_badge' ? 'bg-amber-100 text-amber-900' :
                    cred.credential_type === 'internship' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {cred.credential_type.replace('_', ' ')}
                  </span>

                  <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                    isTampered
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {isTampered ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    {cred.signature_status}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{cred.title}</h3>
                <p className="text-xs text-slate-600 mb-4">{cred.institution_name}</p>

                {/* Metadata badges */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Credential ID</span>
                    <div className="font-mono font-bold text-slate-800 truncate">{cred.id}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Issue Date</span>
                    <div className="font-semibold text-slate-800">{cred.issue_date}</div>
                  </div>
                  {cred.cgpa && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">CGPA / Grade</span>
                      <div className="font-bold text-emerald-700">{cred.cgpa} ({cred.grade || 'First Class'})</div>
                    </div>
                  )}
                  {cred.skills_covered?.length > 0 && (
                    <div className="col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Skills Endorsed:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cred.skills_covered.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SHA-256 Hash Display */}
                <div className="bg-slate-900 text-slate-300 p-2.5 rounded-xl text-left text-xs font-mono mb-4 flex items-center justify-between gap-2">
                  <div className="truncate text-[11px] font-mono select-all">
                    <span className="text-slate-500 mr-1">HASH:</span>
                    {cred.mock_hash}
                  </div>
                  <button
                    onClick={() => handleCopyHash(cred.mock_hash, cred.id)}
                    className="p-1 hover:text-white transition-colors shrink-0"
                    title="Copy SHA-256 Hash"
                  >
                    {copiedId === cred.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCredForCert(cred)}
                    className="px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-colors"
                  >
                    View Certificate
                  </button>
                  <button
                    onClick={() => setSelectedCredForQr(cred)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    QR Code
                  </button>
                </div>

                {/* Judge Demo Feature: Toggle Tampering */}
                <button
                  onClick={() => handleToggleTamper(cred.id)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                    isTampered
                      ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                      : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                  }`}
                  title="Simulate cryptographic tampering for hackathon evaluation"
                >
                  {isTampered ? '✓ Tampered (Click to Restore)' : '⚡ Simulate Tampering'}
                </button>
              </div>
            </div>
          );
        })}
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
        student={student}
      />
    </div>
  );
}
