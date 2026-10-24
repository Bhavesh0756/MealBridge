import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { matchingApi } from '../api/matching';
import { Link } from 'react-router-dom';

export function SmartMatchmakerPage() {
  const [radius, setRadius] = useState(25);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

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
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">{radius} km radius</span>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-36 accent-emerald-600 cursor-pointer"
            />
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
            Ranked Recommendations ({matches.length})
          </h2>
          <span className="text-xs text-slate-500">Sorted by algorithmic rescue score</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Computing optimal allocations...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            No active food listings within {radius} km radius. Try extending the radius slider above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((item) => (
              <motion.div
                key={item.donation_id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Match Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs">
                      {item.match_score}% Score
                    </span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {item.distance_km} km away
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Donor: <strong>{item.donor_name}</strong> • {item.pickup_address}
                    </p>
                  </div>

                  {/* Quantity & Urgency */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Available Amount:</span>
                      <span className="font-bold text-emerald-700">{item.available_quantity} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time to Expiry:</span>
                      <span className="font-bold text-amber-700">{item.remaining_hours} hours remaining</span>
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

                <Link
                  to="/browse"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center transition block shadow-xs"
                >
                  Request Allocation in Feed →
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
