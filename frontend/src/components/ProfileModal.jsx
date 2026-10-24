import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Building, ShieldCheck, Phone, MapPin, Truck, HeartHandshake, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/auth';

export function ProfileModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [profileData, setProfileData] = useState(() => {
    if (user?.role === 'DONOR') {
      return {
        organization_name: user?.donor_profile?.organization_name || '',
        donor_type: user?.donor_profile?.donor_type || 'RESTAURANT',
        license_number: user?.donor_profile?.license_number || '',
        address: user?.donor_profile?.address || '',
        city: user?.donor_profile?.city || 'Mumbai',
      };
    } else if (user?.role === 'NGO') {
      return {
        organization_name: user?.ngo_profile?.organization_name || '',
        registration_number: user?.ngo_profile?.registration_number || '',
        daily_capacity_meals: user?.ngo_profile?.daily_capacity_meals || 200,
        cold_storage_available: user?.ngo_profile?.cold_storage_available || false,
        address: user?.ngo_profile?.address || '',
        city: user?.ngo_profile?.city || 'Mumbai',
      };
    } else if (user?.role === 'VOLUNTEER') {
      return {
        full_name: user?.volunteer_profile?.full_name || '',
        vehicle_type: user?.volunteer_profile?.vehicle_type || 'MOTORCYCLE',
        max_transport_capacity_kg: user?.volunteer_profile?.max_transport_capacity_kg || 25,
      };
    }
    return {};
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleProfileFieldChange = (field, val) => {
    setProfileData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await authApi.updateProfile({
        phone_number: phoneNumber,
        profile: profileData,
      });
      await refreshUser();
      toastSuccess('Profile and organization details updated successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.error || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Account Profile & Settings</h3>
                <p className="text-xs text-slate-500">
                  Manage your organization credentials, contact details, and rescue capabilities.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
            {/* Account Status Badge */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 font-medium">Logged in as</span>
                <p className="font-bold text-slate-800 text-sm">{user.email}</p>
                <span className="text-[10px] text-slate-400">Username: @{user.username}</span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900">
                  {user.role}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.is_verified ? 'Verified Partner' : 'Verification Pending'}</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Phone */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Contact Phone Number</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98000 12345"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>

            {/* Role Specific Configuration */}
            {user.role === 'DONOR' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Food Donor Kitchen Profile</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Organization / Brand Name</label>
                    <input
                      type="text"
                      value={profileData.organization_name}
                      onChange={(e) => handleProfileFieldChange('organization_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Establishment Type</label>
                    <select
                      value={profileData.donor_type}
                      onChange={(e) => handleProfileFieldChange('donor_type', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    >
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="CATERER">Banquet Caterer</option>
                      <option value="CORPORATE_CANTEEN">Corporate Canteen</option>
                      <option value="SUPERMARKET">Supermarket / Grocery</option>
                      <option value="HOTEL">Hotel</option>
                      <option value="INDIVIDUAL">Community Individual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">FSSAI / Food License</label>
                    <input
                      type="text"
                      value={profileData.license_number}
                      onChange={(e) => handleProfileFieldChange('license_number', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleProfileFieldChange('city', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kitchen / Dispatch Pickup Address</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            {user.role === 'NGO' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-blue-600" />
                  <span>NGO / Shelter Profile</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Organization / Shelter Name</label>
                    <input
                      type="text"
                      value={profileData.organization_name}
                      onChange={(e) => handleProfileFieldChange('organization_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Registration / 80G Number</label>
                    <input
                      type="text"
                      value={profileData.registration_number}
                      onChange={(e) => handleProfileFieldChange('registration_number', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Daily Meal Intake Capacity</label>
                    <input
                      type="number"
                      value={profileData.daily_capacity_meals}
                      onChange={(e) => handleProfileFieldChange('daily_capacity_meals', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={profileData.cold_storage_available}
                        onChange={(e) => handleProfileFieldChange('cold_storage_available', e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span className="font-semibold text-slate-700">Equipped with Cold Storage ❄️</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shelter Delivery Address</span>
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            {user.role === 'VOLUNTEER' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Courier & Transport Capabilities</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Volunteer Full Name</label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => handleProfileFieldChange('full_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Vehicle Mode</label>
                    <select
                      value={profileData.vehicle_type}
                      onChange={(e) => handleProfileFieldChange('vehicle_type', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                    >
                      <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                      <option value="BICYCLE">Bicycle</option>
                      <option value="CAR">Car / Hatchback</option>
                      <option value="VAN">Van / Utility Vehicle</option>
                      <option value="ON_FOOT">On Foot (Walk)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Max Transport Payload (kg)</label>
                  <input
                    type="number"
                    value={profileData.max_transport_capacity_kg}
                    onChange={(e) => handleProfileFieldChange('max_transport_capacity_kg', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Details'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
