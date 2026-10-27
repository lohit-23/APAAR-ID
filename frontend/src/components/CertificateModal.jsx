import React from 'react';
import { X, Download, ShieldCheck, Award, Printer, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function CertificateModal({ isOpen, onClose, credential, student }) {
  const { showToast } = useAuth();

  if (!isOpen || !credential) return null;

  const handleDownload = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0B2545', '#FF9933', '#138808', '#F59E0B']
    });
    showToast('Mock Academic Certificate (PDF) generated and downloaded!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-300 overflow-hidden my-8">
        {/* Tricolor top border */}
        <div className="tricolor-stripe" />

        {/* Action bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Official Academic Credential Viewer
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
              Demo Prototype
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Mock PDF
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas Area */}
        <div className="p-8 md:p-12 bg-amber-50/20 border-8 border-double border-amber-600/30 m-4 rounded-xl relative">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <Award className="w-96 h-96 text-slate-900" />
          </div>

          <div className="relative text-center">
            {/* Header / Emblem */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-lg border-2 border-amber-500/50 mb-3">
                <Award className="w-8 h-8 text-amber-300" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-blue-950 font-serif uppercase">
                {credential.institution_name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  AICTE Approved Institution • Demo
                </span>
                <span className="text-xs text-slate-500">
                  Govt. of NCT of Delhi / AICTE Consortium
                </span>
              </div>
            </div>

            <div className="text-xs uppercase tracking-widest text-amber-800 font-semibold mb-2">
              National Academic Depository (NAD) & APAAR Registry
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 font-serif mb-6 text-blue-900">
              {credential.title}
            </h3>

            <p className="text-sm text-slate-600 italic mb-2">This is to officially certify that</p>
            
            <h4 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-wide font-serif mb-2 underline decoration-amber-500/50 decoration-2 underline-offset-8">
              {credential.student_name || (student && student.full_name) || "Aarav Sharma"}
            </h4>

            <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-slate-600 my-4 bg-white/80 py-2 px-4 rounded-lg inline-block border border-slate-200">
              <span>APAAR ID: <strong className="text-blue-900">{credential.apaar_id}</strong></span>
              <span>•</span>
              <span>Enrollment: <strong>{student ? student.enrollment_number : '2021/DTU/CO/402'}</strong></span>
              {credential.cgpa && (
                <>
                  <span>•</span>
                  <span>Cumulative CGPA: <strong className="text-emerald-700">{credential.cgpa} / 10.0</strong></span>
                </>
              )}
            </div>

            <p className="max-w-xl mx-auto text-sm text-slate-700 leading-relaxed mb-8">
              {credential.description || `has fulfilled all prescribed academic curriculum and examination standards for the conferral of ${credential.title}.`}
            </p>

            {/* Certificate Footer / Signatures */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end text-left text-xs">
              <div>
                <p className="text-slate-400 uppercase text-[10px] font-semibold">Issue Date</p>
                <p className="font-semibold text-slate-800">{credential.issue_date}</p>
                <p className="text-[10px] text-slate-400 mt-1">Credential Ref: {credential.id}</p>
              </div>

              <div className="text-center">
                <div className="inline-flex flex-col items-center p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mb-1" />
                  <span className="text-[11px] font-bold text-emerald-900">
                    {credential.signature_status}
                  </span>
                  <span className="text-[9px] text-emerald-700">SHA-256 Tamper Protected</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-serif italic text-base text-slate-800 mb-1">
                  Dr. R.K. Singhal
                </div>
                <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                  Controller of Examinations / Registrar
                </div>
              </div>
            </div>

            {/* Cryptographic Hash Bar */}
            <div className="mt-6 pt-3 border-t border-slate-200/80 text-[10px] font-mono text-slate-400 break-all text-center">
              SHA-256 Hash: {credential.mock_hash}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
