import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaSave,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaShieldAlt,
  FaCog,
  FaBuilding,
  FaCheck,
  FaTimesCircle,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import UserSidebar from "./studentSidebar";

const API_BASE = "http://localhost:5000/api";

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: {
      bg: "bg-emerald-500/90",
      icon: <FaCheckCircle className="text-white text-xl" />,
      border: "border-emerald-400"
    },
    error: {
      bg: "bg-rose-500/90",
      icon: <FaExclamationCircle className="text-white text-xl" />,
      border: "border-rose-400"
    },
    info: {
      bg: "bg-blue-500/90",
      icon: <FaExclamationCircle className="text-white text-xl" />,
      border: "border-blue-400"
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="fixed top-4 right-4 z-[99999] animate-slideInRight font-['Montserrat']">
      <div className={`${style.bg} backdrop-blur-md ${style.border} border rounded-lg shadow-2xl p-4 pr-12 min-w-[300px] max-w-md`}>
        <div className="flex items-center gap-3">
          {style.icon}
          <p className="text-white text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
}

const Settings = () => {
  const [user, setUser] = useState(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  // Fetch user profile (fresh from API so we get phone)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/student/profile`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const freshUser = { ...data.user };
            setUser(freshUser);
            setPhoneInput(freshUser.phone || "");
            localStorage.setItem("user", JSON.stringify(freshUser));
          } else {
            // fallback to localStorage if API returned nothing
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setPhoneInput(userData.phone || "");
            }
          }
        } else {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setPhoneInput(userData.phone || "");
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        showToast("Failed to load user profile", "error");
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setPhoneInput(userData.phone || "");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSavePhone = async () => {
    if (!user) return;
    const phone = phoneInput.trim();
    if (!phone) {
      showToast("Enter a phone number first", "error");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/student/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ phone })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || 'Failed to save phone');
      }
      const data = await res.json();
      if (data?.user) {
        setUser(prev => ({ ...prev, phone: data.user.phone }));
        localStorage.setItem("user", JSON.stringify({ ...user, phone: data.user.phone }));
      }
      showToast("Phone number saved", "success");
    } catch (e) {
      showToast(e.message || "Failed to save phone", "error");
    } finally {
      setSaving(false);
    }
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    
    let strength = 0;
    let strengthLabel = "";
    let strengthColor = "";

    if (metRequirements <= 2) {
      strength = 25;
      strengthLabel = "Weak";
      strengthColor = "bg-rose-500";
    } else if (metRequirements === 3) {
      strength = 50;
      strengthLabel = "Fair";
      strengthColor = "bg-amber-500";
    } else if (metRequirements === 4) {
      strength = 75;
      strengthLabel = "Good";
      strengthColor = "bg-yellow-500";
    } else if (metRequirements === 5) {
      strength = 100;
      strengthLabel = "Strong";
      strengthColor = "bg-green-500";
    }

    return { requirements, strength, strengthLabel, strengthColor };
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordForm.currentPassword) {
      showToast("Current password is required", "error");
      return;
    }

    if (!passwordForm.newPassword) {
      showToast("New password is required", "error");
      return;
    }

    // Check all requirements
    const { requirements } = passwordStrength;
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    if (!allRequirementsMet) {
      showToast("Please meet all password requirements", "error");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    try {
      setSaving(true);

      // In a real application, you would send this to your API
      // const response = await fetch(`${API_BASE}/users/change-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     user_id: user.id,
      //     current_password: passwordForm.currentPassword,
      //     new_password: passwordForm.newPassword
      //   }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordSection(false);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      
      showToast("Password changed successfully!", "success");
      setSaving(false);
    } catch (err) {
      console.error("Error changing password:", err);
      showToast("Failed to change password", "error");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="relative font-['Montserrat'] overflow-hidden min-h-screen h-screen w-full flex">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="transition-all duration-500 flex-shrink-0 z-[999999] relative">
          <UserSidebar />
        </div>
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-4"></div>
            <p>Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative font-['Montserrat'] overflow-hidden min-h-screen h-screen w-full flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Sidebar */}
      <div className="transition-all duration-500 flex-shrink-0 z-[999999] relative">
        <UserSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-500/20 p-2.5 rounded-lg">
                <FaCog className="text-green-300 h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">Settings</h1>
                <p className="text-sm text-gray-400">Manage your account settings and preferences</p>
              </div>
            </div>
          </div>

          {/* Profile Section - View Only */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/40 shadow-lg mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <FaUser className="text-green-400" />
                Profile Information
              </h2>

              {/* User Info Header */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-700/50">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{user?.full_name || 'User Name'}</h3>
                  <p className="text-sm text-gray-400 mb-2">{user?.email || 'user@email.com'}</p>
                  {user?.organization && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-700/50 text-gray-300 text-xs font-medium border border-gray-600/50">
                      <FaBuilding className="mr-1" /> {user.organization}
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    <FaUser className="inline mr-1 text-green-400" />
                    Full Name
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/30 rounded-lg text-white text-sm">
                    {user?.full_name || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    <FaEnvelope className="inline mr-1 text-green-400" />
                    Email Address
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/30 rounded-lg text-white text-sm">
                    {user?.email || 'N/A'}
                  </div>
                </div>

                {/* Editable Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    <FaUser className="inline mr-1 text-green-400" />
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. 09123456789 or +639123456789"
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number is used for delivery coordination. No verification required.</p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600/80 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Phone'}
                    </button>
                  </div>
                </div>

                {user?.organization && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      <FaBuilding className="inline mr-1 text-green-400" />
                      Organization
                    </label>
                    <div className="w-full px-3 py-2 bg-gray-700/30 border border-gray-600/30 rounded-lg text-white text-sm">
                      {user.organization}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <FaExclamationCircle className="mt-0.5" />
                  Only phone number can be edited here. Contact administrator for other changes.
                </p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/40 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FaShieldAlt className="text-green-400" />
                  Security
                </h2>
                {!showPasswordSection && (
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600/80 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <FaLock /> Change Password
                  </button>
                )}
              </div>

              {showPasswordSection ? (
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Current Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        New Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {/* Password Strength Bar */}
                      {passwordForm.newPassword && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Password Strength:</span>
                            <span className={`text-xs font-medium ${
                              passwordStrength.strength === 100 ? 'text-green-400' :
                              passwordStrength.strength >= 75 ? 'text-yellow-400' :
                              passwordStrength.strength >= 50 ? 'text-amber-400' :
                              'text-rose-400'
                            }`}>
                              {passwordStrength.strengthLabel}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div
                              className={`${passwordStrength.strengthColor} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${passwordStrength.strength}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Password Requirements Checklist */}
                      {passwordForm.newPassword && (
                        <div className="mt-4 bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                          <p className="text-xs font-semibold text-gray-300 mb-3">Password Requirements:</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs">
                              {passwordStrength.requirements.minLength ? (
                                <FaCheck className="text-green-400 flex-shrink-0" />
                              ) : (
                                <FaTimesCircle className="text-gray-500 flex-shrink-0" />
                              )}
                              <span className={passwordStrength.requirements.minLength ? 'text-green-400' : 'text-gray-400'}>
                                At least 8 characters
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {passwordStrength.requirements.hasUpperCase ? (
                                <FaCheck className="text-green-400 flex-shrink-0" />
                              ) : (
                                <FaTimesCircle className="text-gray-500 flex-shrink-0" />
                              )}
                              <span className={passwordStrength.requirements.hasUpperCase ? 'text-green-400' : 'text-gray-400'}>
                                One uppercase letter (A-Z)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {passwordStrength.requirements.hasLowerCase ? (
                                <FaCheck className="text-green-400 flex-shrink-0" />
                              ) : (
                                <FaTimesCircle className="text-gray-500 flex-shrink-0" />
                              )}
                              <span className={passwordStrength.requirements.hasLowerCase ? 'text-green-400' : 'text-gray-400'}>
                                One lowercase letter (a-z)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {passwordStrength.requirements.hasNumber ? (
                                <FaCheck className="text-green-400 flex-shrink-0" />
                              ) : (
                                <FaTimesCircle className="text-gray-500 flex-shrink-0" />
                              )}
                              <span className={passwordStrength.requirements.hasNumber ? 'text-green-400' : 'text-gray-400'}>
                                One number (0-9)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {passwordStrength.requirements.hasSpecialChar ? (
                                <FaCheck className="text-green-400 flex-shrink-0" />
                              ) : (
                                <FaTimesCircle className="text-gray-500 flex-shrink-0" />
                              )}
                              <span className={passwordStrength.requirements.hasSpecialChar ? 'text-green-400' : 'text-gray-400'}>
                                One special character (!@#$%^&*)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Confirm New Password <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                          className="w-full px-3 py-2 pr-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                        <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                          <FaTimesCircle /> Passwords do not match
                        </p>
                      )}
                      {passwordForm.confirmPassword && passwordForm.newPassword === passwordForm.confirmPassword && (
                        <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                          <FaCheck /> Passwords match
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: ""
                          });
                          setShowCurrentPassword(false);
                          setShowNewPassword(false);
                          setShowConfirmPassword(false);
                        }}
                        disabled={saving}
                        className="px-4 py-2.5 bg-gray-700/50 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600/50 transition-colors border border-gray-600/50 hover:border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-600/80 to-green-700/80 text-white text-sm font-medium rounded-lg hover:from-green-600/90 hover:to-green-700/90 transition-colors border border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Changing...
                          </>
                        ) : (
                          <>
                            <FaSave />
                            Change Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-gray-400">
                  <p>Keep your account secure by using a strong password.</p>
                  <p className="mt-2">Click "Change Password" to update your credentials.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Settings;