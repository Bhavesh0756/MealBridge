import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Clock,
  ShieldCheck,
  Utensils,
  Map as MapIcon,
  Grid,
  CheckCircle2,
  X,
  AlertCircle,
  MapPin,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { donationsApi } from '../api/donations';
import { requestsApi } from '../api/requests';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LeafletMapView } from '../components/LeafletMapView';
import { useNavigate } from 'react-router-dom';

export function BrowseFeedPage() {
  const { isNgo, isAuthenticated } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'quantity' | 'newest'
  const [urgentOnly, setUrgentOnly] = useState(false);

  // User location for distance computation (default to central hub: Mumbai 19.0760, 72.8777)
  const userLat = 19.0760;
  const userLon = 72.8777;

  const calculateDistance = (lat, lon) => {
    if (!lat || !lon) return null;
    const R = 6371;
    const dLat = ((lat - userLat) * Math.PI) / 180;
    const dLon = ((lon - userLon) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userLat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Request Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQty, setRequestQty] = useState('');
  const [beneficiaryNotes, setBeneficiaryNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDietary) params.dietary_type = selectedDietary;
      if (selectedStorage) params.storage_requirement = selectedStorage;
      if (searchTerm) params.search = searchTerm;

      const data = await donationsApi.getListings(params);
      setDonations(data.results || data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      try {
        const cats = await donationsApi.getCategories();
        setCategories(cats || []);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedDietary, selectedStorage, searchTerm]);

  const displayedDonations = useMemo(() => {
    let list = [...donations];
    if (urgentOnly) {
      list = list.filter((d) => d.remaining_hours !== undefined && d.remaining_hours <= 4);
    }
    if (sortBy === 'urgency') {
      list.sort((a, b) => (a.remaining_hours ?? 999) - (b.remaining_hours ?? 999));
    } else if (sortBy === 'quantity') {
      list.sort((a, b) => (b.available_quantity || 0) - (a.available_quantity || 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
    return list;
  }, [donations, urgentOnly, sortBy]);

  const handleOpenRequest = (donation) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isNgo) {
      toastError('Only verified NGO / Recipient organizations can submit requests for surplus food. Please switch role via Demo Switcher.');
      return;
    }
    setSelectedDonation(donation);
    setRequestQty(donation.available_quantity);
    setBeneficiaryNotes('');
    setRequestError('');
    setRequestSuccess(false);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedDonation) return;

    const qty = parseFloat(requestQty);
    if (isNaN(qty) || qty <= 0) {
      setRequestError('Please specify a valid quantity greater than zero.');
      return;
    }
    if (qty > parseFloat(selectedDonation.available_quantity)) {
      setRequestError(`Quantity cannot exceed the available ${selectedDonation.available_quantity} ${selectedDonation.unit}.`);
      return;
    }

    try {
      setSubmitting(true);
      setRequestError('');
      await requestsApi.createRequest({
        donation: selectedDonation.id,
        requested_quantity: qty,
        beneficiary_notes: beneficiaryNotes,
      });
      setRequestSuccess(true);
      toastSuccess('Surplus food request reserved successfully! Donor alerted.');
      fetchListings();
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.requested_quantity?.[0] || errData?.error || 'Failed to submit request.';
      setRequestError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 cyber-dots">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-widest border border-emerald-300/60 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Hyperlocal Network
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Surplus Food Rescue Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Real-time rescue radar for edible surplus donations from commercial restaurants, banquets, and bakeries.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 self-start md:self-auto shadow-2xs backdrop-blur-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Card Feed</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span>Radar Map</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search dishes, venues, kitchens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all outline-none text-slate-700 cursor-pointer"
            >
              <option value="">All Food Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Filter */}
          <div>
            <select
              value={selectedDietary}
              onChange={(e) => setSelectedDietary(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all outline-none text-slate-700 cursor-pointer"
            >
              <option value="">All Dietary Types</option>
              <option value="VEGETARIAN">Vegetarian Only</option>
              <option value="VEGAN">Vegan Only</option>
              <option value="NON_VEGETARIAN">Non-Vegetarian</option>
              <option value="CONTAINS_EGG">Contains Egg</option>
            </select>
          </div>

          {/* Storage Filter */}
          <div>
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all outline-none text-slate-700 cursor-pointer"
            >
              <option value="">All Storage Types</option>
              <option value="ROOM_TEMPERATURE">Room Temperature</option>
              <option value="REFRIGERATED">Refrigerated (0°C to 4°C)</option>
              <option value="FROZEN">Frozen (-18°C)</option>
              <option value="HOT_HOLDING">Hot Holding (&gt;63°C)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips & Sort Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-1">
              Filter:
            </span>
            <button
              onClick={() => setUrgentOnly(!urgentOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                urgentOnly
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Expiring &lt;4h</span>
            </button>
            <button
              onClick={() => setSelectedDietary(selectedDietary === 'VEGETARIAN' ? '' : 'VEGETARIAN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedDietary === 'VEGETARIAN'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              🌱 Pure Veg
            </button>
            <button
              onClick={() => setSelectedStorage(selectedStorage === 'REFRIGERATED' ? '' : 'REFRIGERATED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedStorage === 'REFRIGERATED'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
            >
              ❄️ Cold Chain
            </button>
            {(selectedCategory || selectedDietary || selectedStorage || searchTerm || urgentOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedDietary('');
                  setSelectedStorage('');
                  setSearchTerm('');
                  setUrgentOnly(false);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-bold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="urgency">Urgency (Expiring First)</option>
              <option value="quantity">Largest Quantity</option>
              <option value="newest">Recently Posted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="h-[560px] w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl">
            <LeafletMapView
              donations={displayedDonations}
              zoom={12}
              className="h-full w-full"
              onSelectDonation={(d) => handleOpenRequest(d)}
            />
          </div>
          <p className="text-xs text-slate-500 text-center font-medium">
            Interactive GIS Radar • Click any pin to open instant food portion allocation request.
          </p>
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-20 text-slate-400 space-y-3">
              <div className="w-9 h-9 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Scanning real-time food rescue inventory...</p>
            </div>
          ) : displayedDonations.length === 0 ? (
            <div className="text-center py-20 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Utensils className="w-7 h-7" />
              </div>
              <h3 className="font-display font-black text-slate-800 text-lg">No Matching Donations Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                No active listings match the selected filters. Try clearing some criteria or search queries.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedDietary('');
                  setSelectedStorage('');
                  setSearchTerm('');
                  setUrgentOnly(false);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDonations.map((d) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-3xl border border-slate-200/90 shadow-md card-interactive shimmer-sweep-hover transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Tag Header */}
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50/30 border-b border-slate-100 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                        {d.category?.name || 'Cooked Meals'}
                      </span>
                      <div className="flex items-center gap-2">
                        {d.latitude && d.longitude && calculateDistance(d.latitude, d.longitude) && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs font-mono-numbers">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {calculateDistance(d.latitude, d.longitude)} km
                          </span>
                        )}
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                          d.remaining_hours !== undefined && d.remaining_hours <= 4
                            ? 'badge-coral-urgent animate-pulse'
                            : 'badge-saffron'
                        }`}>
                          <Clock className="w-3 h-3 animate-spin" />
                          {d.remaining_hours !== undefined ? `${d.remaining_hours}h left` : 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-lg text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                          {d.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{d.description}</p>
                      </div>

                      <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Available:</span>
                          <span className="font-black text-emerald-700 text-sm font-mono-numbers">
                            {d.available_quantity} / {d.quantity} {d.unit}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Storage:</span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {d.storage_requirement_display || d.storage_requirement}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Dietary:</span>
                          <span className="font-bold text-slate-800 text-[11px]">
                            {d.dietary_type_display || d.dietary_type}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Allergens:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[150px] text-[11px]">
                            {d.allergens || 'None declared'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60">
                          <span className="text-slate-500 font-medium">Location:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[150px] text-[11px]">
                            {d.pickup_address}
                          </span>
                        </div>
                      </div>

                      {/* Donor Attribution */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Donor: <strong className="text-slate-800">{d.donor_organization_name || 'Verified Donor'}</strong></span>
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Hygiene Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleOpenRequest(d)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#047857] via-[#10b981] to-[#06b6d4] hover:brightness-110 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/25 group-hover:scale-[1.01] cursor-pointer"
                    >
                      <span>Request Food Portion</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Food Request Modal */}
      <AnimatePresence>
        {selectedDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    NGO Food Allocation
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Request Food Donation</h3>
                </div>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {requestSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Request Submitted Successfully!</h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                      The donor has received your request. Upon acceptance, the requested quantity will be reserved and a volunteer pickup will be scheduled.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={() => setSelectedDonation(null)}
                      className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/ngo')}
                      className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                      View in My NGO Console
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="font-bold text-slate-800">{selectedDonation.title}</div>
                    <div className="text-slate-500">
                      Available Stock: <strong className="text-emerald-700">{selectedDonation.available_quantity} {selectedDonation.unit}</strong>
                    </div>
                    <div className="text-slate-500">
                      Pickup Address: <strong className="text-slate-700">{selectedDonation.pickup_address}</strong>
                    </div>
                  </div>

                  {requestError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{requestError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quantity to Request ({selectedDonation.unit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      max={selectedDonation.available_quantity}
                      value={requestQty}
                      onChange={(e) => setRequestQty(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      You can request partial amounts or the full batch.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Beneficiary & Distribution Notes (Optional)
                    </label>
                    <textarea
                      rows="3"
                      value={beneficiaryNotes}
                      onChange={(e) => setBeneficiaryNotes(e.target.value)}
                      placeholder="e.g. For dinner distribution at Kurla shelter home for 40 children..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedDonation(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Submitting Request...' : 'Confirm Food Request'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
