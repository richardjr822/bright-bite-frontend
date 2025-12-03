import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaShieldAlt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

import { API_BASE } from '../api';

const PrivacyAgreementModal = ({ isOpen, onAgree, onDecline, userName, userId, token }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // User has scrolled to within 50px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAgree = async () => {
    if (!isChecked || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const consent = {
        agreed: true,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem('privacyConsent', JSON.stringify(consent));

      if (userId && token) {
        await fetch(`${API_BASE}/users/${userId}/agree-terms`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ agreed_to_terms: true })
        });
      }

      onAgree();
    } catch (error) {
      console.error('Error updating terms agreement:', error);
      onAgree();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaShieldAlt className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to BrightBites!</h2>
              <p className="text-green-100 text-sm">Please review and accept our terms to continue</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-6 py-4 text-gray-700"
          onScroll={handleScroll}
        >
          <div className="space-y-4 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">1</span>
                Data Collection & Usage
              </h3>
              <p className="text-gray-600 pl-8">
                BrightBites collects personal information including your name, email address, and dietary preferences 
                to provide personalized meal planning and ordering services. We use this data to:
              </p>
              <ul className="list-disc pl-14 mt-2 text-gray-600 space-y-1">
                <li>Generate personalized meal recommendations</li>
                <li>Process your food orders from campus vendors</li>
                <li>Track your nutritional intake and goals</li>
                <li>Improve our services and user experience</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">2</span>
                Data Protection
              </h3>
              <p className="text-gray-600 pl-8">
                We implement industry-standard security measures to protect your personal information. 
                Your data is encrypted during transmission and storage. We do not sell or share your 
                personal information with third parties except as necessary to provide our services.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">3</span>
                Your Rights
              </h3>
              <p className="text-gray-600 pl-8">
                You have the right to access, correct, or delete your personal data at any time. 
                You can update your preferences in the Settings section or contact our support team 
                for assistance with data-related requests.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">4</span>
                Campus Vendor Information
              </h3>
              <p className="text-gray-600 pl-8">
                When you place orders, your relevant information (name, order details) is shared with 
                campus vendors to fulfill your orders. Vendors are bound by their own privacy policies 
                and our data sharing agreements.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">5</span>
                Terms of Service
              </h3>
              <p className="text-gray-600 pl-8">
                By using BrightBites, you agree to use the platform responsibly and in accordance with 
                campus guidelines. Misuse of the platform may result in account suspension. You are 
                responsible for maintaining the security of your account credentials.
              </p>
            </section>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <FaExclamationTriangle className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">Important Notice</p>
                  <p className="text-amber-700 text-xs mt-1">
                    By clicking "I Agree", you confirm that you have read and understood our Privacy Policy 
                    and Terms of Service, and consent to the collection and use of your data as described above.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Checkbox and Buttons */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {/* Checkbox */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isChecked 
                  ? 'bg-green-600 border-green-600' 
                  : 'bg-white border-gray-300 group-hover:border-green-400'
              }`}>
                {isChecked && <FaCheck className="text-white text-xs" />}
              </div>
            </div>
            <span className="text-sm text-gray-700">
              I have read and agree to the <span className="font-medium text-green-700">Privacy Policy</span> and{' '}
              <span className="font-medium text-green-700">Terms of Service</span>
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors border border-gray-300"
            >
              Decline
            </button>
            <button
              onClick={handleAgree}
              disabled={!isChecked || isSubmitting}
              className={`flex-1 px-4 py-3 font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                isChecked && !isSubmitting
                  ? 'bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FaCheck className={isChecked ? 'text-white' : 'text-gray-400'} />
                  I Agree & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export const hasAgreedToPrivacy = () => {
  try {
    const consent = localStorage.getItem('privacyConsent');
    if (consent) {
      const parsed = JSON.parse(consent);
      return parsed.agreed === true;
    }
  } catch (e) {
    console.error('Error checking privacy consent:', e);
  }
  return false;
};

export const checkUserAgreedToTerms = (user) => {
  return user?.agreed_to_terms === true;
};

export default PrivacyAgreementModal;
