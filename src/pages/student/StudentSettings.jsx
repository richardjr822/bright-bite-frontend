import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../api';
import { FaCog, FaUser, FaLock, FaSave, FaExclamationTriangle, FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

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
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

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
    // Strong policy: min 8, at least 1 uppercase and 1 number
    if (newPassword.length < 8) return false;
    if (!/[A-Z]/.test(newPassword)) return false;
    if (!/\d/.test(newPassword)) return false;
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
        try {
          await apiClient('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ current_password: security.currentPassword, new_password: security.newPassword })
          });
          setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
          alert('Password updated successfully');
        } catch (e) {
          alert(e?.message || 'Failed to update password');
        }
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
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Profile Information</h2>
        <p className="text-xs text-slate-500">Update your personal details</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={profile.fullName}
            disabled
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed text-sm text-slate-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed text-sm text-slate-600"
          />
          <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            Phone Number
            {!profile.phone && <span className="text-rose-500 text-xs">*Required for ordering</span>}
          </label>
          
          {!profile.phone && (
            <div className="mb-3 bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <FaExclamationTriangle className="text-amber-600 mt-0.5 flex-shrink-0 text-sm" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 mb-0.5">Phone Number Required</p>
                  <p className="text-xs text-amber-700">
                    You must add a phone number to place food orders.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {profile.phone && !phoneEditMode && (
            <div className="mb-3 bg-slate-50 border border-slate-200 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-slate-500 mt-0.5 flex-shrink-0 text-sm" />
                <p className="text-xs text-slate-600">
                  Your phone number is used for order coordination with vendors.
                </p>
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
              className={`flex-1 px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0d3d23]/20 focus:border-[#0d3d23] text-sm ${!phoneEditMode ? 'bg-slate-50 cursor-not-allowed text-slate-600' : !profile.phone ? 'border-rose-300' : 'border-slate-200'}`}
            />
            {phoneEditMode ? (
              <button
                onClick={savePhone}
                disabled={saving || !profile.phone}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium ${saving || !profile.phone ? 'bg-[#1a5d3a] text-white cursor-not-allowed' : 'bg-[#0d3d23] text-white hover:bg-[#1a5d3a]'}`}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            ) : (
              <button
                onClick={() => setPhoneEditMode(true)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#0d3d23] text-white hover:bg-[#1a5d3a]"
              >
                Edit
              </button>
            )}
          </div>
          {profile.phone && phoneEditMode && !PH_PHONE_REGEX.test(profile.phone) && (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <FaExclamationTriangle className="w-3 h-3" />
              Please ensure PH mobile format (e.g., +639XXXXXXXXX or 09XXXXXXXXX).
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
          <input
            type="text"
            value={profile.organization}
            disabled
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed text-sm text-slate-600"
          />
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Full name and organization are managed by administrators.
      </p>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Security Settings</h2>
        <p className="text-xs text-slate-500">Update your password</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={showPw.current ? 'text' : 'password'}
              value={security.currentPassword}
              onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d3d23]/20 focus:border-[#0d3d23] text-sm"
            />
            <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700">
              {showPw.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showPw.next ? 'text' : 'password'}
              value={security.newPassword}
              onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d3d23]/20 focus:border-[#0d3d23] text-sm"
            />
            <button type="button" onClick={() => setShowPw(s => ({ ...s, next: !s.next }))} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700">
              {showPw.next ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPw.confirm ? 'text' : 'password'}
              value={security.confirmPassword}
              onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 pr-10 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d3d23]/20 focus:border-[#0d3d23] text-sm"
            />
            <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700">
              {showPw.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleSave('Password')}
        disabled={saving || !canSubmitPassword}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors font-medium text-sm ${saving || !canSubmitPassword ? 'bg-[#1a5d3a] text-white cursor-not-allowed' : 'bg-[#0d3d23] text-white hover:bg-[#1a5d3a]'}`}
      >
        <FaSave className="text-sm" /> {saving ? 'Saving...' : 'Update Password'}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl flex items-center justify-center shadow-sm">
              <FaCog className="text-lg text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
              <p className="text-slate-500 text-sm">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1">
              {[
                { id: 'profile', icon: FaUser, label: 'Profile' },
                { id: 'security', icon: FaLock, label: 'Security' }
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                    activeSection === id
                      ? 'bg-[#0d3d23] text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="text-sm" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              {activeSection === 'profile' && renderProfile()}
              {activeSection === 'security' && renderSecurity()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
