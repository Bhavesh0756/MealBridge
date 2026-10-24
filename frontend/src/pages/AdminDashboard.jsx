import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  FileText,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Building,
  Truck,
  HeartHandshake,
  AlertTriangle,
  XCircle,
  Download
} from 'lucide-react';
import { authApi } from '../api/auth';
import { useToast } from '../context/ToastContext';

export function AdminDashboard() {
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'directory' | 'logs'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [logFilterAction, setLogFilterAction] = useState('ALL');

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
    const defaultNote = action === 'approve'
      ? 'Verified credentials and compliance with food safety guidelines.'
      : 'Incomplete or unverified documentation.';
    const notes = prompt(`Provide administrative notes for ${action}:`, defaultNote);
    if (notes === null) return;

    try {
      setActionLoading(true);
      await authApi.verifyUser(userId, action, notes);
      if (action === 'approve') {
        toastSuccess('User account approved and verified successfully!');
      } else {
        toastInfo('User account application rejected.');
      }
      loadAdminData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification action failed.';
      toastError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toastInfo('No audit log entries available to export.');
      return;
    }
    const headers = ['ID', 'Timestamp', 'Action', 'Actor Email', 'Entity Type', 'Entity ID', 'Details'];
    const rows = filteredLogs.map((log) => [
      log.id,
      `"${log.timestamp}"`,
      `"${log.action}"`,
      `"${log.user_email || 'System'}"`,
      `"${log.entity_type}"`,
      `"${log.entity_id}"`,
      `"${JSON.stringify(log.details || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mealbridge_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess(`Exported ${filteredLogs.length} audit trail records to CSV!`);
  };

  const pendingUsers = users.filter((u) => u.verification_status === 'PENDING');
  const verifiedUsers = users.filter((u) => u.verification_status === 'VERIFIED');
  const rejectedUsers = users.filter((u) => u.verification_status === 'REJECTED');

  // Filtered users for directory and verification
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      // Status filter
      if (statusFilter !== 'ALL' && u.verification_status !== statusFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const emailMatch = u.email?.toLowerCase().includes(q);
        const nameMatch = (
          u.donor_profile?.organization_name ||
          u.ngo_profile?.organization_name ||
          u.volunteer_profile?.full_name ||
          u.username ||
          ''
        ).toLowerCase().includes(q);
        const phoneMatch = (
          u.donor_profile?.phone ||
          u.ngo_profile?.phone ||
          u.volunteer_profile?.phone ||
          ''
        ).toLowerCase().includes(q);
        if (!emailMatch && !nameMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (logFilterAction !== 'ALL' && !log.action?.includes(logFilterAction)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const actionMatch = log.action?.toLowerCase().includes(q);
        const userMatch = log.user_email?.toLowerCase().includes(q);
        const entityMatch = log.entity_type?.toLowerCase().includes(q);
        if (!actionMatch && !userMatch && !entityMatch) return false;
      }
      return true;
    });
  }, [auditLogs, logFilterAction, searchQuery]);

  if (loading && users.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading administrative audit and verification queue...</p>
      </div>
    );
  }

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
        <div
          onClick={() => { setActiveTab('verification'); setStatusFilter('PENDING'); }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 transition"
        >
          <p className="text-xs text-slate-500 font-medium">Pending Verifications</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{pendingUsers.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Requiring identity checks</p>
        </div>

        <div
          onClick={() => { setActiveTab('directory'); setStatusFilter('VERIFIED'); }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-400 transition"
        >
          <p className="text-xs text-slate-500 font-medium">Verified Accounts</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{verifiedUsers.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Approved platform actors</p>
        </div>

        <div
          onClick={() => { setActiveTab('directory'); setStatusFilter('ALL'); setRoleFilter('ALL'); }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-400 transition"
        >
          <p className="text-xs text-slate-500 font-medium">Total Registered Users</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{users.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Donors, NGOs, Volunteers</p>
        </div>

        <div
          onClick={() => setActiveTab('logs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-purple-400 transition"
        >
          <p className="text-xs text-slate-500 font-medium">Audit Events Logged</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-700 mt-1">{auditLogs.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Transactional traceability</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'verification' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Verification Queue ({pendingUsers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'directory' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>All Accounts Directory ({users.length})</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'logs' ? "Filter audit events by action, email, or entity ID..." : "Search users by email, organization, name, or phone..."}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {activeTab !== 'logs' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Roles</option>
              <option value="DONOR">Donors</option>
              <option value="NGO">NGOs</option>
              <option value="VOLUNTEER">Volunteers</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Verification</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <select
              value={logFilterAction}
              onChange={(e) => setLogFilterAction(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Audit Actions</option>
              <option value="USER_">User Lifecycle</option>
              <option value="DONATION_">Donations</option>
              <option value="REQUEST_">Requests</option>
              <option value="PICKUP_">Pickups & Deliveries</option>
            </select>
          </div>
        )}
      </div>

      {/* Verification Queue Tab */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Pending Identity & Verification Queue
              </h2>
              <p className="text-xs text-slate-500">
                Verify credentials, licenses, and NGO credentials before granting surplus food publishing & claiming access.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
              {filteredUsers.filter((u) => u.verification_status === 'PENDING').length} Pending
            </span>
          </div>

          <div className="p-5 space-y-4">
            {filteredUsers.filter((u) => u.verification_status === 'PENDING').length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-50" />
                <p className="text-xs font-medium">No pending verification requests matching your filter criteria.</p>
              </div>
            ) : (
              filteredUsers
                .filter((u) => u.verification_status === 'PENDING')
                .map((u) => (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-amber-50/40"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{u.email}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900">
                          {u.role}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-0.5">
                        {u.role === 'DONOR' && (
                          <p>
                            Org: <strong>{u.donor_profile?.organization_name || 'N/A'}</strong> • Type: {u.donor_profile?.donor_type} • License: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{u.donor_profile?.license_number || 'N/A'}</span> • Phone: {u.donor_profile?.phone || 'N/A'}
                          </p>
                        )}
                        {u.role === 'NGO' && (
                          <p>
                            NGO: <strong>{u.ngo_profile?.organization_name || 'N/A'}</strong> • Reg: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{u.ngo_profile?.registration_number || 'N/A'}</span> • Daily Capacity: {u.ngo_profile?.daily_capacity_meals || 0} meals • Cold Storage: {u.ngo_profile?.has_cold_storage ? 'Yes ❄️' : 'No'}
                          </p>
                        )}
                        {u.role === 'VOLUNTEER' && (
                          <p>
                            Volunteer: <strong>{u.volunteer_profile?.full_name || 'N/A'}</strong> • Vehicle: {u.volunteer_profile?.vehicle_type} • Max Payload: {u.volunteer_profile?.max_transport_capacity_kg || 0} kg • Phone: {u.volunteer_profile?.phone || 'N/A'}
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

      {/* All Accounts Directory Tab */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Registered Platform Accounts Directory
              </h2>
              <p className="text-xs text-slate-500">
                Manage roles, view verified status, and moderate participant access across the ecosystem.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredUsers.length} of {users.length} accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3">User / Organization</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">
                      No users match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const orgOrName =
                      u.donor_profile?.organization_name ||
                      u.ngo_profile?.organization_name ||
                      u.volunteer_profile?.full_name ||
                      u.username;
                    const phone =
                      u.donor_profile?.phone ||
                      u.ngo_profile?.phone ||
                      u.volunteer_profile?.phone ||
                      '-';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-slate-900">{orgOrName}</p>
                          <p className="text-slate-400 text-[11px]">{u.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            u.role === 'DONOR' ? 'bg-emerald-100 text-emerald-800' :
                            u.role === 'NGO' ? 'bg-blue-100 text-blue-800' :
                            u.role === 'VOLUNTEER' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                          {phone}
                        </td>
                        <td className="px-4 py-3.5">
                          {u.verification_status === 'VERIFIED' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : u.verification_status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {u.verification_status !== 'VERIFIED' && (
                              <button
                                onClick={() => handleVerify(u.id, 'approve')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {u.verification_status !== 'REJECTED' && (
                              <button
                                onClick={() => handleVerify(u.id, 'reject')}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                System Audit Trail & Compliance Events
              </h2>
              <p className="text-xs text-slate-500">
                Immutable logs for operations: donation creation, acceptance, pickup changes, and identity approvals.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500">
                Showing {filteredLogs.length} events
              </span>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition cursor-pointer"
                title="Download audit records as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="p-5 max-h-[550px] overflow-y-auto space-y-3 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No audit logs matching search/filter criteria.</p>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1 hover:border-purple-200 transition"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      [{log.action}]
                    </span>
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-800">
                    Actor: <span className="text-slate-900 font-semibold">{log.user_email || 'System'}</span> • Entity: <span className="font-semibold text-slate-600">{log.entity_type} #{log.entity_id}</span>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <div className="text-slate-500 text-[11px] bg-white p-2 rounded border border-slate-200 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
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
