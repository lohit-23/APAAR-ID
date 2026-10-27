import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  Building2,
  Users,
  ShieldCheck,
  Award,
  Activity,
  History,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cpu,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function SuperAdminDashboard({ onNavigate }) {
  const { showToast } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [anRes, healthRes, instRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getSystemHealth(),
        api.getInstitutions()
      ]);

      if (anRes?.status === 'success') setAnalytics(anRes);
      if (healthRes?.status === 'success') setSystemHealth(healthRes);
      if (instRes?.status === 'success') setInstitutions(instRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleInstStatus = async (instId) => {
    try {
      const res = await api.toggleInstitutionStatus(instId);
      if (res?.status === 'success') {
        showToast(`Institution status updated to: ${res.new_status}`, 'success');
        loadAdminData();
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
            <h1 className="text-2xl font-bold text-slate-900">AICTE National Operations Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-900">
              Super Admin Node
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pan-institutional governance, AICTE approval verifications, system health, and tamper-evident audit ledger monitoring.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Students</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {analytics?.metrics?.total_students || 8}
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Mock APAAR Registry</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">AICTE Institutions</span>
          <div className="text-2xl font-black text-indigo-700 mt-1">
            {analytics?.metrics?.total_institutions || 3}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-0.5">Participating nodes</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Issued Credentials</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {analytics?.metrics?.total_credentials_issued || 8}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">SHA-256 Anchored</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Verifications</span>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {analytics?.metrics?.total_verifications_performed || 3}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-0.5">Public queries logged</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold uppercase text-slate-400">Flagged Anomalies</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {analytics?.metrics?.active_anomaly_alerts || 2}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">AI Sentinel alerts</div>
        </div>
      </div>

      {/* System Health / Blockchain-Style Hash Continuity Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Tamper-Evident Ledger Integrity & Node Consensus
              </h2>
              <p className="text-xs text-slate-400">
                Mock blockchain-style cryptographic hash chain continuity check
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            {systemHealth?.ledger_health || '100% Intact & Tamper-Evident'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Consensus Architecture</span>
            <div className="text-xs font-bold text-white mt-1">
              {systemHealth?.consensus_protocol || 'Proof of Authority (AICTE Consortium)'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Anchored Blocks</span>
            <div className="text-xs font-bold text-emerald-400 mt-1 font-mono">
              {systemHealth?.total_anchored_blocks || 14825} Blocks
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 md:col-span-2">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Head Block Hash</span>
            <div className="text-xs font-mono text-amber-300 truncate mt-1 select-all">
              {systemHealth?.last_block_hash || '0000a18f99e312bc4f9810aa72412b189914bc8a8812450123'}
            </div>
          </div>
        </div>

        {/* Validator Nodes */}
        <div>
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Consortium Validator Nodes
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {systemHealth?.validator_nodes?.map((node, nIdx) => (
              <div key={nIdx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
                <div className="font-bold text-slate-200">{node.node}</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">{node.status}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manage AICTE Demo Institutions Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">Manage & Approve Institutions</h2>
          </div>
          <span className="text-xs text-slate-500">{institutions.length} Institutions Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">AICTE ID</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Accreditation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {institutions.map((inst) => {
                const isApproved = inst.approval_status?.includes('Approved');
                return (
                  <tr key={inst.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{inst.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{inst.aicte_id}</td>
                    <td className="py-3 px-4 text-slate-600">{inst.state}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{inst.accreditation}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {inst.approval_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleInstStatus(inst.id)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        {isApproved ? 'Set Review' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
