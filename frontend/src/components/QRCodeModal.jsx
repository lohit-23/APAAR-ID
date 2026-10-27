import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, ShieldCheck, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function QRCodeModal({ isOpen, onClose, credential, onNavigateToVerify }) {
  const { showToast } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !credential) return null;

  const qrPayload = credential.qr_code_payload || `SHIKSHASETU:VERIFY:${credential.id}:${credential.apaar_id}`;
  const verificationUrl = `${window.location.origin}/verify?id=${encodeURIComponent(credential.id)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    showToast('Verification URL copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Tricolor top stripe */}
        <div className="tricolor-stripe" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Credential QR Verification</h3>
              <p className="text-xs text-slate-500">Tamper-evident verification token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/80 mb-4 inline-block">
            <QRCodeSVG
              value={qrPayload}
              size={180}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231E3A8A'><path d='M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 8.7L4.7 7 12 3.7 19.3 7 12 10.7z'/></svg>",
                height: 28,
                width: 28,
                excavate: true,
              }}
            />
          </div>

          <h4 className="font-bold text-slate-800 text-lg mb-1">{credential.title}</h4>
          <p className="text-xs text-slate-500 mb-3">{credential.institution_name}</p>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full border border-emerald-200 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {credential.signature_status || 'Digitally Signed & Valid'}
          </div>

          <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-left mb-5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Cryptographic Hash (SHA-256)
            </div>
            <code className="text-xs text-slate-700 font-mono break-all line-clamp-2 select-all">
              {credential.mock_hash}
            </code>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Link' : 'Copy Verification Link'}
            </button>
            <button
              onClick={() => {
                onClose();
                if (onNavigateToVerify) onNavigateToVerify(credential.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs shadow-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Verify in Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
