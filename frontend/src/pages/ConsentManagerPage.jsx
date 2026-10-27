import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Link,
  Copy,
  Check,
  AlertTriangle,
  ChevronRight,
  Sliders,
  Calendar,
  Share2,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function ConsentManagerPage() {
  const { student, showToast } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Time-limited link generator state
  const [shareDuration, setShareDuration] = useState(24);
  const [sharePurpose, setSharePurpose] = useState('Self-Verification for Job Application');
  const [shareFields, setShareFields] = useState({
    profile: true,
    degree: true,
    marksheets: true,
    certificates: false,
    skills: true,
  });
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal for editing granular permissions
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editPermissions, setEditPermissions] = useState({
    profile: true,
    degree: true,
    marksheets: false,
    certificates: false,
    skills: true,
  });

  const studentId = student?.id || 'std-01';

  const loadConsentRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getConsentRequests({ student_id: studentId });
      if (res?.status === 'success') {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to load consent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsentRequests();
  }, [studentId]);

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const payload = {
        status: newStatus,
        share_profile: editPermissions.profile,
        share_degree: editPermissions.degree,
        share_marksheets: editPermissions.marksheets,
        share_certificates: editPermissions.certificates,
        share_skills: editPermissions.skills,
      };
      const res = await api.updateConsentStatus(requestId, payload);
      if (res?.status === 'success') {
        showToast(`Consent request ${newStatus.toUpperCase()} successfully!`, 'success');
        setSelectedRequest(null);
        loadConsentRequests();
      }
    } catch (err) {
      showToast('Failed to update consent request', 'error');
    }
  };

  const handleCreateShareLink = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student_id: studentId,
        duration_hours: parseInt(shareDuration),
        purpose: sharePurpose,
        share_profile: shareFields.profile,
        share_degree: shareFields.degree,
        share_marksheets: shareFields.marksheets,
        share_certificates: shareFields.certificates,
        share_skills: shareFields.skills,
      };
      const res = await api.createShareLink(payload);
      if (res?.status === 'success') {
        setGeneratedLink(res);
        showToast('Secure time-limited sharing link generated!', 'success');
        loadConsentRequests();
      }
    } catch (err) {
      showToast('Failed to generate sharing link', 'error');
    }
  };

  const handleCopyLink = () => {
    if (!generatedLink) return;
    const fullUrl = `${window.location.origin}${generatedLink.share_url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast('Secure verification link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Privacy & Consent Manager</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              DPDP Act 2023 Aligned
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Control which verifiers can view your academic credentials, grant selective field permissions, or revoke access anytime.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'approved', label: 'Active Grants' },
            { id: 'pending', label: 'Pending (Review)' },
            { id: 'expired', label: 'Expired' },
            { id: 'revoked', label: 'Revoked' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Consent Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Access Requests & Clearances</h2>
            <span className="text-xs text-slate-500">{filteredRequests.length} records</span>
          </div>

          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const isApproved = req.status === 'approved';
              const isPending = req.status === 'pending';
              const isExpired = req.status === 'expired';
              const isRevoked = req.status === 'revoked';

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-3xl p-6 border shadow-sm transition-all ${
                    isApproved
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : isPending
                      ? 'border-amber-300 bg-amber-50/20'
                      : isExpired
                      ? 'border-slate-200 opacity-80'
                      : 'border-rose-200 bg-rose-50/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                        {req.verifier_name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{req.verifier_name}</h3>
                        <div className="text-xs text-slate-500">{req.verifier_type}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isPending
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isExpired
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4 leading-relaxed">
                    <strong>Purpose:</strong> {req.purpose}
                  </p>

                  {/* Consented Fields Chips */}
                  <div className="mb-4">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                      Authorized Data Fields:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {req.requested_fields.map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 capitalize flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expiry and Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Valid until: <strong>{req.valid_until.split('T')[0]}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setEditPermissions({
                                profile: true,
                                degree: true,
                                marksheets: true,
                                certificates: false,
                                skills: true,
                              });
                            }}
                            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl transition-colors shadow-sm"
                          >
                            Review & Grant
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'revoked')}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-xl transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Revoke Access
                        </button>
                      )}

                      {(isExpired || isRevoked) && (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setEditPermissions({
                              profile: true,
                              degree: true,
                              marksheets: false,
                              certificates: false,
                              skills: true,
                            });
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                        >
                          Renew Consent
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Create Time-Limited Sharing Link */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <Share2 className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Create Secure Sharing Link</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Generate a temporary, privacy-filtered link for job portals or interviewers without exposing unconsented data.
            </p>

            <form onSubmit={handleCreateShareLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose / Intended Recipient
                </label>
                <input
                  type="text"
                  value={sharePurpose}
                  onChange={(e) => setSharePurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Link Validity Duration
                </label>
                <select
                  value={shareDuration}
                  onChange={(e) => setShareDuration(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 Hour (Single Interview Session)</option>
                  <option value={24}>24 Hours (Standard Review)</option>
                  <option value={168}>7 Days (Campus Placement Round)</option>
                  <option value={720}>30 Days (Extended Recruitment)</option>
                </select>
              </div>

              {/* Granular Field Toggles */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Data Fields to Share:
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                  {Object.entries({
                    profile: 'Basic Profile (Name, APAAR ID, College)',
                    degree: 'Degree Certificate & CGPA',
                    marksheets: 'Detailed Semester Marksheets',
                    certificates: 'Additional Certificates',
                    skills: 'AICTE Verified Skill Badges',
                  }).map(([fieldKey, fieldLabel]) => (
                    <label key={fieldKey} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareFields[fieldKey]}
                        onChange={(e) =>
                          setShareFields({ ...shareFields, [fieldKey]: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span className="font-medium text-slate-800">{fieldLabel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Generate Link
              </button>
            </form>

            {/* Generated Link Result */}
            {generatedLink && (
              <div className="mt-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fadeIn space-y-2">
                <div className="text-xs font-bold text-emerald-900">Link Ready for Sharing:</div>
                <div className="p-2 bg-white rounded-xl border border-emerald-300 font-mono text-[11px] text-slate-700 break-all select-all">
                  {window.location.origin}{generatedLink.share_url}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied to Clipboard' : 'Copy Share Link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Reviewing and Granting Granular Consent */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Grant Access to {selectedRequest.verifier_name}
            </h3>
            <p className="text-xs text-slate-600">
              Select precisely which data elements this verifier is allowed to inspect.
            </p>

            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              {Object.entries({
                profile: 'Student Profile & Enrollment',
                degree: 'Degree Award & CGPA',
                marksheets: 'Semester Marksheets',
                certificates: 'Certificates & Internships',
                skills: 'Skill Badges & Endorsements',
              }).map(([k, label]) => (
                <label key={k} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermissions[k]}
                    onChange={(e) =>
                      setEditPermissions({ ...editPermissions, [k]: e.target.checked })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="font-semibold text-slate-800">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')}
                className="flex-1 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm"
              >
                Authorize & Grant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
