import React, { useState } from 'react';
import {
  Sliders,
  ShieldCheck,
  RefreshCw,
  Lock,
  Database,
  Bell,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { resetAllDemoData, showToast } = useAuth();
  const [autoExpireHours, setAutoExpireHours] = useState('24');
  const [notifyOnVerification, setNotifyOnVerification] = useState(true);
  const [requireConsentForMarkssheets, setRequireConsentForMarkssheets] = useState(true);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    showToast('Platform security & privacy preferences saved!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">Security & Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure zero-trust privacy defaults, cryptographic key parameters, and evaluation reset controls.
        </p>
      </div>

      <div className="space-y-6">
        {/* Privacy Defaults */}
        <form onSubmit={handleSavePreferences} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-700" />
            Privacy & Consent Policy Controls
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Default Share Link Expiry</div>
                <div className="text-slate-500">Auto-revoke public sharing links after duration</div>
              </div>
              <select
                value={autoExpireHours}
                onChange={(e) => setAutoExpireHours(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="1">1 Hour</option>
                <option value="24">24 Hours</option>
                <option value="168">7 Days</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Instant Verification Alerts</div>
                <div className="text-slate-500">Notify student dashboard whenever an employer verifies a credential</div>
              </div>
              <input
                type="checkbox"
                checked={notifyOnVerification}
                onChange={(e) => setNotifyOnVerification(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">Strict Marksheet Privacy Shield</div>
                <div className="text-slate-500">Require individual consent toggle before displaying semester marksheets</div>
              </div>
              <input
                type="checkbox"
                checked={requireConsentForMarkssheets}
                onChange={(e) => setRequireConsentForMarkssheets(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            Save Security Preferences
          </button>
        </form>

        {/* Prototype Reset Controls */}
        <div className="bg-rose-50/50 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-rose-950">Evaluation Demo Data Reset</h2>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            Need a fresh test run for hackathon judges? Clicking below will reset all modified credentials, consent grants, and anomaly alerts back to their original seeded states.
          </p>

          <button
            onClick={resetAllDemoData}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Entire Database to Seed State
          </button>
        </div>
      </div>
    </div>
  );
}
