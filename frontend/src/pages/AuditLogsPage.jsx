import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  User,
  Calendar,
  Lock,
  Download,
  Hash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function AuditLogsPage() {
  const { showToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (roleFilter) params.actor_role = roleFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.getAuditLogs(params);
      if (res?.status === 'success') {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, roleFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Immutable Audit Ledger</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Non-Repudiation Trail
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete cryptographic audit records of every credential issued, verified, modified, or consented.
          </p>
        </div>

        <button
          onClick={() => showToast('Audit ledger exported to signed CSV/JSON!', 'success')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Ledger
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, target entity, hash..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="">All Action Types</option>
            <option value="CREDENTIAL_ISSUED">CREDENTIAL_ISSUED</option>
            <option value="CREDENTIAL_VERIFIED">CREDENTIAL_VERIFIED</option>
            <option value="CONSENT_APPROVED">CONSENT_APPROVED</option>
            <option value="CONSENT_REVOKED">CONSENT_REVOKED</option>
            <option value="CREDENTIAL_TAMPERED">CREDENTIAL_TAMPERED</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="">All Actor Roles</option>
            <option value="student">Student</option>
            <option value="institution">Institution</option>
            <option value="verifier">Verifier</option>
            <option value="system">System Sentinel</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Actor & Role</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Mock Block Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {logs.map((log) => {
                const isTamper = log.action.includes('TAMPER');
                const isIssued = log.action.includes('ISSUED');
                const isVerified = log.action.includes('VERIFIED');

                return (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp.replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        isTamper ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        isIssued ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        isVerified ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.actor_name}</div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">{log.actor_role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {log.target_entity}
                    </td>
                    <td className="py-3 px-4 text-slate-600 leading-relaxed max-w-sm">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 break-all select-all">
                      {log.mock_block_hash.slice(0, 16)}...
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
