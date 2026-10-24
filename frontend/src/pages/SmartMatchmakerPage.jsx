import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  SlidersHorizontal,
  ShieldCheck,
  Check
} from 'lucide-react';
import { matchingApi } from '../api/matching';
import { requestsApi } from '../api/requests';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { ExpiryTimerRing } from '../components/ExpiryTimerRing';
import { SkeletonCard } from '../components/SkeletonLoader';

export function SmartMatchmakerPage() {
  const { isNgo, isAuthenticated } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const navigate = useNavigate();

  const [radius, setRadius] = useState(25);
  const [minScore, setMinScore] = useState(0); // 0 | 60 | 80
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Direct Allocation Modal
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [requestQty, setRequestQty] = useState('');
  const [beneficiaryNotes, setBeneficiaryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMatches = async (rad) => {
    try {
      setLoading(true);
      const res = await matchingApi.getRecommendations(rad);
      setMatches(res.matches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(radius);
  }, [radius]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => m.match_score >= minScore);
  }, [matches, minScore]);

  const handleOpenRequest = (match) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isNgo) {
      toastError('Only verified NGO accounts can request surplus allocations. Please switch to an NGO role.');
      return;
    }
    setSelectedMatch(match);
    setRequestQty(match.available_quantity);
    setBeneficiaryNotes(`Automated match request based on high match score (${match.match_score}%).`);
  };

  const handleConfirmRequest = async (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    const qty = parseFloat(requestQty);
    if (isNaN(qty) || qty <= 0 || qty > selectedMatch.available_quantity) {
      toastError(`Please enter a valid quantity up to ${selectedMatch.available_quantity} ${selectedMatch.unit}.`);
      return;
    }

    try {
      setSubmitting(true);
      await requestsApi.createRequest({
        donation: selectedMatch.donation_id,
        requested_quantity: qty,
        beneficiary_notes: beneficiaryNotes || 'Allocation requested via Smart Matchmaker engine.'
      });
      toastSuccess(`Allocation request for ${qty} ${selectedMatch.unit} submitted to donor!`);
      setSelectedMatch(null);
      fetchMatches(radius);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit allocation request.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Transparent Rule-Based Matchmaker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Smart Food Rescue Allocation Engine
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          MealBridge prioritizes donations using verified physical parameters: great-circle distance (Haversine formula), remaining food safety window, recipient daily capacity, and certified storage compatibility.
        </p>
      </div>

      {/* Matching Parameters Explainer Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Search Radius & Feasibility Filter</h3>
            <p className="text-xs text-slate-500">Adjust the transport range to explore nearby surplus matches.</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Min score chips */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setMinScore(0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  minScore === 0 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setMinScore(60)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  minScore === 60 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                &ge;60% Score
              </button>
              <button
                onClick={() => setMinScore(80)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  minScore === 80 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                &ge;80% Elite
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">{radius} km</span>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-28 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 5-Pillar Score Formula */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="font-extrabold text-sm text-emerald-800">30 Pts</div>
            <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Geographic Proximity</div>
            <div className="text-[10px] text-slate-400">Haversine formula &lt;3km</div>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="font-extrabold text-sm text-amber-800">25 Pts</div>
            <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Rescue Urgency</div>
            <div className="text-[10px] text-slate-400">Expiry deadline &lt;3 hrs</div>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="font-extrabold text-sm text-blue-800">20 Pts</div>
            <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Capacity Match</div>
            <div className="text-[10px] text-slate-400">Within daily shelter capacity</div>
          </div>
          <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-100">
            <div className="font-extrabold text-sm text-cyan-800">15 Pts</div>
            <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Storage Safe</div>
            <div className="text-[10px] text-slate-400">Cold chain verified</div>
          </div>
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <div className="font-extrabold text-sm text-purple-800">10 Pts</div>
            <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Trust Verification</div>
            <div className="text-[10px] text-slate-400">Verified donor partner</div>
          </div>
        </div>
      </div>

      {/* Match Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-slate-900">
            Ranked Recommendations ({filteredMatches.length})
          </h2>
          <span className="text-xs text-slate-500">Sorted by algorithmic rescue score</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            No active food listings match the {radius} km radius and minimum score criteria. Try extending the radius or lowering the score threshold.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((item) => (
              <motion.div
                key={item.donation_id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="stripe-card rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between bg-white"
              >
                <div className="space-y-3">
                  {/* Top Match Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                      {item.match_score}% Match Score
                    </span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {item.distance_km} km away
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Donor: <strong>{item.donor_name}</strong> • {item.pickup_address}
                    </p>
                  </div>

                  {/* Quantity & Urgency */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available Amount:</span>
                      <span className="font-bold text-emerald-700">{item.available_quantity} {item.unit}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Shelf-Life:</span>
                      <ExpiryTimerRing remainingHours={item.remaining_hours} size="sm" />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Handling:</span>
                      <span className="font-medium text-slate-800">{item.storage_requirement}</span>
                    </div>
                  </div>

                  {/* Match Reason Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Why this donation is recommended:
                    </span>
                    {item.reasons?.map((reason, idx) => (
                      <div key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{reason}</span>
                      </div>
                    ))}
                    {item.warnings?.map((warn, idx) => (
                      <div key={`w-${idx}`} className="text-xs text-amber-800 flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{warn}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenRequest(item)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Claim Allocation Directly</span>
                  </button>
                  <Link
                    to="/browse"
                    className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold text-center transition block"
                  >
                    View in Browse Feed →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Allocation Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    Smart Match Claim
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">
                    Request {selectedMatch.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmRequest} className="p-5 space-y-4">
                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span>Available Quantity:</span>
                    <span>{selectedMatch.available_quantity} {selectedMatch.unit}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Algorithm Score:</span>
                    <span className="font-bold text-emerald-700">{selectedMatch.match_score}%</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Donor Kitchen:</span>
                    <span>{selectedMatch.donor_name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantity to Rescue ({selectedMatch.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max={selectedMatch.available_quantity}
                    value={requestQty}
                    onChange={(e) => setRequestQty(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-[10px] text-slate-400">
                    Max: {selectedMatch.available_quantity} {selectedMatch.unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Beneficiary & Transport Notes
                  </label>
                  <textarea
                    rows={3}
                    value={beneficiaryNotes}
                    onChange={(e) => setBeneficiaryNotes(e.target.value)}
                    placeholder="E.g., Serving 80 homeless community members at evening community table."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedMatch(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Confirm Request ✓'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
