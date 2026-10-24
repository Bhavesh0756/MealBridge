import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Utensils,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  BarChart3,
  Menu,
  User,
  X
} from 'lucide-react';
import { ProfileModal } from './ProfileModal';

export function Navbar() {
  const { user, logout, switchDemoAccount, isDonor, isNgo, isVolunteer, isAdmin, isAuthenticated } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleDemoSwitch = async (acc) => {
    setDemoMenuOpen(false);
    await switchDemoAccount(acc.email, acc.password);
    if (acc.role === 'DONOR') navigate('/dashboard/donor');
    else if (acc.role === 'NGO') navigate('/dashboard/ngo');
    else if (acc.role === 'VOLUNTEER') navigate('/dashboard/volunteer');
    else if (acc.role === 'ADMIN') navigate('/dashboard/admin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-500/25 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              <Utensils className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-800 bg-clip-text text-transparent">
                  Meal<span className="text-emerald-600">Bridge</span>
                </span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-black rounded-full uppercase tracking-widest shadow-2xs">
                  Rescue Net
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                Hyperlocal Surplus Redistribution
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/60 p-1 rounded-2xl border border-slate-200/50">
            <Link
              to="/browse"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive('/browse')
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Live Feed
            </Link>
            <Link
              to="/matchmaker"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                isActive('/matchmaker')
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Smart Match
            </Link>
            <Link
              to="/impact"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                isActive('/impact')
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" />
              ESG Analytics
            </Link>

            {/* Role-Specific Dashboard quicklink */}
            {isDonor && (
              <Link
                to="/dashboard/donor"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive('/dashboard/donor')
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Donor Console
              </Link>
            )}
            {isNgo && (
              <Link
                to="/dashboard/ngo"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive('/dashboard/ngo')
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                NGO Console
              </Link>
            )}
            {isVolunteer && (
              <Link
                to="/dashboard/volunteer"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive('/dashboard/volunteer')
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                Courier Ops
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/dashboard/admin"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive('/dashboard/admin')
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                Admin Shield
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-900 border border-amber-300/60 shadow-2xs transition-all duration-200 cursor-pointer"
              title="Switch demo roles instantly"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="hidden sm:inline text-amber-700 font-medium">Role:</span>
              <span className="font-extrabold uppercase tracking-wide">
                {user ? user.role : 'Demo Switcher'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
                  Instant Role Simulation
                </div>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => handleDemoSwitch(acc)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      user?.email === acc.email
                        ? 'bg-emerald-50/80 text-emerald-900 font-bold border border-emerald-200/60'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        {acc.label}
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold">
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{acc.org}</div>
                    </div>
                    {user?.email === acc.email && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-600 text-white rounded-full font-black shadow-xs">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          {isAuthenticated && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
              title="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black rounded-full shadow-md shadow-rose-500/30 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileOpen(true)}
                className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-all text-right cursor-pointer group hover:ring-2 hover:ring-emerald-400/30"
                title="View & Edit Profile Settings"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">
                    {user.username}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                    {user.role} {user.is_verified && '✓'}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setProfileOpen(true)}
                className="lg:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Profile Settings"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Food Feed
          </Link>
          <Link
            to="/matchmaker"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Smart Matchmaker
          </Link>
          <Link
            to="/impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Impact Analytics
          </Link>
          {isDonor && (
            <Link
              to="/dashboard/donor"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50"
            >
              Donor Console
            </Link>
          )}
          {isNgo && (
            <Link
              to="/dashboard/ngo"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50"
            >
              NGO Console
            </Link>
          )}
          {isVolunteer && (
            <Link
              to="/dashboard/volunteer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50"
            >
              Volunteer Console
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/dashboard/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50"
            >
              Admin Panel
            </Link>
          )}
        </div>
      )}

      {/* Profile & Organization Settings Modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
