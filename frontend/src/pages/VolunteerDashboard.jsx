import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Phone,
  UserCheck,
  PackageCheck,
  Shield,
  X
} from 'lucide-react';
import { pickupsApi } from '../api/pickups';
import { useAuth } from '../context/AuthContext';

export function VolunteerDashboard() {
  const { user } = useAuth();
  const [availablePool, setAvailablePool] = useState([]);
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Update Modal
  const [activePickupForUpdate, setActivePickupForUpdate] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [recipientSignature, setRecipientSignature] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pool, mine] = await Promise.all([
        pickupsApi.getAvailablePool().catch(() => []),
        pickupsApi.getMyPickups().catch(() => []),
      ]);
      setAvailablePool(pool || []);
      setMyPickups(mine || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaim = async (pickupId) => {
    try {
      await pickupsApi.claimPickup(pickupId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim pickup.');
    }
  };

  const handleOpenStatusModal = (pickup, nextStatus) => {
    setActivePickupForUpdate(pickup);
    setTargetStatus(nextStatus);
    setNotes('');
    setRecipientSignature('');
    setFailureReason('');
  };

  const handleSubmitStatusTransition = async (e) => {
    e.preventDefault();
    if (!activePickupForUpdate || !targetStatus) return;

    try {
      setSubmitting(true);
      await pickupsApi.updateStatus(
        activePickupForUpdate.id,
        targetStatus,
        notes,
        failureReason,
        recipientSignature
      );
      setActivePickupForUpdate(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update pickup status.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeDeliveries = myPickups.filter((p) =>
    ['CLAIMED', 'EN_ROUTE_PICKUP', 'FOOD_COLLECTED', 'EN_ROUTE_DELIVERY'].includes(p.status)
  );
  const completedDeliveries = myPickups.filter((p) => p.status === 'DELIVERED');

  const getNextStatus = (current) => {
    switch (current) {
      case 'CLAIMED':
        return { next: 'EN_ROUTE_PICKUP', label: 'Start Driving to Donor' };
      case 'EN_ROUTE_PICKUP':
        return { next: 'FOOD_COLLECTED', label: 'Confirm Food Collected' };
      case 'FOOD_COLLECTED':
        return { next: 'EN_ROUTE_DELIVERY', label: 'Start Delivery to NGO' };
      case 'EN_ROUTE_DELIVERY':
        return { next: 'DELIVERED', label: 'Confirm Safe Delivery' };
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Pickup Volunteer Console
            </span>
            <span className="text-xs text-slate-500">{user?.volunteer_profile?.full_name || user?.email}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Food Rescue Couriers & Transport
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <span>Vehicle: <strong>{user?.volunteer_profile?.vehicle_type || 'Motorcycle'}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Max Payload: <strong>{user?.volunteer_profile?.max_transport_capacity_kg || 30} kg</strong></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Available in Rescue Pool</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{availablePool.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Ready for pickup claim</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Active Deliveries in Transit</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{activeDeliveries.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Currently on route</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Successful Deliveries</p>
          <p className="text-2xl sm:text-3xl font-black text-teal-700 mt-1">{completedDeliveries.length}</p>
          <p className="text-[10px] text-slate-400 mt-1">Completed safely</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Volunteer Status</p>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Ready for Missions</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">GPS dispatch active</p>
        </div>
      </div>

      {/* Section: My Active Deliveries Tracker */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              My Active Deliveries ({activeDeliveries.length})
            </h2>
            <p className="text-xs text-slate-500">
              Live step-by-step progress tracking from donor kitchen to recipient distribution center.
            </p>
          </div>
        </div>

        <div className="p-5">
          {activeDeliveries.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <Truck className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
              <p className="text-xs font-medium">No active delivery in transit. Claim a task from the pool below!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((p) => {
                const stepInfo = getNextStatus(p.status);
                const req = p.request_details || p.request;
                const donation = req?.donation;

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">
                            Rescue #{p.id}: {donation?.title || 'Food Item'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 uppercase">
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Payload: <strong>{req?.requested_quantity} {donation?.unit}</strong> ({donation?.storage_requirement_display || donation?.storage_requirement})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {stepInfo && (
                          <button
                            onClick={() => handleOpenStatusModal(p, stepInfo.next)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            {stepInfo.label} →
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenStatusModal(p, 'FAILED')}
                          className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Report Issue
                        </button>
                      </div>
                    </div>

                    {/* Step Timeline Indicator */}
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                      <div className={`p-2 rounded-xl ${['CLAIMED', 'EN_ROUTE_PICKUP', 'FOOD_COLLECTED', 'EN_ROUTE_DELIVERY', 'DELIVERED'].includes(p.status) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                        1. Claimed
                      </div>
                      <div className={`p-2 rounded-xl ${['EN_ROUTE_PICKUP', 'FOOD_COLLECTED', 'EN_ROUTE_DELIVERY', 'DELIVERED'].includes(p.status) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                        2. En Route
                      </div>
                      <div className={`p-2 rounded-xl ${['FOOD_COLLECTED', 'EN_ROUTE_DELIVERY', 'DELIVERED'].includes(p.status) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                        3. Food Collected
                      </div>
                      <div className={`p-2 rounded-xl ${['EN_ROUTE_DELIVERY', 'DELIVERED'].includes(p.status) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                        4. To Delivery
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 font-medium">Pickup From:</span>
                        <p className="font-bold text-slate-800">{donation?.pickup_address}</p>
                        <p className="text-[11px] text-slate-500">Donor: {donation?.donor_organization_name}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Deliver To:</span>
                        <p className="font-bold text-slate-800">{req?.recipient_organization || 'NGO Shelter'}</p>
                        <p className="text-[11px] text-slate-500">Contact: Verified NGO Dispatch</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section: Available Pickup Pool */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-lg text-slate-900">
              Available Pickup Assignments ({availablePool.length})
            </h2>
            <p className="text-xs text-slate-500">
              Food donations accepted by donors awaiting a volunteer courier.
            </p>
          </div>
        </div>

        {availablePool.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            No unclaimed pickups in the dispatch pool right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePool.map((task) => {
              const req = task.request_details || task.request;
              const donation = req?.donation;

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        Ready for Courier
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Payload: {req?.requested_quantity} {donation?.unit}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900">{donation?.title || 'Surplus Food'}</h3>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400">From:</span>{' '}
                        <strong className="text-slate-800">{donation?.pickup_address}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">To NGO:</span>{' '}
                        <strong className="text-slate-800">{req?.recipient_organization}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Handling:</span>{' '}
                        <span className="text-slate-700">{donation?.storage_requirement_display || donation?.storage_requirement}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaim(task.id)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Claim Pickup Assignment</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Transition Modal */}
      <AnimatePresence>
        {activePickupForUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm">
                  {targetStatus === 'FAILED' ? 'Report Failed Pickup' : `Update Status: ${targetStatus}`}
                </h3>
                <button
                  onClick={() => setActivePickupForUpdate(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitStatusTransition} className="p-5 space-y-4">
                {targetStatus === 'DELIVERED' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Signature / Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sister Maria / Director David Dsouza"
                      value={recipientSignature}
                      onChange={(e) => setRecipientSignature(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white"
                    />
                  </div>
                )}

                {targetStatus === 'FAILED' ? (
                  <div>
                    <label className="block text-xs font-bold text-rose-700 mb-1">
                      Failure Reason (Required) *
                    </label>
                    <textarea
                      rows="3"
                      required
                      placeholder="e.g. Vehicle breakdown / Donor kitchen closed upon arrival"
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-rose-50/50 border border-rose-200 rounded-xl outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Reporting failure automatically releases reserved quantities back to public inventory.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Handover Notes (Optional)
                    </label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Insulated thermal bags checked; containers sealed properly."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePickupForUpdate(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition cursor-pointer ${
                      targetStatus === 'FAILED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {submitting ? 'Updating...' : 'Confirm Update'}
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
