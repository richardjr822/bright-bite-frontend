import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../api';

// Role configuration with icons and descriptions
const ROLES = [
  {
    id: 'student',
    label: 'Student',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    description: 'Order food & track deliveries',
  },
  {
    id: 'vendor',
    label: 'Vendor',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    description: 'Manage your food stall',
  },
  {
    id: 'delivery_staff',
    label: 'Delivery',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    description: 'Deliver orders to students',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'System administration',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const [roleError, setRoleError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pendingVendor = location.state?.vendorApplicationPending;

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setRoleError("");
    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    if (!password) {
      setPasswordError("Please enter your password.");
      valid = false;
    }
    if (!selectedRole) {
      setRoleError("Please select a role.");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data?.detail;
        const normalized = typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((d) => d?.msg || d).join(', ')
            : data?.message || 'Login failed. Please try again.';
        setEmailError(normalized);
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Enforce role selection matches account role
      const userRole = data?.user?.role;
      if (selectedRole && userRole && selectedRole !== userRole) {
        setRoleError(`Your account role is '${userRole}'. Please select '${userRole}' to continue.`);
        setLoading(false);
        return;
      }

      setSent(true);
      setTimeout(() => {
        if (data?.user?.role === 'admin') {
          navigate('/admin');
        } else if (data?.user?.role === 'vendor') {
          navigate('/vendor');
        } else if (data?.user?.role === 'delivery_staff') {
          navigate('/delivery-staff');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch {
      setEmailError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0d3d23] font-sans text-neutral-900 antialiased">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-[#1a5d3a]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-[#1a5d3a]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Background image with dark green tint and blur */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] hover:scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          filter: "blur(8px)",
        }}
      />
      {/* Dark green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3d23]/90 via-[#0d3d23]/85 to-[#1a5d3a]/80" />

      {/* Login Card Container */}
      <div className={`relative z-10 w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Left Side - Food Image with overlay content */}
        <div
          className="hidden md:flex flex-col justify-between bg-cover bg-center relative min-h-[580px]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d3d23]/95 via-[#0d3d23]/40 to-transparent" />
          
          {/* Top decorative element */}
          <div className="relative z-10 p-8">
            <div className="flex items-center gap-2 text-white/80">
              <div className="w-8 h-0.5 bg-white/50 rounded-full" />
              <span className="text-xs font-medium tracking-wider uppercase">Campus Canteen</span>
            </div>
          </div>

          {/* Bottom content */}
          <div className="relative z-10 p-8 text-white">
            <h2 className="text-2xl font-bold mb-3 leading-tight">
              Fresh, Delicious Food<br />at Your Fingertips
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Order from your favorite campus vendors and get your meals delivered right to you.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-col gap-3">
              {[
                { icon: '🍔', text: 'Multiple food vendors' },
                { icon: '⚡', text: 'Quick ordering process' },
                { icon: '🚀', text: 'Fast campus delivery' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="text-lg">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-gradient-to-b from-[#faf8f3] to-white p-8 md:p-10 flex flex-col justify-center">
          {/* Logo with animation */}
          <div className={`flex justify-center mb-5 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <div className="flex items-center gap-3 group cursor-pointer">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] shadow-lg ring-1 ring-[#1a5d3a]/50 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                <svg className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-12" viewBox="0 0 24 24" fill="none" strokeWidth="1.25" stroke="currentColor">
                  <path d="M3 11c0 4 3 7 9 7s9-3 9-7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10c1-2 3-3 5-3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 6c1 1 1 3 0 4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 4c.6 0 1.6.7 2 1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-bold text-2xl tracking-tight text-[#0d3d23]">BrightBite</span>
            </div>
          </div>

          {/* Pending Vendor Banner with animation */}
          {pendingVendor && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-sm text-amber-800 shadow-sm flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-900">Vendor Application Submitted</p>
                <p className="mt-1 text-amber-700 text-xs leading-relaxed">
                  Your application for <span className="font-semibold">{location.state?.businessName}</span> is pending admin approval.
                </p>
              </div>
            </div>
          )}

          {/* Welcome Text with animation */}
          <div className={`text-center mb-5 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight mb-1">Welcome back</h1>
            <p className="text-neutral-500 text-sm">Sign in to continue to BrightBite</p>
          </div>

          {/* GC Domain Guidance - Conditional */}
          {selectedRole === 'student' && (
            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-blue-900 text-xs">Gordon College Students</p>
                  <p className="mt-0.5 text-blue-700 text-xs">Use your GC email. Accounts are provided by the school.</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Role Selection Cards */}
            <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                Select your role
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role.id);
                      if (roleError) setRoleError("");
                    }}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 group ${
                      selectedRole === role.id
                        ? 'border-[#0d3d23] bg-[#0d3d23]/5 shadow-md'
                        : 'border-neutral-200 hover:border-[#1a5d3a]/50 hover:bg-neutral-50'
                    }`}
                  >
                    <div className={`mb-1.5 transition-colors duration-200 ${
                      selectedRole === role.id ? 'text-[#0d3d23]' : 'text-neutral-400 group-hover:text-[#1a5d3a]'
                    }`}>
                      {role.icon}
                    </div>
                    <span className={`text-xs font-medium transition-colors duration-200 ${
                      selectedRole === role.id ? 'text-[#0d3d23]' : 'text-neutral-600'
                    }`}>
                      {role.label}
                    </span>
                    {selectedRole === role.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0d3d23] rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500 text-center">
                {ROLES.find(r => r.id === selectedRole)?.description}
              </p>
              {roleError && (
                <p className="mt-2 text-sm text-red-600 text-center" role="alert">
                  {roleError}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className={`transition-all duration-500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`relative rounded-xl border-2 transition-all duration-200 ${
                emailError
                  ? 'border-red-300 bg-red-50/30'
                  : focusedField === 'email'
                    ? 'border-[#0d3d23] shadow-lg shadow-[#0d3d23]/10'
                    : 'border-neutral-200 hover:border-neutral-300'
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 transition-colors duration-200 ${focusedField === 'email' ? 'text-[#0d3d23]' : 'text-neutral-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  required
                  aria-describedby={emailError ? "email-error" : undefined}
                  className="w-full bg-transparent rounded-xl pl-12 pr-4 py-3.5 text-sm placeholder-neutral-400 focus:outline-none"
                />
              </div>
              {emailError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600" id="email-error" role="alert">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {emailError}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className={`transition-all duration-500 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`relative rounded-xl border-2 transition-all duration-200 ${
                passwordError
                  ? 'border-red-300 bg-red-50/30'
                  : focusedField === 'password'
                    ? 'border-[#0d3d23] shadow-lg shadow-[#0d3d23]/10'
                    : 'border-neutral-200 hover:border-neutral-300'
              }`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 transition-colors duration-200 ${focusedField === 'password' ? 'text-[#0d3d23]' : 'text-neutral-400'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  required
                  aria-describedby={passwordError ? "password-error" : undefined}
                  className="w-full bg-transparent rounded-xl pl-12 pr-12 py-3.5 text-sm placeholder-neutral-400 focus:outline-none"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-[#0d3d23] transition-colors duration-200"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600" id="password-error" role="alert">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {passwordError}
                </div>
              )}
            </div>

            {/* Login Button with enhanced animation */}
            <button
              type="submit"
              disabled={loading || sent}
              className={`relative w-full mt-2 rounded-xl px-4 py-3.5 text-white font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/30 focus:ring-offset-2 overflow-hidden group ${
                sent 
                  ? 'bg-green-500 hover:bg-green-500' 
                  : 'bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              } disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {sent ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Success! Redirecting...
                </span>
              ) : loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-neutral-400 font-medium">New to BrightBite?</span>
            </div>
          </div>

          {/* Vendor Application Link */}
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-[#0d3d23]/20 text-[#0d3d23] font-semibold text-sm hover:bg-[#0d3d23]/5 hover:border-[#0d3d23]/40 transition-all duration-200 group"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
            </svg>
            Apply as Vendor
            <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Back to Home Link */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/90 hover:text-white transition-colors group z-20"
      >
        <svg
          className="w-5 h-5 transition-transform group-hover:-translate-x-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">Back to home</span>
      </Link>
    </div>
  );
}