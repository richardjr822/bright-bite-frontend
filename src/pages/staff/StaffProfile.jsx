import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaLock, FaSave } from 'react-icons/fa';
import { API_BASE } from '../../api';

const StaffProfile = () => {
  const { staffData } = useOutletContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');
  const [formData, setFormData] = useState({
    full_name: staffData?.full_name || '',
    phone: staffData?.phone || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      if (!user.id || !token) return;

      const fd = new FormData();
      fd.append('full_name', formData.full_name || '');
      fd.append('phone', formData.phone || '');

      const res = await fetch(`${API_BASE}/staff/profile/${user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: fd,
      });
      if (res.ok) {
        // Optionally we could refresh profile data here
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {staffData?.full_name?.charAt(0) || 'D'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{staffData?.full_name || 'Delivery Staff'}</h2>
              <p className="text-sm text-gray-600">Staff ID: {staffData?.staff_id || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-teal-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Staff ID
                </label>
                <div className="relative">
                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={staffData?.staff_id || 'N/A'}
                    disabled
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : ''}
                    disabled
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaLock className="text-teal-600" />
              Security
            </h3>
            {!showPasswordForm && (
              <button
                onClick={() => { setShowPasswordForm(true); setPwMessage(''); setPwError(''); }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Change Password
              </button>
            )}
            {showPasswordForm && (
              <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 space-y-4 max-w-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaLock className="text-teal-600" />
                  <p className="text-sm font-medium text-gray-700">Update Password</p>
                </div>
                {pwError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg">{pwError}</div>}
                {pwMessage && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded-lg">{pwMessage}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={pwSaving}
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setPwError('');
                      setPwMessage('');
                    }}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={pwSaving}
                    onClick={async () => {
                      setPwError('');
                      setPwMessage('');
                      if (!currentPassword || !newPassword || !confirmPassword) {
                        setPwError('Please fill in all fields');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setPwError('New passwords do not match');
                        return;
                      }
                      if (newPassword.length < 6) {
                        setPwError('Password must be at least 6 characters');
                        return;
                      }
                      try {
                        setPwSaving(true);
                        const token = localStorage.getItem('token');
                        const res = await fetch(`${API_BASE}/auth/change-password`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          throw new Error(data.detail || data.message || 'Failed to update password');
                        }
                        setPwMessage('Password updated successfully');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      } catch (err) {
                        setPwError(err.message);
                      } finally {
                        setPwSaving(false);
                      }
                    }}
                    className={`px-6 py-2 rounded-lg font-medium text-white transition-colors ${pwSaving ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'}`}
                  >
                    {pwSaving ? 'Saving…' : 'Update Password'}
                  </button>
                </div>
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                  Use a strong password (min 6 characters). If forgotten, use the Forgot Password link on login.
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: staffData?.full_name || '',
                      phone: staffData?.phone || '',
                    });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <FaSave />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
