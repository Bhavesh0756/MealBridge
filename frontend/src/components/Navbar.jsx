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
    <header className="sticky top-0 z-40 transition-all relative"
      style={{
        background: 'rgba(11, 15, 23, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(16, 185, 129, 0.12)',
        boxShadow: '0 1px 30px rgba(0,0,0,0.4)',
      }}>

      {/* Aurora Laser Underline */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.8) 40%, rgba(6,182,212,0.6) 60%, transparent 100%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-2xl text-white flex items-center justify-center font-bold transition-all duration-300 group-hover:scale-105 group-hover:rotate-1"
              style={{ background: 'linear-gradient(135deg, #047857, #10b981, #06b6d4)', boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
              <Utensils className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"
                  style={{ border: '2px solid #0b0f17' }}></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl tracking-tight text-white">
                  Meal<span className="text-aurora-animated">Bridge</span>
                </span>
                <span className="px-2.5 py-0.5 text-emerald-300 text-[10px] font-black rounded-full uppercase tracking-widest"
                  style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  Zero Waste
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide" style={{ color: 'rgba(100,116,139,0.85)' }}>
                Hyperlocal Surplus Redistribution
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Link
              to="/browse"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive('/browse')
                  ? 'text-emerald-300'
                  : 'hover:text-white'
              }`}
              style={isActive('/browse')
                ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }
                : { color: 'rgba(148,163,184,0.9)' }
              }
            >
              Live Feed
            </Link>
            <Link
              to="/matchmaker"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200`}
              style={isActive('/matchmaker')
                ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }
                : { color: 'rgba(148,163,184,0.9)' }
              }
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Smart Match
            </Link>
            <Link
              to="/impact"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200`}
              style={isActive('/impact')
                ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }
                : { color: 'rgba(148,163,184,0.9)' }
              }
            >
              <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
              ESG Analytics
            </Link>

            {isDonor && (
              <Link to="/dashboard/donor"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={isActive('/dashboard/donor')
                  ? { background: 'linear-gradient(135deg, #047857, #10b981)', color: '#fff', boxShadow: '0 0 15px rgba(16,185,129,0.4)' }
                  : { color: '#34d399' }
                }
              >
                Donor Console
              </Link>
            )}
            {isNgo && (
              <Link to="/dashboard/ngo"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={isActive('/dashboard/ngo')
                  ? { background: 'linear-gradient(135deg, #0284c7, #06b6d4)', color: '#fff', boxShadow: '0 0 15px rgba(6,182,212,0.4)' }
                  : { color: '#38bdf8' }
                }
              >
                NGO Console
              </Link>
            )}
            {isVolunteer && (
              <Link to="/dashboard/volunteer"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={isActive('/dashboard/volunteer')
                  ? { background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#fff', boxShadow: '0 0 15px rgba(245,158,11,0.4)' }
                  : { color: '#fbbf24' }
                }
              >
                Courier Ops
              </Link>
            )}
            {isAdmin && (
              <Link to="/dashboard/admin"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                style={isActive('/dashboard/admin')
                  ? { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', boxShadow: '0 0 15px rgba(124,58,237,0.4)' }
                  : { color: '#a78bfa' }
                }
              >
                Admin Shield
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                color: '#fbbf24',
              }}
              title="Switch demo roles instantly"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="hidden sm:inline font-medium" style={{ color: 'rgba(251,191,36,0.7)' }}>Role:</span>
              <span className="font-extrabold uppercase tracking-wide">{user ? user.role : 'Demo'}</span>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: 'rgba(251,191,36,0.8)' }} />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl p-2.5 z-50"
                style={{
                  background: 'rgba(11,15,23,0.97)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
                }}>
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest mb-1"
                  style={{ color: 'rgba(100,116,139,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  Instant Role Simulation
                </div>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => handleDemoSwitch(acc)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer`}
                    style={user?.email === acc.email
                      ? { background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.3)' }
                      : { color: 'rgba(148,163,184,0.9)' }
                    }
                    onMouseEnter={e => { if (user?.email !== acc.email) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (user?.email !== acc.email) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        {acc.label}
                        <span className="text-[10px] px-1.5 rounded font-semibold"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(148,163,184,0.7)' }}>
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'rgba(100,116,139,0.7)' }}>{acc.org}</div>
                    </div>
                    {user?.email === acc.email && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                        style={{ background: 'rgba(16,185,129,0.8)', color: '#fff' }}>
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
              className="relative p-2.5 rounded-xl transition-all cursor-pointer"
              style={{ color: 'rgba(148,163,184,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e2e8f0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; }}
              title="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 text-white text-[10px] font-black rounded-full animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', boxShadow: '0 0 10px rgba(244,63,94,0.5)', paddingTop: '1px', paddingBottom: '1px' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfileOpen(true)}
                className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all text-right cursor-pointer group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'; e.currentTarget.style.background = 'rgba(16,185,129,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                title="View & Edit Profile"
              >
                <div className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs group-hover:scale-105 transition"
                  style={{ background: 'linear-gradient(135deg, #047857, #10b981)' }}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black text-white leading-tight">{user.username}</p>
                  <span className="text-[10px] font-bold flex items-center gap-1 justify-end" style={{ color: '#34d399' }}>
                    {user.role} {user.is_verified && '✓'}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setProfileOpen(true)}
                className="lg:hidden p-2.5 rounded-xl transition cursor-pointer"
                style={{ color: 'rgba(148,163,184,0.8)' }}
                title="Profile Settings"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl transition cursor-pointer"
                style={{ color: 'rgba(148,163,184,0.6)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.6)'; e.currentTarget.style.background = 'transparent'; }}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-xs font-bold rounded-xl transition"
                style={{ color: 'rgba(148,163,184,0.9)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.9)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Sign In
              </Link>
              <Link to="/register"
                className="px-4 py-2 text-xs font-bold text-white rounded-xl transition-all hover:scale-105 shimmer-sweep-hover"
                style={{ background: 'linear-gradient(135deg, #047857, #10b981, #06b6d4)', boxShadow: '0 0 20px rgba(16,185,129,0.35)' }}
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl cursor-pointer transition"
            style={{ color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(11,15,23,0.97)' }}>
          {[
            { to: '/browse', label: 'Food Feed' },
            { to: '/matchmaker', label: 'Smart Matchmaker' },
            { to: '/impact', label: 'Impact Analytics' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold transition"
              style={{ color: 'rgba(148,163,184,0.9)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {link.label}
            </Link>
          ))}
          {isDonor && <Link to="/dashboard/donor" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold" style={{ color: '#34d399', background: 'rgba(16,185,129,0.08)' }}>Donor Console</Link>}
          {isNgo && <Link to="/dashboard/ngo" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold" style={{ color: '#38bdf8', background: 'rgba(6,182,212,0.08)' }}>NGO Console</Link>}
          {isVolunteer && <Link to="/dashboard/volunteer" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.08)' }}>Volunteer Console</Link>}
          {isAdmin && <Link to="/dashboard/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold" style={{ color: '#a78bfa', background: 'rgba(124,58,237,0.08)' }}>Admin Panel</Link>}
        </div>
      )}

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
