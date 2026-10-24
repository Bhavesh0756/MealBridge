import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Utensils, HeartHandshake, Truck, AlertCircle, ArrowRight,
  Building2, Hash, MapPin, Thermometer, Weight, User, ChevronRight
} from 'lucide-react';

const ROLES = [
  {
    id: 'DONOR',
    label: 'Food Donor',
    sub: 'Restaurant · Caterer · Canteen',
    icon: '🍽️',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    id: 'NGO',
    label: 'NGO / Recipient',
    sub: 'Shelter · Food Bank',
    icon: '🤝',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.25)',
  },
  {
    id: 'VOLUNTEER',
    label: 'Volunteer',
    sub: 'Transport & Delivery',
    icon: '🚴',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
];

function InputField({ label, name, type = 'text', placeholder, value, onChange, required, min }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-bold mb-1.5" style={{ color: 'rgba(148,163,184,0.85)' }}>
        {label}{required && <span style={{ color: '#f43f5e' }}> *</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        min={min}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-2.5 text-xs rounded-xl outline-none transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: focused ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.09)',
          color: '#f1f5f9',
          boxShadow: focused ? '0 0 18px rgba(16,185,129,0.15)' : 'none',
        }}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-bold mb-1.5" style={{ color: 'rgba(148,163,184,0.85)' }}>
        {label}{required && <span style={{ color: '#f43f5e' }}> *</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-2.5 text-xs rounded-xl outline-none transition-all duration-200 cursor-pointer"
        style={{
          background: focused ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.05)',
          border: focused ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.09)',
          color: '#f1f5f9',
          boxShadow: focused ? '0 0 18px rgba(16,185,129,0.15)' : 'none',
        }}
      >
        {options.map(o => <option key={o.value} value={o.value} style={{ background: '#0b0f17' }}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('DONOR');
  const [formData, setFormData] = useState({
    email: '', username: '', password: '', phone_number: '',
    organization_name: '', donor_type: 'RESTAURANT', license_number: '',
    address: 'Bandra West', city: 'Mumbai',
    registration_number: '', daily_capacity_meals: 200, cold_storage_available: false,
    full_name: '', vehicle_type: 'MOTORCYCLE', max_transport_capacity_kg: 30,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email: formData.email,
      username: formData.username || formData.email.split('@')[0],
      password: formData.password,
      role,
      phone_number: formData.phone_number,
    };

    if (role === 'DONOR') {
      payload.donor_profile = {
        organization_name: formData.organization_name || `${formData.username} Kitchen`,
        donor_type: formData.donor_type, license_number: formData.license_number,
        address: formData.address, city: formData.city,
      };
    } else if (role === 'NGO') {
      payload.ngo_profile = {
        organization_name: formData.organization_name || `${formData.username} Welfare`,
        registration_number: formData.registration_number,
        address: formData.address, city: formData.city,
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

  const activeRole = ROLES.find(r => r.id === role);

  return (
    <div className="min-h-screen px-4 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0b0f17 0%, #0f1923 50%, #071712 100%)' }}>

      {/* Aurora orbs */}
      <div className="absolute top-[-8%] right-[-6%] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'float-slow 9s ease-in-out infinite' }} />
      <div className="absolute bottom-[-12%] left-[-10%] w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(55px)', animation: 'float-slow 12s ease-in-out 3s infinite reverse' }} />
      {/* Cyber grid */}
      <div className="absolute inset-0 cyber-dots-dark opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold mb-2"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
            <span>⚡</span> Join the Food Rescue Network
          </div>
          <h1 className="text-3xl font-black tracking-tight text-aurora-animated">Create Your Account</h1>
          <p className="text-xs" style={{ color: 'rgba(100,116,139,0.85)' }}>
            Select your role and start making an impact today.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {ROLES.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className="p-4 rounded-2xl text-center cursor-pointer transition-all duration-300 card-interactive"
              style={{
                background: role === r.id ? r.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${role === r.id ? r.border : 'rgba(255,255,255,0.07)'}`,
                boxShadow: role === r.id ? `0 0 25px ${r.color}25` : 'none',
              }}
            >
              <div className="text-2xl mb-1.5">{r.icon}</div>
              <div className="text-xs font-black" style={{ color: role === r.id ? r.color : 'rgba(148,163,184,0.85)' }}>
                {r.label}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>{r.sub}</div>
              {role === r.id && (
                <div className="mt-2 flex justify-center">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color, boxShadow: `0 0 6px ${r.color}` }} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Main Form */}
        <div className="rounded-3xl p-6 sm:p-8 space-y-6"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>

          {error && (
            <div className="p-3 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fca5a5' }}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Core credentials */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(100,116,139,0.7)' }}>
                ── Core Credentials
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Email Address" name="email" type="email" required placeholder="name@org.com" value={formData.email} onChange={handleChange} />
                <InputField label="Username" name="username" required placeholder="unique_handle" value={formData.username} onChange={handleChange} />
                <InputField label="Password" name="password" type="password" required placeholder="Min 8 characters" value={formData.password} onChange={handleChange} />
                <InputField label="Phone Number" name="phone_number" placeholder="+91 98000 00000" value={formData.phone_number} onChange={handleChange} />
              </div>
            </div>

            {/* DONOR fields */}
            {role === 'DONOR' && (
              <div className="rounded-2xl p-4 space-y-4"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase" style={{ color: '#10b981' }}>
                  <Utensils className="w-3.5 h-3.5" /> Donor Organization Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Organization Name" name="organization_name" required placeholder="e.g. Grand Royal Banquet" value={formData.organization_name} onChange={handleChange} />
                  <SelectField label="Donor Category" name="donor_type" value={formData.donor_type} onChange={handleChange}
                    options={[
                      { value: 'RESTAURANT', label: 'Restaurant' },
                      { value: 'CATERER', label: 'Caterer / Banquet' },
                      { value: 'CANTEEN', label: 'Corporate / College Canteen' },
                      { value: 'SUPERMARKET', label: 'Supermarket / Bakery' },
                      { value: 'INDIVIDUAL', label: 'Community Donor' },
                    ]}
                  />
                  <InputField label="FSSAI / Food License No." name="license_number" placeholder="FSSAI-11223344" value={formData.license_number} onChange={handleChange} />
                  <InputField label="Kitchen Address" name="address" placeholder="Bandra West, Mumbai" value={formData.address} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* NGO fields */}
            {role === 'NGO' && (
              <div className="rounded-2xl p-4 space-y-4"
                style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)' }}>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase" style={{ color: '#06b6d4' }}>
                  <HeartHandshake className="w-3.5 h-3.5" /> NGO Organization Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="NGO / Shelter Name" name="organization_name" required placeholder="e.g. HopeShare Community Bank" value={formData.organization_name} onChange={handleChange} />
                  <InputField label="Registration Number" name="registration_number" placeholder="REG-NGO-MH-2022" value={formData.registration_number} onChange={handleChange} />
                  <InputField label="Daily Intake Capacity (meals)" name="daily_capacity_meals" type="number" value={formData.daily_capacity_meals} onChange={handleChange} />
                  <InputField label="Address" name="address" placeholder="Dharavi, Mumbai" value={formData.address} onChange={handleChange} />
                  <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                    style={{ background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.15)' }}>
                    <input
                      type="checkbox"
                      id="cold_storage"
                      name="cold_storage_available"
                      checked={formData.cold_storage_available}
                      onChange={handleChange}
                      className="w-4 h-4 cursor-pointer accent-cyan-500"
                    />
                    <label htmlFor="cold_storage" className="text-xs cursor-pointer" style={{ color: 'rgba(148,163,184,0.9)' }}>
                      <Thermometer className="w-3.5 h-3.5 inline-block mr-1 text-cyan-400" />
                      Certified Cold Storage Facility Available
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* VOLUNTEER fields */}
            {role === 'VOLUNTEER' && (
              <div className="rounded-2xl p-4 space-y-4"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase" style={{ color: '#f59e0b' }}>
                  <Truck className="w-3.5 h-3.5" /> Volunteer Profile Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Full Legal Name" name="full_name" required placeholder="e.g. Alex Rivera" value={formData.full_name} onChange={handleChange} />
                  <SelectField label="Vehicle Type" name="vehicle_type" value={formData.vehicle_type} onChange={handleChange}
                    options={[
                      { value: 'MOTORCYCLE', label: 'Motorcycle / Scooter' },
                      { value: 'CAR', label: 'Car / Hatchback' },
                      { value: 'VAN_TEMPO', label: 'Van / Cargo Tempo' },
                      { value: 'FOOT_OR_BICYCLE', label: 'Bicycle / Foot' },
                    ]}
                  />
                  <InputField label="Max Transport Payload (kg)" name="max_transport_capacity_kg" type="number" value={formData.max_transport_capacity_kg} onChange={handleChange} />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shimmer-sweep-hover disabled:opacity-50"
              style={{
                background: loading
                  ? 'rgba(16,185,129,0.5)'
                  : `linear-gradient(135deg, ${activeRole?.color === '#10b981' ? '#047857, #10b981, #06b6d4' : activeRole?.color === '#06b6d4' ? '#0369a1, #06b6d4, #10b981' : '#b45309, #f59e0b, #fbbf24'})`,
                color: '#fff',
                boxShadow: loading ? 'none' : `0 0 28px ${activeRole?.color}55, 0 4px 12px rgba(0,0,0,0.3)`,
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>{activeRole?.icon}</span>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-3 text-xs" style={{ color: 'rgba(100,116,139,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="block pt-2">
              Already registered?{' '}
              <Link to="/login" className="font-bold" style={{ color: '#10b981' }}>
                Sign In here →
              </Link>
            </span>
          </div>
        </div>

        {/* Security footer */}
        <div className="text-center mt-5">
          <span className="text-[10px] px-3 py-1 rounded-full"
            style={{ color: 'rgba(100,116,139,0.55)', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            🔒 Your data is encrypted end-to-end · GDPR compliant
          </span>
        </div>
      </div>
    </div>
  );
}
