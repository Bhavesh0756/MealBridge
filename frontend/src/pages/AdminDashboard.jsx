import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Building,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { authApi } from '../api/auth';
import { donationsApi } from '../api/donations';

export function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'logs'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [uData, logsData] = await Promise.all([
        authApi.getAdminUsers().catch(() => []),
        authApi.getAuditLogs().catch(() => []),
      ]);
      setUsers(uData.results || uData || []);
      setAuditLogs(logsData.results || logsData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (userId, action) => {
    const notes = prompt(`Provide administrative notes for ${action}:`, `Verified compliance with platform standards.`);
    if (notes === null) return;

    try {
      setActionLoading(true);
      await authApi.verifyUser(userId, action, notes);
      loadAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Verification action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingUsers = users.filter((u) => u.verification_status === 'PENDING');
  const verifiedUsers = users.filter((u) => u.verification_status === 'VERIFIED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              Administrative Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Platform Verification & Audit
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Pending Verifications</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{pendingUsers.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Requiring identity checks</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Verified Accounts</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{verifiedUsers.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Approved platform actors</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Registered Users</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{users.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Donors, NGOs, Volunteers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Audit Events Logged</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">{auditLogs.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Transactional traceability</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'verification' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Verification Queue ({pendingUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logs' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* Verification Queue Tab */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h2 className="font-extrabold text-base text-slate-900">
              Users & Organizations Awaiting Verification
            </h2>
            <p className="text-xs text-slate-500">
              Verify credentials, licenses, and NGO status to ensure trust and food safety compliance.
            </p>
          </div>

          <div className="p-5 space-y-4">
            {pendingUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-50" />
                <p className="text-xs font-medium">No pending user verification requests! All queue processed.</p>
              </div>
            ) : (
              pendingUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{u.email}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900">
                        {u.role}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-0.5">
                      {u.role === 'DONOR' && (
                        <p>
                          Org: <strong>{u.donor_profile?.organization_name}</strong> • Type: {u.donor_profile?.donor_type} • License: {u.donor_profile?.license_number || 'N/A'}
                        </p>
                      )}
                      {u.role === 'NGO' && (
                        <p>
                          NGO: <strong>{u.ngo_profile?.organization_name}</strong> • Reg: {u.ngo_profile?.registration_number || 'N/A'} • Capacity: {u.ngo_profile?.daily_capacity_meals} meals
                        </p>
                      )}
                      {u.role === 'VOLUNTEER' && (
                        <p>
                          Volunteer: <strong>{u.volunteer_profile?.full_name}</strong> • Vehicle: {u.volunteer_profile?.vehicle_type} • Max Payload: {u.volunteer_profile?.max_transport_capacity_kg} kg
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(u.id, 'reject')}
                      disabled={actionLoading}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(u.id, 'approve')}
                      disabled={actionLoading}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      Approve & Verify ✓
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h2 className="font-extrabold text-base text-slate-900">
              System Audit Trail & Compliance Events
            </h2>
            <p className="text-xs text-slate-500">
              Immutable logs for critical operations: donation creation, acceptance, pickup state changes, and verification.
            </p>
          </div>

          <div className="p-5 max-h-[500px] overflow-y-auto space-y-3 font-mono text-xs">
            {auditLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No audit logs recorded.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-bold text-slate-700">[{log.action}]</span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-800">
                    Actor: <span className="text-purple-700 font-semibold">{log.user_email || 'System'}</span> • Entity: {log.entity_type} #{log.entity_id}
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-slate-500 text-[11px] truncate">
                      Payload: {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
