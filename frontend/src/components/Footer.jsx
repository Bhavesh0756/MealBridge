import React from 'react';
import { Utensils, Heart, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-900">
                <Utensils className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg">MealBridge</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Surplus Food Rescue Platform connecting commercial kitchens with verified community organizations to prevent food waste and combat hunger.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>FSSAI & Food Hygiene Compliant</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Workflows</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse" className="hover:text-emerald-400 transition">
                  Browse Active Feed
                </Link>
              </li>
              <li>
                <Link to="/matchmaker" className="hover:text-emerald-400 transition">
                  Smart Matchmaker Engine
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-emerald-400 transition">
                  Carbon & Food Metrics
                </Link>
              </li>
              <li>
                <Link to="/#calculator" className="hover:text-emerald-400 transition flex items-center gap-1">
                  <span>ESG Impact Estimator</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition">
                  Register as Donor / NGO / Volunteer
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Roles & Consoles</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard/donor" className="hover:text-emerald-400 transition">
                  Food Donor Console
                </Link>
              </li>
              <li>
                <Link to="/dashboard/ngo" className="hover:text-emerald-400 transition">
                  NGO Recipient Hub
                </Link>
              </li>
              <li>
                <Link to="/dashboard/volunteer" className="hover:text-emerald-400 transition">
                  Volunteer Transport Tracker
                </Link>
              </li>
              <li>
                <Link to="/dashboard/admin" className="hover:text-emerald-400 transition">
                  Moderator & Audit Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Standards & Impact</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Impact calculations use UN FAO benchmarks (1 meal ≈ 0.42 kg) and EPA WARM indices (2.5 kg CO₂e saved per kg food diverted).
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Certified Sustainable Architecture</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} MealBridge Platform. Open food rescue initiative.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for community resilience
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
