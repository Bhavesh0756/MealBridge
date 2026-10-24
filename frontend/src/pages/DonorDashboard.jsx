import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Utensils,
  Plus,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Edit3,
  CheckCheck,
  Copy,
  X
} from 'lucide-react';
import { donationsApi } from '../api/donations';
import { requestsApi } from '../api/requests';
import { matchingApi } from '../api/matching';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FoodSafetyModal } from '../components/FoodSafetyModal';

export function DonorDashboard() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
  const [myDonations, setMyDonations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Create Listing Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [matchedNgosModal, setMatchedNgosModal] = useState(null);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    special_instructions: '',
    contact_phone: '',
    pickup_address: '',
    storage_requirement: 'ROOM_TEMPERATURE',
  });

  // New Listing Form State
  const [newListing, setNewListing] = useState({
    title: '',
    category: '',
    quantity: '',
    unit: 'MEALS',
    description: '',
    preparation_hours_ago: '1',
    pickup_hours_from_now: '4',
    storage_requirement: 'ROOM_TEMPERATURE',
    dietary_type: 'VEGETARIAN',
    allergens: 'None declared',
    pickup_address: user?.donor_profile?.address || 'Bandra West, Mumbai',
    contact_phone: user?.phone_number || '+91 98000 11223',
    special_instructions: 'Pickup from main kitchen dispatch counter.',
  });

  // Food Safety Checklist
  const [safetyChecklist, setSafetyChecklist] = useState({
    safety_checklist_completed: false,
    hygiene_verified: false,
    properly_stored: false,
    tamper_free_sealed: false,
    safety_disclaimer_accepted: false,
  });

  const [formError, setFormError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [donationsRes, requestsRes, catsRes] = await Promise.all([
        donationsApi.getMyDonations().catch(() => []),
        requestsApi.getRequests().catch(() => []),
        donationsApi.getCategories().catch(() => []),
      ]);
      setMyDonations(donationsRes.results || donationsRes || []);
      setIncomingRequests(requestsRes.results || requestsRes || []);
      setCategories(catsRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleOpenSafetyCheck = (e) => {
    e.preventDefault();
    if (!newListing.title || !newListing.category || !newListing.quantity) {
      setFormError('Please fill in required fields (title, category, quantity).');
      return;
    }
    setFormError('');
    setSafetyModalOpen(true);
  };

  const handleFinalSubmitDonation = async () => {
    try {
      setSubmitting(true);
      setFormError('');

      const now = new Date();
      const prepTime = new Date(now.getTime() - parseFloat(newListing.preparation_hours_ago) * 3600000);
      const pickupDeadline = new Date(now.getTime() + parseFloat(newListing.pickup_hours_from_now) * 3600000);

      const payload = {
        title: newListing.title,
        category: parseInt(newListing.category) || categories[0]?.id,
        quantity: parseFloat(newListing.quantity),
        unit: newListing.unit,
        description: newListing.description,
        preparation_time: prepTime.toISOString(),
        pickup_deadline: pickupDeadline.toISOString(),
        storage_requirement: newListing.storage_requirement,
        dietary_type: newListing.dietary_type,
        allergens: newListing.allergens,
        pickup_address: newListing.pickup_address,
        contact_phone: newListing.contact_phone,
        special_instructions: newListing.special_instructions,
        ...safetyChecklist,
      };

      await donationsApi.createDonation(payload);
      setCreateModalOpen(false);
      toastSuccess('Surplus donation listing published with safety certification!');
      // Reset form
      setNewListing({
        title: '',
        category: '',
        quantity: '',
        unit: 'MEALS',
        description: '',
        preparation_hours_ago: '1',
        pickup_hours_from_now: '4',
        storage_requirement: 'ROOM_TEMPERATURE',
        dietary_type: 'VEGETARIAN',
        allergens: 'None declared',
        pickup_address: user?.donor_profile?.address || 'Bandra West, Mumbai',
        contact_phone: user?.phone_number || '+91 98000 11223',
        special_instructions: 'Pickup from main kitchen dispatch counter.',
      });
      loadDashboardData();
    } catch (err) {
      const errData = err.response?.data;
      const errMsg = errData?.error || 'Failed to publish donation listing.';
      setFormError(errMsg);
      toastError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await requestsApi.acceptRequest(requestId, 'Accepted by donor kitchen. Ready for collection.');
      toastSuccess('Request accepted! Dispatch pool alerted for volunteer pickup.');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to accept request.';
      toastError(msg);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Please provide reason for declining this request:', 'Batch unavailable at requested time');
    if (reason === null) return;
    try {
      await requestsApi.rejectRequest(requestId, reason);
      toastInfo('Request declined.');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reject request.';
      toastError(msg);
    }
  };

  const handleCancelDonation = async (donationId) => {
    if (!confirm('Are you sure you want to cancel this donation listing?')) return;
    try {
      await donationsApi.cancelDonation(donationId, 'Cancelled by donor kitchen.');
      toastSuccess('Donation listing cancelled.');
      loadDashboardData();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to cancel donation.';
      toastError(msg);
    }
  };

  const handleViewMatchedNgos = async (donation) => {
    try {
      const res = await matchingApi.getDonationNgoMatches(donation.id);
      setMatchedNgosModal({
        donationTitle: donation.title,
        matches: res.matches || [],
      });
    } catch (err) {
      console.error('Failed to calculate matches for listing:', err);
      toastError('Could not calculate matches for this listing.');
    }
  };

  const handleOpenEdit = (donation) => {
    setEditingDonation(donation);
    setEditFormData({
      title: donation.title,
      description: donation.description || '',
      special_instructions: donation.special_instructions || '',
      contact_phone: donation.contact_phone || user?.phone_number || '',
      pickup_address: donation.pickup_address || '',
      storage_requirement: donation.storage_requirement || 'ROOM_TEMPERATURE',
    });
  };

  const handleRelistDonation = (donation) => {
    setNewListing({
      title: `${donation.title} (Fresh Batch)`,
      category: donation.category?.id || donation.category || '',
      quantity: donation.quantity || '',
      unit: donation.unit || 'MEALS',
      description: donation.description || '',
      preparation_hours_ago: '1',
      pickup_hours_from_now: '4',
      storage_requirement: donation.storage_requirement || 'ROOM_TEMPERATURE',
      dietary_type: donation.dietary_type || 'VEGETARIAN',
      allergens: donation.allergens || 'None declared',
      pickup_address: donation.pickup_address || user?.donor_profile?.address || '',
      contact_phone: donation.contact_phone || user?.phone_number || '',
      special_instructions: donation.special_instructions || '',
    });
    setCreateModalOpen(true);
    toastInfo(`Created fresh draft from "${donation.title}". Review checklist and publish!`);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingDonation) return;
    try {
      await donationsApi.updateDonation(editingDonation.id, editFormData);
      toastSuccess('Listing details updated successfully!');
      setEditingDonation(null);
      loadDashboardData();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to update listing.');
    }
  };

  const handleCompleteDonation = async (donationId) => {
    if (!confirm('Mark this surplus food donation as fully completed & handed over?')) return;
    try {
      await donationsApi.completeDonation(donationId);
      toastSuccess('Donation marked as completed!');
      loadDashboardData();
    } catch (err) {
      toastError(err.response?.data?.error || 'Failed to complete donation.');
    }
  };

  const pendingRequests = incomingRequests.filter((r) => r.status === 'PENDING');
  const activeDonationsCount = myDonations.filter((d) =>
    ['AVAILABLE', 'PARTIALLY_RESERVED'].includes(d.status)
  ).length;

  if (loading && myDonations.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading food donor console & active listings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Food Donor Console
            </span>
            <span className="text-xs text-slate-500">{user?.donor_profile?.organization_name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Kitchen Surplus & Donation Dispatch
          </h1>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Surplus Listing</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Active Food Listings</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{activeDonationsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Available for NGOs to request</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Requests Awaiting Review</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{pendingRequests.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Requires your acceptance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Listings Created</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{myDonations.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Lifetime rescue batches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Hygiene Status</p>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-600 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>FSSAI Certified</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Checklist strictly verified</p>
        </div>
      </div>

      {/* Incoming Requests Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              Incoming NGO Allocation Requests ({pendingRequests.length} Pending)
            </h2>
            <p className="text-xs text-slate-500">
              Accepting a request atomically reserves portions and triggers volunteer courier dispatch.
            </p>
          </div>
        </div>

        <div className="p-5">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-40" />
              <p className="text-xs font-medium">No pending requests right now. All requests reviewed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{req.recipient_organization || 'Verified Shelter'}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Requested: <strong className="text-emerald-700">{req.requested_quantity} {req.donation?.unit}</strong> of <em>'{req.donation?.title}'</em>
                    </p>
                    {req.beneficiary_notes && (
                      <p className="text-xs text-slate-500 italic">
                        "{req.beneficiary_notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      Accept & Reserve Quantity
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Food Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-slate-900">
            My Published Food Listings
          </h2>
          <span className="text-xs text-slate-500">{myDonations.length} total</span>
        </div>

        {myDonations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Utensils className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700">No Food Listings Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by publishing your first surplus meal batch to make it discoverable to nearby community shelters.
            </p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              + Create First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDonations.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-700">
                      {d.category?.name || 'Cooked Food'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'PARTIALLY_RESERVED'
                          ? 'bg-blue-100 text-blue-800'
                          : d.status === 'COMPLETED'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-base text-slate-900">{d.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{d.description}</p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Available:</span>
                        <span className="font-bold text-emerald-700">
                          {d.available_quantity} / {d.quantity} {d.unit}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reserved:</span>
                        <span className="font-medium text-slate-800">{d.reserved_quantity} {d.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Storage:</span>
                        <span className="font-medium text-slate-800">{d.storage_requirement_display || d.storage_requirement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pickup Deadline:</span>
                        <span className="font-medium text-slate-800">
                          {new Date(d.pickup_deadline).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => handleViewMatchedNgos(d)}
                    className="w-full py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Matched NGOs</span>
                  </button>

                  {['AVAILABLE', 'PARTIALLY_RESERVED'].includes(d.status) && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleCompleteDonation(d.id)}
                        className="py-1.5 px-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3 h-3 text-teal-600" />
                        <span>Complete</span>
                      </button>
                    </div>
                  )}

                  {['AVAILABLE', 'PARTIALLY_RESERVED'].includes(d.status) && (
                    <button
                      onClick={() => handleCancelDonation(d.id)}
                      className="w-full py-1.5 px-3 border border-slate-200 hover:border-rose-300 text-slate-500 hover:text-rose-600 rounded-xl text-xs font-medium transition cursor-pointer"
                    >
                      Cancel Listing
                    </button>
                  )}

                  <button
                    onClick={() => handleRelistDonation(d)}
                    className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Clone this listing details into a fresh batch"
                  >
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Relist Fresh Batch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Listing Modal */}
      <AnimatePresence>
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Food Rescue Protocol
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg">Publish Surplus Food Donation</h3>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleOpenSafetyCheck} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Food Batch Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vegetarian Buffet Surplus - Rice, Paneer Butter Masala, Roti"
                    value={newListing.title}
                    onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    <select
                      value={newListing.category}
                      onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="e.g. 50"
                      value={newListing.quantity}
                      onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                    <select
                      value={newListing.unit}
                      onChange={(e) => setNewListing({ ...newListing, unit: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                    >
                      <option value="MEALS">Meals / Portions</option>
                      <option value="KG">Kilograms (kg)</option>
                      <option value="BOXES">Boxes / Trays</option>
                      <option value="PACKETS">Packets</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Storage Requirement *</label>
                    <select
                      value={newListing.storage_requirement}
                      onChange={(e) => setNewListing({ ...newListing, storage_requirement: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                    >
                      <option value="ROOM_TEMPERATURE">Room Temperature (Dry / Packaged)</option>
                      <option value="REFRIGERATED">Refrigerated (0°C to 4°C)</option>
                      <option value="HOT_HOLDING">Hot Holding (&gt;63°C)</option>
                      <option value="FROZEN">Frozen (-18°C)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Classification *</label>
                    <select
                      value={newListing.dietary_type}
                      onChange={(e) => setNewListing({ ...newListing, dietary_type: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
                    >
                      <option value="VEGETARIAN">Vegetarian</option>
                      <option value="VEGAN">Vegan</option>
                      <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                      <option value="CONTAINS_EGG">Contains Egg</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Prepared How Many Hours Ago?</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={newListing.preparation_hours_ago}
                      onChange={(e) => setNewListing({ ...newListing, preparation_hours_ago: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Deadline (Hours From Now) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={newListing.pickup_hours_from_now}
                      onChange={(e) => setNewListing({ ...newListing, pickup_hours_from_now: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Allergens Declared</label>
                  <input
                    type="text"
                    placeholder="e.g. Milk (Paneer), Wheat Gluten, Cashews"
                    value={newListing.allergens}
                    onChange={(e) => setNewListing({ ...newListing, allergens: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Kitchen Address</label>
                  <input
                    type="text"
                    required
                    value={newListing.pickup_address}
                    onChange={(e) => setNewListing({ ...newListing, pickup_address: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Description & Packing Details</label>
                  <textarea
                    rows="2"
                    placeholder="Packed in 3 sealed stainless steel gastro containers, kept in warming cabinet."
                    value={newListing.description}
                    onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Food safety declaration step follows</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Proceed to Safety Checklist →
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Food Safety Checklist Modal */}
      <FoodSafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        checklist={safetyChecklist}
        setChecklist={setSafetyChecklist}
        onConfirm={handleFinalSubmitDonation}
      />

      {/* Matched NGOs Modal */}
      <AnimatePresence>
        {matchedNgosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Smart Match Algorithm
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    Matched NGOs for '{matchedNgosModal.donationTitle}'
                  </h3>
                </div>
                <button
                  onClick={() => setMatchedNgosModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 max-h-96 overflow-y-auto space-y-3">
                {matchedNgosModal.matches.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No verified NGOs within immediate driving radius.
                  </p>
                ) : (
                  matchedNgosModal.matches.map((m) => (
                    <div
                      key={m.ngo_id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{m.organization_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {m.match_score}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {m.address} • <strong>{m.distance_km} km away</strong>
                      </p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {m.reasons?.map((r, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                <button
                  onClick={() => setMatchedNgosModal(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Donation Modal */}
      <AnimatePresence>
        {editingDonation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Update Details
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Edit Donation Listing</h3>
                </div>
                <button
                  onClick={() => setEditingDonation(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Food Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description / Dish Details</label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Storage Condition</label>
                    <select
                      value={editFormData.storage_requirement}
                      onChange={(e) => setEditFormData({ ...editFormData, storage_requirement: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="ROOM_TEMPERATURE">Room Temperature</option>
                      <option value="REFRIGERATED">Refrigerated (Cold Chain)</option>
                      <option value="FROZEN">Deep Freeze</option>
                      <option value="HEATED">Heated / Hot Holding</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={editFormData.contact_phone}
                      onChange={(e) => setEditFormData({ ...editFormData, contact_phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Special Handling / Dispatch Instructions</label>
                  <input
                    type="text"
                    value={editFormData.special_instructions}
                    onChange={(e) => setEditFormData({ ...editFormData, special_instructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingDonation(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                  >
                    Save Changes
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
