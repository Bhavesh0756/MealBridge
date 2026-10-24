import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, AlertCircle, Check, X } from 'lucide-react';

export function FoodSafetyModal({ isOpen, onClose, checklist, setChecklist, onConfirm }) {
  if (!isOpen) return null;

  const allChecked =
    checklist.safety_checklist_completed &&
    checklist.hygiene_verified &&
    checklist.properly_stored &&
    checklist.tamper_free_sealed &&
    checklist.safety_disclaimer_accepted;

  const toggle = (field) => {
    setChecklist((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const selectAll = () => {
    setChecklist((prev) => ({
      ...prev,
      safety_checklist_completed: true,
      hygiene_verified: true,
      properly_stored: true,
      tamper_free_sealed: true,
      safety_disclaimer_accepted: true,
    }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-5 text-white flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Food Safety & Hygiene Protocol</h3>
                <p className="text-emerald-100 text-xs">FSSAI / Good Samaritan Compliance Checklist</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start justify-between gap-2.5 text-xs text-amber-900 leading-relaxed">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Compliance Declaration:</strong> Only food prepared under sanitary conditions in commercial or licensed kitchens may be listed.
                </p>
              </div>
              <button
                type="button"
                onClick={selectAll}
                className="shrink-0 px-2.5 py-1 bg-amber-200/70 hover:bg-amber-300 text-amber-900 font-bold rounded-lg transition text-[11px] cursor-pointer"
              >
                Select All
              </button>
            </div>

            {/* Temperature Standards Reference Mini-Card */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="p-1.5 bg-rose-50 rounded-lg border border-rose-100 text-rose-800">
                <span className="font-bold block">Hot Holding</span>
                <span>&gt; 63°C</span>
              </div>
              <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-800">
                <span className="font-bold block">Chilled Storage</span>
                <span>0°C to 4°C</span>
              </div>
              <div className="p-1.5 bg-cyan-50 rounded-lg border border-cyan-100 text-cyan-800">
                <span className="font-bold block">Deep Frozen</span>
                <span>&le; -18°C</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.hygiene_verified}
                  onChange={() => toggle('hygiene_verified')}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700">
                  <strong>Hygiene & Preparation Standards:</strong> Food was prepared under verified sanitary conditions by staff wearing appropriate hairnets, gloves, and protective gear.
                </span>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.properly_stored}
                  onChange={() => toggle('properly_stored')}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700">
                  <strong>Temperature Control:</strong> Food has been stored at safe temperatures (chilled food below 4°C, hot food kept above 63°C, or dry groceries in cool storage).
                </span>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.tamper_free_sealed}
                  onChange={() => toggle('tamper_free_sealed')}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700">
                  <strong>Secure Packaging:</strong> Food is packed in food-grade, leak-proof, tamper-evident containers or sealed stainless catering trays ready for transit.
                </span>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.safety_checklist_completed}
                  onChange={() => toggle('safety_checklist_completed')}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700">
                  <strong>Accurate Timing & Allergens:</strong> The stated preparation time and pickup deadline are strictly accurate, and declared allergens are complete.
                </span>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/50 border border-emerald-100 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={checklist.safety_disclaimer_accepted}
                  onChange={() => toggle('safety_disclaimer_accepted')}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-800 font-medium">
                  I solemnly declare that the food listed is wholesome, unadulterated, and safe for human consumption at the time of listing.
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!allChecked}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer ${
                allChecked
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Verify & Continue Publishing</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
