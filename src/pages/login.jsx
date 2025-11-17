import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { useGoogleLogin } from '@react-oauth/google';
import { API_BASE } from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const pendingVendor = location.state?.vendorApplicationPending;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setEmailError("");
      try {
        // Get user info from Google
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }

        const googleUserInfo = await userInfoResponse.json();

        // Send to your backend
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: tokenResponse.access_token,
            email: googleUserInfo.email,
            name: googleUserInfo.name,
            picture: googleUserInfo.picture,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Google login failed');
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('User data from backend:', data.user); // Debug log

        // Admins and vendors go straight to their dashboards (rider removed)
        if (data?.user?.role === 'admin') {
          setSent(true);
          setTimeout(() => {
            navigate('/admin');
          }, 1200);
          return;
        } else if (data?.user?.role === 'vendor') {
          setSent(true);
          setTimeout(() => {
            navigate('/vendor');
          }, 1200);
          return;
        } else if (data?.user?.role === 'delivery_staff') {
          setSent(true);
          setTimeout(() => {
            navigate('/delivery-staff');
          }, 1200);
          return;
        }

        // Students might need to complete profile
        const isStudent = data?.user?.role === 'student' || !data?.user?.role;
        const needsProfileCompletion = isStudent && (
          !data.user.organization || 
          data.user.agreed_to_terms === false
        );
        
        console.log('Needs profile completion?', needsProfileCompletion); // Debug log
        console.log('Organization:', data.user.organization); // Debug log
        console.log('Agreed to terms:', data.user.agreed_to_terms); // Debug log
        
        if (needsProfileCompletion) {
          // Redirect to complete profile
          navigate('/complete-profile');
        } else {
          // Profile already complete, go to dashboard
          setSent(true);
          setTimeout(() => {
            navigate(isStudent ? '/canteen' : '/');
          }, 1200);
        }
      } catch (error) {
        console.error('Google login error:', error);
        setEmailError(error.message || 'Google login failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setEmailError('Google login failed. Please try again.');
      setGoogleLoading(false);
    },
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    }
    if (!password) {
      setPasswordError("Please enter your password.");
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
      setSent(true);
      setTimeout(() => {
        if (data?.user?.role === 'admin') {
          navigate('/admin');
        } else if (data?.user?.role === 'vendor') {
          navigate('/vendor');
        } else if (data?.user?.role === 'delivery_staff') {
          navigate('/delivery-staff');
        } else {
          navigate('/canteen');
        }
      }, 1200);
    } catch {
      setEmailError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0d3d23] font-sans text-neutral-900 antialiased">
      {/* Background image with dark green tint and blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          filter: "blur(8px)",
        }}
      />
      {/* Dark green tint overlay */}
      <div className="absolute inset-0 bg-[#0d3d23]/85" />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        {/* Left Side - Food Image (hidden on mobile) */}
        <div
          className="hidden md:block bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d3d23]/30 to-transparent" />
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-[#faf8f3] p-8 md:p-10 flex flex-col justify-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] shadow ring-1 ring-[#1a5d3a] transition hover:shadow-lg">
                <svg
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.25"
                  stroke="currentColor"
                >
                  <path
                    d="M3 11c0 4 3 7 9 7s9-3 9-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7 10c1-2 3-3 5-3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 6c1 1 1 3 0 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 4c.6 0 1.6.7 2 1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="font-bold text-2xl tracking-tight text-[#0d3d23]">
                BrightBite
              </span>
            </div>
          </div>

          {/* Pending Vendor Banner */}
          {pendingVendor && (
            <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm flex items-start gap-3">
              <svg className="h-5 w-5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M4.93 4.93a10 10 0 0114.14 14.14A10 10 0 014.93 4.93z" />
              </svg>
              <div>
                <p className="font-semibold">Vendor Application Submitted</p>
                <p className="mt-1 text-amber-700 text-xs leading-relaxed">
                  Your vendor application for <span className="font-medium">{location.state?.businessName}</span> is pending admin approval. You will receive an email once it is reviewed. You cannot log in as a vendor until approved.
                </p>
              </div>
            </div>
          )}

          {/* Welcome Text */}
          <h1 className="text-3xl font-bold mb-2 text-neutral-900 text-center leading-tight">
            Log in to BrightBite
          </h1>
          <p className="text-neutral-600 mb-6 text-center leading-relaxed">
            Welcome back! Sign in to your account.
          </p>

          {/* Form */}
          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-neutral-800 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-neutral-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
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
                  placeholder="you@example.com"
                  required
                  aria-describedby={emailError ? "email-error" : undefined}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? "border-red-300 focus:ring-red-200"
                      : "border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400"
                  }`}
                />
              </div>
              {emailError && (
                <p id="email-error" className="mt-1.5 text-sm text-red-600" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-neutral-800 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-neutral-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
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
                  placeholder="Enter your password"
                  required
                  aria-describedby={passwordError ? "password-error" : undefined}
                  className={`w-full rounded-lg border pl-10 pr-12 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordError
                      ? "border-red-300 focus:ring-red-200"
                      : "border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400"
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="mt-1.5 text-sm text-red-600" role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-[#1a5d3a] hover:text-[#0d3d23] font-medium transition-colors hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="mt-2 rounded-lg bg-[#0d3d23] px-4 py-3 text-white font-semibold shadow hover:bg-[#1a5d3a] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:ring-offset-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    ></circle>
                    <path
                      fill="currentColor"
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* Success Message */}
          {sent && (
            <div
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-[#0d3d23] font-medium shadow-sm border border-green-100"
              role="status"
              aria-live="polite"
            >
              <svg
                className="w-4 h-4 text-[#1a5d3a]"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12.5l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Login successful!
            </div>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-neutral-200"></div>
            <span className="px-4 text-xs font-medium text-neutral-500 tracking-wide">OR</span>
            <div className="flex-1 border-t border-neutral-200"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={() => handleGoogleLogin()}
            type="button"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-neutral-400/20 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  ></circle>
                  <path
                    fill="currentColor"
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <FaGoogle className="text-lg text-[#4285F4]" />
                Continue with Google
              </>
            )}
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-sm text-neutral-700 text-center">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-[#1a5d3a] font-semibold hover:text-[#0d3d23] transition-colors hover:underline"
            >
              Sign up
            </Link>
          </div>
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