import React, { useState, useEffect, useRef } from 'react';
import { 
  FaStore,
  FaUser,
  FaBell,
  FaLock,
  FaSave,
  FaCamera,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaPalette,
  FaMoon,
  FaSun,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

import { API_BASE } from '../../api';

export default function Settings() {
  const [activeSection, setActiveSection] = useState('business');
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  
  // Load business info from localStorage or use defaults
  const [businessInfo, setBusinessInfo] = useState(() => {
    const saved = localStorage.getItem('vendorBusinessInfo');
    return saved ? JSON.parse(saved) : {
      name: 'Gourmet Delights',
      description: 'Serving delicious meals made with the finest ingredients since 2010',
      address: '123 Foodie Street, Cuisine City',
      phone: '(555) 123-4567',
      email: 'contact@gourmetdelights.com',
      logoUrl: null
    };
  });

  // Load operating hours from localStorage or use defaults
  const [operatingHours, setOperatingHours] = useState(() => {
    const saved = localStorage.getItem('vendorOperatingHours');
    return saved ? JSON.parse(saved) : {
      monday: { open: '09:00', close: '21:00', closed: false },
      tuesday: { open: '09:00', close: '21:00', closed: false },
      wednesday: { open: '09:00', close: '21:00', closed: false },
      thursday: { open: '09:00', close: '21:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '10:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false }
    };
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    orderUpdates: true,
    reviews: true,
    payouts: true,
    marketing: false
  });

  // Load preferences from localStorage or use defaults
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('vendorPreferences');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      language: 'en',
      currency: 'PHP'
    };
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Apply dark mode on mount and when preferences change
  useEffect(() => {
    console.log('Dark mode useEffect triggered. Dark mode:', preferences.darkMode);
    if (preferences.darkMode) {
      console.log('Applying dark mode styles...');
      document.documentElement.classList.add('dark-mode');
      
      // Apply comprehensive dark mode styles
      const style = document.createElement('style');
      style.id = 'dark-mode-styles';
      style.innerHTML = `
        .dark-mode {
          background-color: #0f172a !important;
          color: #e2e8f0 !important;
        }
        .dark-mode body {
          background-color: #0f172a !important;
          color: #e2e8f0 !important;
        }
        .dark-mode .bg-white {
          background-color: #1e293b !important;
        }
        .dark-mode .bg-gray-50 {
          background-color: #1e293b !important;
        }
        .dark-mode .bg-gray-100 {
          background-color: #334155 !important;
        }
        .dark-mode .text-gray-900 {
          color: #f1f5f9 !important;
        }
        .dark-mode .text-gray-800 {
          color: #e2e8f0 !important;
        }
        .dark-mode .text-gray-700 {
          color: #cbd5e1 !important;
        }
        .dark-mode .text-gray-600 {
          color: #94a3b8 !important;
        }
        .dark-mode .text-gray-500 {
          color: #64748b !important;
        }
        .dark-mode .border-gray-200 {
          border-color: #334155 !important;
        }
        .dark-mode .border-gray-300 {
          border-color: #475569 !important;
        }
        .dark-mode input:not([type="checkbox"]):not([type="radio"]), 
        .dark-mode textarea, 
        .dark-mode select {
          background-color: #334155 !important;
          color: #e2e8f0 !important;
          border-color: #475569 !important;
        }
        .dark-mode input::placeholder,
        .dark-mode textarea::placeholder {
          color: #94a3b8 !important;
        }
        .dark-mode .shadow-sm, .dark-mode .shadow, .dark-mode .shadow-md, .dark-mode .shadow-lg, .dark-mode .shadow-xl {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.5) !important;
        }
        .dark-mode [class*="from-white"] {
          background: linear-gradient(to bottom, #1e293b, #0f172a) !important;
        }
        .dark-mode [class*="via-gray-50"] {
          background: linear-gradient(to bottom, #1e293b, #0f172a, #0f172a) !important;
        }
        .dark-mode [class*="to-gray-100"] {
          background: linear-gradient(to bottom, #1e293b, #0f172a) !important;
        }
      `;
      
      // Remove existing dark mode styles if any
      const existingStyle = document.getElementById('dark-mode-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
    } else {
      console.log('Removing dark mode styles...');
      document.documentElement.classList.remove('dark-mode');
      
      // Remove dark mode styles and add light mode reset
      const existingDarkStyle = document.getElementById('dark-mode-styles');
      if (existingDarkStyle) {
        existingDarkStyle.remove();
      }
      
      // Add light mode reset styles
      const lightStyle = document.createElement('style');
      lightStyle.id = 'light-mode-styles';
      lightStyle.innerHTML = `
        input:not([type="checkbox"]):not([type="radio"]), 
        textarea, 
        select {
          background-color: white !important;
          color: #1f2937 !important;
          border-color: #d1d5db !important;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af !important;
        }
      `;
      
      // Remove existing light mode styles if any
      const existingLightStyle = document.getElementById('light-mode-styles');
      if (existingLightStyle) {
        existingLightStyle.remove();
      }
      
      document.head.appendChild(lightStyle);
      
      // Remove light mode styles after a brief moment to allow transition
      setTimeout(() => {
        const styleToRemove = document.getElementById('light-mode-styles');
        if (styleToRemove) {
          styleToRemove.remove();
        }
      }, 100);
    }
  }, [preferences.darkMode]);

  const handleLogoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleLogoSelected = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be less than 2MB');
      return;
    }
    try {
      setLogoUploading(true);
      const fd = new FormData();
      fd.append('logo', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/vendor/profile/logo`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: fd,
        credentials: 'include'
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || err?.message || 'Upload failed');
      }
      const data = await res.json();
      const url = data.logo_url || null;
      const next = { ...businessInfo, logoUrl: url };
      setBusinessInfo(next);
      localStorage.setItem('vendorBusinessInfo', JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('businessInfoUpdated', { detail: next }));
    } catch (err) {
      console.error('Logo upload failed:', err);
      alert(err?.message || 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (section) => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage based on section
      switch(section) {
        case 'Business':
          localStorage.setItem('vendorBusinessInfo', JSON.stringify(businessInfo));
          // Also update the vendor name in the user object if needed
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user) {
            user.businessName = businessInfo.name;
            localStorage.setItem('user', JSON.stringify(user));
          }
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('businessInfoUpdated', { 
            detail: businessInfo 
          }));
          break;
        case 'Operating Hours':
          localStorage.setItem('vendorOperatingHours', JSON.stringify(operatingHours));
          break;
        case 'Notification':
          localStorage.setItem('vendorNotifications', JSON.stringify(notifications));
          break;
        case 'Preferences':
          console.log('Saving preferences:', preferences);
          localStorage.setItem('vendorPreferences', JSON.stringify(preferences));
          console.log('Preferences saved to localStorage');
          // Dark mode is already applied by useEffect
          break;
        case 'Password':
          // Validate passwords
          const curr = security.currentPassword || '';
          const next = security.newPassword || '';
          const conf = security.confirmPassword || '';
          const strong = next.length >= 8 && /[A-Z]/.test(next) && /\d/.test(next);
          if (next !== conf) {
            alert('New passwords do not match!');
            setSaving(false);
            return;
          }
          if (curr === next) {
            alert('New password must be different from current password!');
            setSaving(false);
            return;
          }
          if (!strong) {
            alert('Password must be at least 8 characters and include an uppercase letter and a number.');
            setSaving(false);
            return;
          }
          try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/auth/change-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ current_password: curr, new_password: next })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(data.detail || data.message || 'Failed to update password');
            }
            setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
          } catch (e) {
            alert(e?.message || 'Failed to update password');
            setSaving(false);
            return;
          }
          break;
      }
      
      setSaving(false);
      alert(`${section} settings saved successfully!`);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
      setSaving(false);
    }
  };

  const renderBusinessInfo = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Business Information</h2>
        <p className="text-sm text-gray-600 mb-6">Update your business details and contact information</p>
      </div>

      {/* Logo Upload */}
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold">
          {businessInfo.logoUrl ? (
            <img
              src={`${API_BASE.replace(/\/api$/, '')}${businessInfo.logoUrl}`}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            businessInfo.name.charAt(0)
          )}
        </div>
        <div>
          <button onClick={handleLogoClick} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium" disabled={logoUploading}>
            <FaCamera /> {logoUploading ? 'Uploading...' : 'Upload Logo'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoSelected} className="hidden" />
          <p className="text-xs text-gray-500 mt-2">Recommended: 400x400px, max 2MB</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={businessInfo.name}
            onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={businessInfo.description}
            onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-1" /> Address
          </label>
          <input
            type="text"
            value={businessInfo.address}
            onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaPhone className="inline mr-1" /> Phone Number
          </label>
          <input
            type="tel"
            value={businessInfo.phone}
            onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaEnvelope className="inline mr-1" /> Email
          </label>
          <input
            type="email"
            value={businessInfo.email}
            onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={() => handleSave('Business')}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
      >
        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  const renderOperatingHours = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Operating Hours</h2>
        <p className="text-sm text-gray-600 mb-6">Set your business hours for each day of the week</p>
      </div>

      <div className="space-y-3">
        {Object.entries(operatingHours).map(([day, hours]) => (
          <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-32">
              <p className="font-medium text-gray-900 capitalize">{day}</p>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <input
                type="time"
                value={hours.open}
                onChange={(e) => setOperatingHours({
                  ...operatingHours,
                  [day]: { ...hours, open: e.target.value }
                })}
                disabled={hours.closed}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-200"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={hours.close}
                onChange={(e) => setOperatingHours({
                  ...operatingHours,
                  [day]: { ...hours, close: e.target.value }
                })}
                disabled={hours.closed}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-200"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hours.closed}
                onChange={(e) => setOperatingHours({
                  ...operatingHours,
                  [day]: { ...hours, closed: e.target.checked }
                })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Closed</span>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSave('Operating Hours')}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
      >
        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
        <p className="text-sm text-gray-600 mb-6">Choose what notifications you want to receive</p>
      </div>

      <div className="space-y-4">
        {[
          { key: 'newOrders', label: 'New Orders', desc: 'Get notified when you receive a new order' },
          { key: 'orderUpdates', label: 'Order Updates', desc: 'Updates on order status changes' },
          { key: 'reviews', label: 'Customer Reviews', desc: 'When customers leave reviews' },
          { key: 'payouts', label: 'Payouts', desc: 'Payout confirmations and updates' },
          { key: 'marketing', label: 'Marketing & Promotions', desc: 'Tips and promotional opportunities' }
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{label}</p>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSave('Notification')}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
      >
        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
        <p className="text-sm text-gray-600 mb-6">Customize your dashboard appearance and settings</p>
      </div>

      {/* Dark Mode */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {preferences.darkMode ? (
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                <FaMoon className="text-yellow-400 text-xl" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaSun className="text-yellow-600 text-xl" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">Dark Mode</p>
              <p className="text-sm text-gray-600">
                {preferences.darkMode ? 'Dark theme enabled' : 'Light theme enabled'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.darkMode}
              onChange={(e) => {
                const newDarkMode = e.target.checked;
                setPreferences({ ...preferences, darkMode: newDarkMode });
                console.log('Dark mode toggled:', newDarkMode);
              }}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Dark mode reduces eye strain in low-light environments and can help save battery on OLED screens.
          </p>
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={preferences.language}
          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="en">English</option>
          <option value="fil">Filipino</option>
          <option value="es">Spanish</option>
        </select>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <select
          value={preferences.currency}
          onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="PHP">Philippine Peso (₱)</option>
          <option value="USD">US Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
        </select>
      </div>

      <button
        onClick={() => handleSave('Preferences')}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
      >
        <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Security Settings</h2>
        <p className="text-sm text-gray-600 mb-6">Update your password and security preferences</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPw.current ? 'text' : 'password'}
              value={security.currentPassword}
              onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter current password"
            />
            <button type="button" onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))} className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700">
              {showPw.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPw.next ? 'text' : 'password'}
              value={security.newPassword}
              onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter new password"
            />
            <button type="button" onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))} className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700">
              {showPw.next ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPw.confirm ? 'text' : 'password'}
              value={security.confirmPassword}
              onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Confirm new password"
            />
            <button type="button" onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))} className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700">
              {showPw.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => handleSave('Password')}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
      >
        <FaSave /> {saving ? 'Saving...' : 'Update Password'}
      </button>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2">
            {[
              { id: 'business', icon: FaStore, label: 'Business Info' },
              { id: 'hours', icon: FaClock, label: 'Operating Hours' },
              { id: 'preferences', icon: FaPalette, label: 'Preferences' },
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
            {activeSection === 'business' && renderBusinessInfo()}
            {activeSection === 'hours' && renderOperatingHours()}
            {activeSection === 'notifications' && renderNotifications()}
            {activeSection === 'preferences' && renderPreferences()}
            {activeSection === 'security' && renderSecurity()}
          </div>
        </div>
      </div>
    </div>
  );
}
