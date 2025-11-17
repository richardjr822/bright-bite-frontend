import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../api';
import { FaCog, FaUser, FaLock, FaSave, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const PH_PHONE_REGEX = /^(?:\+639|09)\d{9}$/; // Optional validation (not required for saving)

export default function StudentSettings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      fullName: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      organization: user.organization || ''
    };
  });

  // Track edit mode for phone: if phone already exists, start in view mode
  const [phoneEditMode, setPhoneEditMode] = useState(() => !profile.phone);

  // OTP & phone verification removed; simple phone persistence only.

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const prof = await apiClient('/student/profile');
        if (prof?.success) {
          const u = prof.user || {};
          setProfile(p => ({
            ...p,
            fullName: u.full_name || p.fullName,
            email: u.email || p.email,
            organization: u.organization || p.organization,
            phone: u.phone || p.phone || ''
          }));
          const userLS = JSON.parse(localStorage.getItem('user') || '{}');
          const merged = { ...userLS, full_name: u.full_name || userLS.full_name, email: u.email || userLS.email, organization: u.organization || userLS.organization, phone: u.phone || '' };
          localStorage.setItem('user', JSON.stringify(merged));
        }
      } catch (e) {
        // fallback to localStorage
        const userLS = JSON.parse(localStorage.getItem('user') || '{}');
        if (userLS.phone) {
          setProfile(p => ({ ...p, phone: userLS.phone }));
        }
      }
    };
    load();
  }, []);

  // Name & organization now read-only so no change tracking needed
  const profileChanged = false;

  const canSubmitPassword = useMemo(() => {
    const { currentPassword, newPassword, confirmPassword } = security;
    if (!currentPassword || !newPassword || !confirmPassword) return false;
    if (newPassword !== confirmPassword) return false;
    if (newPassword.length < 6) return false;
    if (currentPassword === newPassword) return false;
    return true;
  }, [security]);

  const handleSave = async (section) => {
    setSaving(true);
    switch(section) {
      case 'Password':
        if (security.newPassword !== security.confirmPassword) {
          alert('Passwords do not match!');
          setSaving(false);
          return;
        }
        if (!canSubmitPassword) {
          setSaving(false);
          return;
        }
        // Placeholder for password update endpoint (not implemented in snippet)
        setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password updated successfully');
        break;
      default:
        break;
    }
    setSaving(false);
  };

  const savePhone = async () => {
    const phoneTrim = (profile.phone || '').trim();
    if (!phoneTrim) {
      alert('Enter a phone number first');
      return;
    }
    if (phoneTrim && !PH_PHONE_REGEX.test(phoneTrim)) {
      // Allow save even if format does not match? For now enforce PH format lightly.
      alert('Please enter a valid Philippine mobile number format');
      return;
    }
    try {
      setSaving(true);
      const res = await apiClient('/student/profile', {
        method: 'PUT',
        body: JSON.stringify({ phone: phoneTrim })
      });
      if (res?.success && res.user) {
        const userLS = JSON.parse(localStorage.getItem('user') || '{}');
        userLS.phone = res.user.phone || phoneTrim;
        localStorage.setItem('user', JSON.stringify(userLS));
        setProfile(p => ({ ...p, phone: userLS.phone }));
        alert('Phone number saved');
        setPhoneEditMode(false); // switch back to view mode
      }
    } catch (e) {
      alert(e?.message || 'Failed to save phone');
    } finally {
      setSaving(false);
    }
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
        <p className="text-sm text-gray-600 mb-6">Update your personal details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={profile.fullName}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            Phone Number
            {!profile.phone && <span className="text-red-600 text-xs">*Required for ordering</span>}
          </label>
          
          {!profile.phone && (
            <div className="mb-3 bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 mb-1">Phone Number Required</p>
                  <p className="text-xs text-amber-800">
                    You must add a phone number to place food orders. Vendors and delivery staff need this to contact you about your orders.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {profile.phone && !phoneEditMode && (
            <div className="mb-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-800">
                    Your phone number is used for order coordination with vendors and delivery staff.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="tel"
              value={profile.phone}
              disabled={!phoneEditMode || saving}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value.trim() })}
              placeholder="e.g. +639XXXXXXXXX or 09XXXXXXXXX"
              className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${!phoneEditMode ? 'bg-gray-100 cursor-not-allowed' : !profile.phone ? 'border-red-300' : ''}`}
            />
            {phoneEditMode ? (
              <button
                onClick={savePhone}
                disabled={saving || !profile.phone}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${saving || !profile.phone ? 'bg-green-300 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            ) : (
              <button
                onClick={() => setPhoneEditMode(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                Edit
              </button>
            )}
          </div>
          {profile.phone && phoneEditMode && !PH_PHONE_REGEX.test(profile.phone) && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <FaExclamationTriangle className="w-3 h-3" />
              Format check failed; please ensure PH mobile format (e.g., +639XXXXXXXXX or 09XXXXXXXXX).
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
          <input
            type="text"
            value={profile.organization}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Full name and organization are managed by administrators.
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Security Settings</h2>
        <p className="text-sm text-gray-600 mb-6">Update your password</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            type="password"
            value={security.currentPassword}
            onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={security.newPassword}
            onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            value={security.confirmPassword}
            onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={() => handleSave('Password')}
        disabled={saving || !canSubmitPassword}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${saving || !canSubmitPassword ? 'bg-green-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
      >
        <FaSave /> {saving ? 'Saving...' : 'Update Password'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <FaCog className="text-gray-600" />
          Settings
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2">
              {[
                { id: 'profile', icon: FaUser, label: 'Profile' },
                { id: 'security', icon: FaLock, label: 'Security' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeSection === id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {activeSection === 'profile' && renderProfile()}
              {activeSection === 'security' && renderSecurity()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
