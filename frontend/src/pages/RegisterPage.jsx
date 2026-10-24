import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Utensils, HeartHandshake, Truck, AlertCircle, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('DONOR');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    phone_number: '',
    // Donor fields
    organization_name: '',
    donor_type: 'RESTAURANT',
    license_number: '',
    address: 'Bandra West',
    city: 'Mumbai',
    // NGO fields
    registration_number: '',
    daily_capacity_meals: 200,
    cold_storage_available: false,
    // Volunteer fields
    full_name: '',
    vehicle_type: 'MOTORCYCLE',
    max_transport_capacity_kg: 30,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email: formData.email,
      username: formData.username || formData.email.split('@')[0],
      password: formData.password,
      role: role,
      phone_number: formData.phone_number,
    };

    if (role === 'DONOR') {
      payload.donor_profile = {
        organization_name: formData.organization_name || `${formData.username} Kitchen`,
        donor_type: formData.donor_type,
        license_number: formData.license_number,
        address: formData.address,
        city: formData.city,
      };
    } else if (role === 'NGO') {
      payload.ngo_profile = {
        organization_name: formData.organization_name || `${formData.username} Welfare`,
        registration_number: formData.registration_number,
        address: formData.address,
        city: formData.city,
        daily_capacity_meals: parseInt(formData.daily_capacity_meals) || 200,
        cold_storage_available: formData.cold_storage_available,
      };
    } else if (role === 'VOLUNTEER') {
      payload.volunteer_profile = {
        full_name: formData.full_name || formData.username,
        vehicle_type: formData.vehicle_type,
        max_transport_capacity_kg: parseInt(formData.max_transport_capacity_kg) || 30,
      };
    }

    try {
      await register(payload);
      if (role === 'DONOR') navigate('/dashboard/donor');
      else if (role === 'NGO') navigate('/dashboard/ngo');
      else if (role === 'VOLUNTEER') navigate('/dashboard/volunteer');
      else navigate('/');
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData?.email?.[0] || errData?.password?.[0] || errData?.detail || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Join MealBridge
        </h1>
        <p className="text-xs text-slate-500">
          Select your role in the food rescue network to begin.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setRole('DONOR')}
          className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
            role === 'DONOR'
              ? 'bg-emerald-50 border-emerald-500 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Utensils className={`w-6 h-6 mx-auto mb-1 ${role === 'DONOR' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <div className="font-bold text-xs text-slate-900">Food Donor</div>
          <div className="text-[10px] text-slate-500">Restaurant / Caterer</div>
        </button>

        <button
          type="button"
          onClick={() => setRole('NGO')}
          className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
            role === 'NGO'
              ? 'bg-blue-50 border-blue-500 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <HeartHandshake className={`w-6 h-6 mx-auto mb-1 ${role === 'NGO' ? 'text-blue-600' : 'text-slate-400'}`} />
          <div className="font-bold text-xs text-slate-900">NGO / Recipient</div>
          <div className="text-[10px] text-slate-500">Shelter / Food Bank</div>
        </button>

        <button
          type="button"
          onClick={() => setRole('VOLUNTEER')}
          className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
            role === 'VOLUNTEER'
              ? 'bg-amber-50 border-amber-500 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className={`w-6 h-6 mx-auto mb-1 ${role === 'VOLUNTEER' ? 'text-amber-600' : 'text-slate-400'}`} />
          <div className="font-bold text-xs text-slate-900">Volunteer</div>
          <div className="text-[10px] text-slate-500">Transport & Delivery</div>
        </button>
      </div>

      {/* Form Container */}
      <div className="stripe-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6 bg-white">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@organization.org"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="unique_username"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                required
                minLength="8"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91 98000 11223"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 transition outline-none"
              />
            </div>
          </div>

          {/* Role specific profile fields */}
          {role === 'DONOR' && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
              <h3 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">
                Donor Organization Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    placeholder="e.g. Grand Royal Banquet"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Donor Category</label>
                  <select
                    name="donor_type"
                    value={formData.donor_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="CATERER">Caterer / Banquet</option>
                    <option value="CANTEEN">Corporate / College Canteen</option>
                    <option value="SUPERMARKET">Supermarket / Bakery</option>
                    <option value="INDIVIDUAL">Community Donor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">FSSAI / Food License No.</label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="e.g. FSSAI-11223344"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Kitchen Location</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Bandra West, Mumbai"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'NGO' && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <h3 className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                NGO Organization Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NGO / Shelter Name *</label>
                  <input
                    type="text"
                    required
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleChange}
                    placeholder="e.g. HopeShare Community Bank"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
                  <input
                    type="text"
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    placeholder="REG-NGO-MH-2022"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Intake Capacity (Meals)</label>
                  <input
                    type="number"
                    name="daily_capacity_meals"
                    value={formData.daily_capacity_meals}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="cold_storage_available"
                    name="cold_storage_available"
                    checked={formData.cold_storage_available}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="cold_storage_available" className="text-xs text-slate-700 cursor-pointer">
                    Certified Cold Storage Facility Available
                  </label>
                </div>
              </div>
            </div>
          )}

          {role === 'VOLUNTEER' && (
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-3">
              <h3 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                Volunteer Profile Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="MOTORCYCLE">Motorcycle / Scooter</option>
                    <option value="CAR">Car / Hatchback</option>
                    <option value="VAN_TEMPO">Van / Cargo Tempo</option>
                    <option value="FOOT_OR_BICYCLE">Bicycle / Foot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Transport Payload (kg)</label>
                  <input
                    type="number"
                    name="max_transport_capacity_kg"
                    value={formData.max_transport_capacity_kg}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
