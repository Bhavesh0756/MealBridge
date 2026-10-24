import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import { Utensils, Lock, Mail, AlertCircle, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

/* Floating particle canvas for the login background */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
      hue: Math.random() > 0.6 ? 175 : 160,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 55%, ${p.opacity})`;
        ctx.fill();
      });
      // Draw connecting lines
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(16,185,129,${0.08 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const ROLE_META = {
  DONOR:     { icon: '🍽️', label: 'Food Donor',  color: '#10b981' },
  NGO:       { icon: '🤝', label: 'NGO',          color: '#06b6d4' },
  VOLUNTEER: { icon: '🚴', label: 'Volunteer',    color: '#f59e0b' },
  ADMIN:     { icon: '🛡️', label: 'Admin',         color: '#a855f7' },
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0b0f17 0%, #0f1923 45%, #071712 100%)' }}>
      
      {/* Animated particle network */}
      <ParticleCanvas />

      {/* Aurora orbs */}
      <div className="absolute top-[-10%] left-[-8%] w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)', filter: 'blur(40px)', animation: 'float-slow 8s ease-in-out infinite' }} />
      <div className="absolute bottom-[-12%] right-[-10%] w-[380px] h-[380px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(50px)', animation: 'float-slow 10s ease-in-out 2s infinite reverse' }} />

      <div className="relative z-10 w-full max-w-md space-y-5">
        
        {/* Header Brand */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto"
              style={{ background: 'linear-gradient(135deg, #047857, #10b981, #06b6d4)', boxShadow: '0 0 35px rgba(16,185,129,0.5), 0 0 70px rgba(16,185,129,0.2)' }}>
              <Utensils className="w-7 h-7" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 animate-ping opacity-75" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-aurora-animated">MealBridge</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.8)' }}>Smart Surplus Food Rescue Platform</p>
          </div>
        </div>

        {/* Demo Accounts panel */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">Instant Demo Access</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
              Click to autofill
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const meta = ROLE_META[acc.role] || {};
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="p-2.5 text-left rounded-xl transition-all duration-200 cursor-pointer card-interactive group"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${meta.color}55`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{meta.icon}</span>
                    <div>
                      <div className="font-bold text-[11px]" style={{ color: meta.color }}>{acc.label}</div>
                      <div className="text-[10px] truncate" style={{ color: 'rgba(148,163,184,0.7)' }}>{acc.org}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl p-6 sm:p-8 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
          }}>
          
          {/* Section label */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Secure Sign In</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#fca5a5' }}>
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(148,163,184,0.9)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: focusedField === 'email' ? '#10b981' : 'rgba(100,116,139,0.7)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@organization.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: focusedField === 'email' ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f5f9',
                    boxShadow: focusedField === 'email' ? '0 0 18px rgba(16,185,129,0.18)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(148,163,184,0.9)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: focusedField === 'password' ? '#10b981' : 'rgba(100,116,139,0.7)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: focusedField === 'password' ? '1px solid rgba(16,185,129,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f5f9',
                    boxShadow: focusedField === 'password' ? '0 0 18px rgba(16,185,129,0.18)' : 'none',
                  }}
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 shimmer-sweep-hover disabled:opacity-50"
              style={{
                background: loading
                  ? 'rgba(16,185,129,0.5)'
                  : 'linear-gradient(135deg, #047857, #10b981, #06b6d4)',
                color: '#ffffff',
                boxShadow: loading ? 'none' : '0 0 28px rgba(16,185,129,0.45), 0 4px 12px rgba(0,0,0,0.3)',
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs" style={{ color: 'rgba(100,116,139,0.9)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="pt-2 block">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold transition-colors duration-200"
                style={{ color: '#10b981' }}
                onMouseEnter={e => e.currentTarget.style.color = '#06b6d4'}
                onMouseLeave={e => e.currentTarget.style.color = '#10b981'}>
                Register now →
              </Link>
            </span>
          </div>
        </div>

        {/* Footer badge */}
        <div className="text-center">
          <span className="text-[10px] px-3 py-1 rounded-full"
            style={{ color: 'rgba(100,116,139,0.6)', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            🔒 256-bit encrypted · Zero trust auth
          </span>
        </div>
      </div>
    </div>
  );
}
