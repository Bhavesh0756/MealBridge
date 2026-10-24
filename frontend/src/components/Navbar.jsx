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
  X
} from 'lucide-react';

export function Navbar() {
  const { user, logout, switchDemoAccount, isDonor, isNgo, isVolunteer, isAdmin, isAuthenticated } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">MealBridge</span>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider">
                  Rescue
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Surplus Food Platform</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/browse"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                isActive('/browse') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              Food Feed
            </Link>
            <Link
              to="/matchmaker"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                isActive('/matchmaker') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Smart Match
            </Link>
            <Link
              to="/impact"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                isActive('/impact') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              Impact Analytics
            </Link>

            {/* Role-Specific Dashboard quicklink */}
            {isDonor && (
              <Link
                to="/dashboard/donor"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  isActive('/dashboard/donor') ? 'bg-emerald-100/80 text-emerald-900' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Donor Console
              </Link>
            )}
            {isNgo && (
              <Link
                to="/dashboard/ngo"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  isActive('/dashboard/ngo') ? 'bg-blue-100/80 text-blue-900' : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                NGO Console
              </Link>
            )}
            {isVolunteer && (
              <Link
                to="/dashboard/volunteer"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  isActive('/dashboard/volunteer') ? 'bg-amber-100/80 text-amber-900' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Rescue Log
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/dashboard/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  isActive('/dashboard/admin') ? 'bg-purple-100/80 text-purple-900' : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition cursor-pointer"
              title="Switch demo roles instantly"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="hidden sm:inline">Role:</span>
              <span className="font-bold">
                {user ? user.role : 'Demo Switcher'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Role
                </div>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => handleDemoSwitch(acc)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                      user?.email === acc.email
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{acc.label}</div>
                      <div className="text-[10px] text-slate-400">{acc.org}</div>
                    </div>
                    {user?.email === acc.email && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold">
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
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-extrabold rounded-full animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user.username}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">
                  {user.role} {user.is_verified && '• Verified ✓'}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
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
    </header>
  );
}
