import React, { useState } from 'react';
import { FaShieldAlt, FaCheck, FaLock, FaUserShield, FaDatabase } from 'react-icons/fa';
import { API_BASE } from '../../api';

const PrivacyAgreementModal = ({ onAccept, onClose }) => {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/insights/accept-privacy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      
      if (res.ok) {
        onAccept?.();
      }
    } catch (err) {
      console.error('Failed to accept privacy terms:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaShieldAlt className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Privacy & Data Agreement</h2>
              <p className="text-emerald-100 text-sm">Please review before continuing</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
          <p className="text-slate-600 text-sm mb-5">
            Welcome to BrightBites! Before you start, please review how we handle your data to provide you with personalized meal recommendations.
          </p>

          <div className="space-y-4">
            {/* Data Collection */}
            <div className="flex gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaDatabase className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Data We Collect</h3>
                <p className="text-slate-600 text-xs mt-1">
                  Your meal preferences, dietary restrictions, health conditions, and ordering history to personalize your experience.
                </p>
              </div>
            </div>

            {/* How We Use It */}
            <div className="flex gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUserShield className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">How We Use Your Data</h3>
                <p className="text-slate-600 text-xs mt-1">
                  To generate personalized meal plans, recommend meals that match your goals, and help vendors understand student preferences (in aggregate, anonymized form).
                </p>
              </div>
            </div>

            {/* Security */}
            <div className="flex gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaLock className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Data Security</h3>
                <p className="text-slate-600 text-xs mt-1">
                  Your personal data is encrypted and stored securely. We never sell your individual data to third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Key Points */}
          <div className="mt-5 p-4 bg-slate-50 rounded-xl">
            <h4 className="font-semibold text-slate-900 text-sm mb-2">By accepting, you agree to:</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Share your dietary preferences for personalized recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Allow anonymous, aggregate data to help improve campus food offerings</span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheck className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Receive AI-generated meal plans based on your profile</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">
              I have read and agree to the privacy terms and data usage policy
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                accepted && !loading
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FaCheck />
                  Accept & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyAgreementModal;
