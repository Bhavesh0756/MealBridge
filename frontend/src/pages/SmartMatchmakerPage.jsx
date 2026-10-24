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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 cyber-dots">
      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-200/80">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-black uppercase tracking-widest border border-amber-300/60 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>Algorithmic Allocation Intelligence</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black text-white tracking-tight">
          Smart Food Rescue Allocation Engine
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          MealBridge prioritizes donations using verified physical parameters: great-circle distance (Haversine formula), remaining food safety window, recipient daily capacity, and certified storage compatibility.
        </p>
      </div>

      {/* Matching Parameters Explainer Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-white">Search Radius & Feasibility Filter</h3>
            <p className="text-xs text-slate-500">Adjust the transport range to explore nearby surplus matches.</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {/* Min score chips */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-2xs">
              <button
                onClick={() => setMinScore(0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  minScore === 0 ? 'bg-[#111827] text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setMinScore(60)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  minScore === 60 ? 'bg-[#111827] text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]' : 'text-slate-400 hover:text-white'
                }`}
              >
                &ge;60% Score
              </button>
              <button
                onClick={() => setMinScore(80)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  minScore === 80 ? 'bg-[#111827] text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]' : 'text-slate-400 hover:text-white'
                }`}
              >
                &ge;80% Elite
              </button>
            </div>

            <div className="flex items-center gap-2.5 bg-[#0f1923] px-3.5 py-1.5 rounded-2xl border border-white/10">
              <span className="text-xs font-black text-slate-100">{radius} km</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-4 border-t border-white/6 text-center">
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/60 card-interactive shadow-xs hover:border-emerald-400">
            <div className="font-display font-black text-base text-emerald-800">30 Pts</div>
            <div className="text-[11px] text-slate-100 font-bold mt-1">Geographic Proximity</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Haversine formula &lt;3km</div>
          </div>
          <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/60 card-interactive shadow-xs hover:border-amber-400">
            <div className="font-display font-black text-base text-amber-800">25 Pts</div>
            <div className="text-[11px] text-slate-100 font-bold mt-1">Rescue Urgency</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Expiry deadline &lt;3 hrs</div>
          </div>
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/60 card-interactive shadow-xs hover:border-blue-400">
            <div className="font-display font-black text-base text-blue-800">20 Pts</div>
            <div className="text-[11px] text-slate-100 font-bold mt-1">Capacity Match</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Within daily intake</div>
          </div>
          <div className="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-200/60 card-interactive shadow-xs hover:border-cyan-400">
            <div className="font-display font-black text-base text-cyan-800">15 Pts</div>
            <div className="text-[11px] text-slate-100 font-bold mt-1">Storage Safe</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Cold chain verified</div>
          </div>
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/60 card-interactive shadow-xs hover:border-purple-400">
            <div className="font-display font-black text-base text-purple-800">10 Pts</div>
            <div className="text-[11px] text-slate-100 font-bold mt-1">Trust Score</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Verified donor partner</div>
          </div>
        </div>
      </div>

      {/* Match Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-white">
            Ranked Recommendations ({filteredMatches.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Sorted by algorithmic rescue score</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Computing optimal allocations...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-16 bg-[#111827] rounded-3xl border border-white/10 text-slate-500 text-xs">
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
                className="glass-panel rounded-3xl border border-slate-200/90 shadow-md card-interactive shimmer-sweep-hover transition-all duration-300 p-6 space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Match Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md font-mono-numbers ${
                      item.match_score >= 80
                        ? 'bg-gradient-to-r from-[#047857] via-[#10b981] to-[#06b6d4] text-white shadow-emerald-500/25 glow-aurora'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                    }`}>
                      {item.match_score}% Match Score
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 font-mono-numbers">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {item.distance_km} km away
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-700 transition">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Donor: <strong className="text-slate-300">{item.donor_name}</strong> • {item.pickup_address}
                    </p>
                  </div>

                  {/* Quantity & Urgency */}
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-white/6 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Available Amount:</span>
                      <span className="font-black text-emerald-700 font-mono-numbers text-sm">{item.available_quantity} {item.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Time to Expiry:</span>
                      <span className={`font-black font-mono-numbers px-2 py-0.5 rounded-md text-[11px] ${
                        item.remaining_hours <= 4 ? 'badge-coral-urgent animate-pulse' : 'badge-saffron'
                      }`}>
                        {item.remaining_hours} hours left
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Handling:</span>
                      <span className="font-semibold text-slate-100 text-[11px]">{item.storage_requirement}</span>
                    </div>
                  </div>

                  {/* Match Reason Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Why this donation is recommended:
                    </span>
                    {item.reasons?.map((reason, idx) => (
                      <div key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{reason}</span>
                      </div>
                    ))}
                    {item.warnings?.map((warn, idx) => (
                      <div key={`w-${idx}`} className="text-xs text-amber-800 flex items-start gap-1.5 font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{warn}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/6">
                  <button
                    onClick={() => handleOpenRequest(item)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#047857] via-[#10b981] to-[#06b6d4] hover:brightness-110 text-white rounded-xl text-xs font-black text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Claim Allocation Directly</span>
                  </button>
                  <Link
                    to="/browse"
                    className="w-full py-1.5 text-slate-500 hover:text-slate-100 text-[11px] font-semibold text-center transition block"
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
              className="bg-[#111827] rounded-3xl shadow-2xl max-w-md w-full border border-white/10 overflow-hidden"
            >
              <div className="p-5 border-b border-white/6 flex items-center justify-between bg-[#0f1923]">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    Smart Match Claim
                  </span>
                  <h3 className="font-extrabold text-base text-white mt-1">
                    Request {selectedMatch.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-400 hover:bg-slate-200/50 transition cursor-pointer"
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
                  <div className="flex justify-between text-slate-400">
                    <span>Algorithm Score:</span>
                    <span className="font-bold text-emerald-700">{selectedMatch.match_score}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Donor Kitchen:</span>
                    <span>{selectedMatch.donor_name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 bg-[#0f1923] border border-white/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <span className="text-[10px] text-slate-400">
                    Max: {selectedMatch.available_quantity} {selectedMatch.unit}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Beneficiary & Transport Notes
                  </label>
                  <textarea
                    rows={3}
                    value={beneficiaryNotes}
                    onChange={(e) => setBeneficiaryNotes(e.target.value)}
                    placeholder="E.g., Serving 80 homeless community members at evening community table."
                    className="w-full px-3 py-2 bg-[#0f1923] border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/6">
                  <button
                    type="button"
                    onClick={() => setSelectedMatch(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:bg-[#141c25] rounded-xl transition cursor-pointer"
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
