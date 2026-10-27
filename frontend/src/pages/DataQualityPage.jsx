import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  Check,
  Calendar,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function DataQualityPage() {
  const { institution, showToast } = useAuth();
  const [qualityData, setQualityData] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const instId = institution?.id || 'inst-dtu';

  const loadData = async () => {
    setLoading(true);
    try {
      const [qRes, aRes] = await Promise.all([
        api.getDataQuality(instId),
        api.getAnomalies({ institution_id: instId })
      ]);

      if (qRes?.status === 'success') setQualityData(qRes);
      if (aRes?.status === 'success') setAnomalies(aRes.data);
    } catch (err) {
      console.error('Failed to load data quality:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [instId]);

  const handleResolveAnomaly = async (anomalyId) => {
    try {
      const res = await api.updateAnomalyStatus(anomalyId, 'resolved');
      if (res?.status === 'success') {
        showToast('Anomaly alert resolved and verification hold released.', 'success');
        loadData();
      }
    } catch (err) {
      showToast('Failed to resolve anomaly', 'error');
    }
  };

  const handleReviewAnomaly = async (anomalyId) => {
    try {
      const res = await api.updateAnomalyStatus(anomalyId, 'reviewing');
      if (res?.status === 'success') {
        showToast('Flagged record assigned to Academic Registrar for audit.', 'info');
        loadData();
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              Data Quality & AI Anomaly Sentinel
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
              Heuristic Fraud Detection Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated auditing of institutional records against duplication, CGPA inflation, and document omissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Institutional Health Index: {qualityData?.health_score || '92.4'}%
          </div>
        </div>
      </div>

      {/* 4 Quality Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Incomplete Records</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {qualityData?.quality_metrics?.incomplete_records_count || 2}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Missing ABC ID or Aadhaar e-KYC</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Duplicate Certificates</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {qualityData?.quality_metrics?.duplicate_flags_count || 1}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Hash collision flagged</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Invalid Calendar Dates</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {qualityData?.quality_metrics?.invalid_dates_count || 1}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Auto-sanitized by pipeline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Missing Mandated Docs</span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {qualityData?.quality_metrics?.missing_documents_count || 1}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Mandatory 60-day internship</p>
        </div>
      </div>

      {/* AI Anomaly Detection Section (High Priority Alert Cards) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Anomaly Detections (Action Required)</h2>
            <p className="text-xs text-slate-500">
              High-confidence flags identified by cryptographic & statistical anomaly models
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {anomalies.map((anom) => {
            const isResolved = anom.status === 'resolved';
            const isReviewing = anom.status === 'reviewing';

            return (
              <div
                key={anom.id}
                className={`bg-white rounded-3xl p-6 border shadow-sm transition-all ${
                  isResolved
                    ? 'border-emerald-200 bg-emerald-50/10 opacity-75'
                    : 'border-rose-300 bg-rose-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                      {anom.alert_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">{anom.id}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-rose-700">
                      AI Confidence: {Math.round(anom.confidence_score * 100)}%
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isReviewing
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {anom.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs font-semibold text-slate-800">
                    Target Student: <strong className="text-slate-900">{anom.student_name}</strong> • APAAR: <code className="text-blue-700 font-mono">{anom.apaar_id}</code>
                  </div>
                  <p className="text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {anom.description}
                  </p>
                </div>

                {/* Recommended Action & Trigger */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="text-slate-600">
                    <strong className="text-slate-900">Recommended Action:</strong> {anom.recommended_action}
                  </div>

                  {!isResolved && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewAnomaly(anom.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                      >
                        Set to In Review
                      </button>
                      <button
                        onClick={() => handleResolveAnomaly(anom.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Resolve & Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incomplete Records & Invalid Dates Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-amber-600" />
            Incomplete Profile Warnings
          </h2>
          <div className="space-y-3">
            {qualityData?.incomplete_records?.map((rec, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-900">{rec.student_name} ({rec.apaar_id})</div>
                  <div className="text-slate-500 mt-0.5">Missing: {rec.missing_field}</div>
                </div>
                <span className="font-bold text-amber-600">{rec.completion_percentage}% Complete</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Date & Syntax Sanitization Log
          </h2>
          <div className="space-y-3">
            {qualityData?.invalid_dates?.map((d, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900">{d.student_name} • Ref {d.credential_id}</div>
                <div className="text-slate-600">{d.reason}</div>
                <div className="text-emerald-700 font-semibold">{d.resolution}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
