import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { requestsApi } from '../api/requests';
import { matchingApi } from '../api/matching';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function NgoDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqs, recs] = await Promise.all([
        requestsApi.getRequests().catch(() => []),
        matchingApi.getRecommendations(30.0).catch(() => ({ matches: [] })),
      ]);
      setRequests(reqs.results || reqs || []);
      setRecommendations(recs.matches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelRequest = async (id) => {
    if (!confirm('Are you sure you want to cancel this request? Any reserved portions will be restored to public available stock.')) return;
    try {
      await requestsApi.cancelRequest(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel request.');
    }
  };

  const activeRequests = requests.filter((r) => ['PENDING', 'ACCEPTED'].includes(r.status));
  const fulfilledRequests = requests.filter((r) => r.status === 'FULFILLED');

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading NGO community requests & surplus intake...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              NGO Recipient Console
            </span>
            <span className="text-xs text-slate-500">{user?.ngo_profile?.organization_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Community Food Intake & Allocation
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition cursor-pointer"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/browse"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Browse All Available Surplus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Profile & Capacity Summary Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-blue-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified NGO Distribution Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {user?.ngo_profile?.organization_name || 'Community Shelter'}
          </h2>
          <p className="text-xs text-slate-300 max-w-lg">
            Daily Capacity: <strong>{user?.ngo_profile?.daily_capacity_meals || 200} meals</strong> •{' '}
            {user?.ngo_profile?.cold_storage_available ? (
              <span className="text-cyan-300 font-semibold">Certified Cold Storage Active ❄️</span>
            ) : (
              <span className="text-slate-400">Ambient Storage</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center shrink-0">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-2xl font-black text-white">{activeRequests.length}</div>
            <div className="text-[10px] text-slate-300">Active Requests</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-2xl font-black text-emerald-400">{fulfilledRequests.length}</div>
            <div className="text-[10px] text-slate-300">Delivered Meals</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <div className="text-2xl font-black text-amber-400">{recommendations.length}</div>
            <div className="text-[10px] text-slate-300">Smart Matches</div>
          </div>
        </div>
      </div>

      {/* Section: Smart Recommendations for this NGO */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-lg text-slate-900">
              Smart-Matched Food For Your Facility
            </h2>
          </div>
          <Link to="/matchmaker" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Explore Matching Logic →
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No active batches matched your shelter radius currently. Check the general feed!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.donation_id}
                className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                      {rec.match_score}% Match Score
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {rec.distance_km} km away
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{rec.title}</h3>
                  <p className="text-xs text-slate-500">{rec.donor_name} • {rec.pickup_address}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 my-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available:</span>
                      <span className="font-bold text-emerald-700">{rec.available_quantity} {rec.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Urgency:</span>
                      <span className="font-bold text-amber-700">{rec.remaining_hours}h remaining</span>
                    </div>
                  </div>

                  {/* Reasons pills */}
                  <div className="space-y-1 pt-1">
                    {rec.reasons?.map((r, i) => (
                      <div key={i} className="text-[11px] text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/browse"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition block"
                >
                  Request Allocation
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: My Food Requests Tracking Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              My Requests & Delivery Status Tracker
            </h2>
            <p className="text-xs text-slate-500">
              Track donor approval, automated quantity reservation, and live volunteer transit updates.
            </p>
          </div>
        </div>

        <div className="p-5">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <HeartHandshake className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-medium">You haven't requested any food donations yet.</p>
              <Link
                to="/browse"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Browse Surplus Feed
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl border transition ${
                    req.status === 'ACCEPTED'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : req.status === 'FULFILLED'
                      ? 'border-teal-200 bg-teal-50/20'
                      : req.status === 'REJECTED'
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">
                          {req.donation?.title || 'Donation Item'}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            req.status === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'FULFILLED'
                              ? 'bg-teal-100 text-teal-800'
                              : req.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : req.status === 'CANCELLED'
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Requested Quantity: <strong>{req.requested_quantity} {req.donation?.unit}</strong> • Pickup: {req.donation?.pickup_address}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.has_pickup_assignment && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100/70 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Delivery: {req.pickup_status}</span>
                        </div>
                      )}

                      {['PENDING', 'ACCEPTED'].includes(req.status) && (
                        <button
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes / Details Footer */}
                  <div className="pt-2 text-xs flex flex-wrap gap-4 text-slate-600">
                    {req.donor_notes && (
                      <div>
                        Donor Note: <strong className="text-slate-800">{req.donor_notes}</strong>
                      </div>
                    )}
                    {req.rejection_reason && (
                      <div className="text-rose-700">
                        Reason: <strong>{req.rejection_reason}</strong>
                      </div>
                    )}
                    <div className="text-slate-400 ml-auto">
                      Submitted: {new Date(req.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
