import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaKey, FaEnvelope, FaArrowLeft } from "react-icons/fa";

import { API_BASE } from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) return;
    
    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [timeLeft]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const validateEmail = () => {
    const errs = {};
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      errs.email = 'Invalid email format.';
    }
    return errs;
  };

  const validateOtp = () => {
    const errs = {};
    if (!form.otp.trim()) {
      errs.otp = 'OTP is required.';
    } else if (!/^\d{6}$/.test(form.otp)) {
      errs.otp = 'OTP must be 6 digits.';
    }
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }
    
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (formError) setFormError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const errs = validateEmail();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      setFormError('');
      
      try {
        // Check if user exists first
        const checkResponse = await fetch(`${API_BASE}/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email })
        });

        if (!checkResponse.ok) {
          throw new Error('Email not found. Please check your email address.');
        }

        // Send OTP
        const response = await fetch(`${API_BASE}/auth/send-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: form.email,
            name: 'User' // We don't have the name yet
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to send OTP');
        }

        setOtpSent(true);
        setTimeLeft(600); // 10 minutes
        setStep(2);
      } catch (error) {
        setFormError(error.message || 'Failed to send OTP. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const errs = validateOtp();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      setFormError('');
      
      try {
        const response = await fetch(`${API_BASE}/auth/verify-reset-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            otp: form.otp
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Invalid OTP');
        }

        setStep(3);
      } catch (error) {
        setFormError(error.message || 'Failed to verify OTP. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      setFormError('');
      
      try {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            otp: form.otp,
            new_password: form.password
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to reset password');
        }

        setStep(4);
      } catch (error) {
        setFormError(error.message || 'Failed to reset password. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    
    setSubmitting(true);
    setFormError('');
    
    try {
      const response = await fetch(`${API_BASE}/auth/send-reset-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: form.email,
          name: 'User'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to resend OTP');
      }

      setTimeLeft(600);
    } catch (error) {
      setFormError(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen py-6 md:py-0 font-['Montserrat']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap');
      `}</style>
      
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>
        <div className="absolute top-20 right-0 w-1/3 h-1/3 bg-green-900/30 rounded-full mix-blend-screen filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-10 left-0 w-1/4 h-1/4 bg-green-800/30 rounded-full mix-blend-screen filter blur-2xl opacity-70"></div>
        <div className="absolute top-1/4 left-1/3 w-12 h-12 bg-green-600/20 rounded-full hidden md:block"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 bg-green-700/20 rounded-full hidden md:block"></div>
        <div className="absolute top-20 left-20 w-6 h-6 rounded-full bg-green-600/20"></div>
        <div className="absolute bottom-40 right-60 w-6 h-6 bg-green-700/20 rounded-full"></div>
        <div className="absolute top-40 right-80 w-4 h-4 bg-green-500/20 rounded-full"></div>
        <div className="absolute bottom-60 left-40 w-5 h-5 bg-green-600/20 rounded-full"></div>
        <div className="absolute top-80 left-60 w-6 h-6 bg-green-700/20 rounded-full"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDYwaDYwVjBoLTYweiIvPjxwYXRoIGQ9Ik02MCAzMC41djFINTl2LTF6TTYwIDAgMCAwdjU5aDFWMWg1OXoiIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iLjIiLz48cGF0aCBkPSJNMzAgNjBoMXYtMWgtMXpNMzAgMGgxdjFoLTF6TTAgMzBoNjB2MUgweiIgZmlsbD0iIzIwMjAyMCIgZmlsbC1vcGFjaXR5PSIuMiIvPjwvZz48L3N2Zz4=')] opacity-[0.03]"></div>
      </div>

      {/* Back to Login Link */}
      <Link 
        to="/login" 
        className={`fixed top-6 left-6 p-2 text-gray-300 hover:text-green-400 flex items-center gap-2 transition-all duration-300 group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        <div className="relative overflow-hidden w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-green-500 transition-colors duration-300">
          <span className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/10 transition-colors duration-300"></span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-sm font-medium relative">
          Back to Login
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 group-hover:w-full transition-all duration-300"></span>
        </span>
      </Link>

      {/* Form Container */}
      <div className="bg-gray-800/50 backdrop-blur-md p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md mx-auto mt-12 z-10">
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-3 rounded-xl shadow-lg mb-3 relative">
              <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-500 mb-1">
              BrightBite
            </h1>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-700"></div>
            
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  s < step ? 'bg-green-500 text-white' : 
                  s === step ? 'bg-green-600 text-white' : 
                  'bg-gray-700 text-gray-400'
                } ${s === 4 && step === 4 ? 'bg-green-500 text-white' : ''}`}
              >
                {s < step ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  s
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span className={step >= 1 ? 'text-green-400' : ''}>Email</span>
            <span className={step >= 2 ? 'text-green-400' : ''}>Verify</span>
            <span className={step >= 3 ? 'text-green-400' : ''}>Reset</span>
            <span className={step >= 4 ? 'text-green-400' : ''}>Done</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          {step === 1 && 'Reset Your Password'}
          {step === 2 && 'Verify Your Identity'}
          {step === 3 && 'Create New Password'}
          {step === 4 && 'Password Reset Complete'}
        </h2>
        
        {formError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 text-red-200 rounded-lg text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{formError}</span>
            </div>
          </div>
        )}
        
        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-400 transition-colors duration-200">
                  <FaEnvelope className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3.5 bg-gray-700/50 border ${
                    errors.email ? 'border-red-500' : 'border-gray-600 group-hover:border-gray-500'
                  } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <div className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.email}</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-300 text-sm">
              We'll send a one-time password (OTP) to your email address to verify your identity.
            </p>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center group relative overflow-hidden"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="relative">Sending OTP...</span>
                </>
              ) : (
                <span className="relative flex items-center">
                  Send OTP
                  <FaArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              )}
            </button>
          </form>
        )}
        
        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-200" htmlFor="otp">
                  Enter 6-digit OTP
                </label>
                {timeLeft > 0 && (
                  <span className="text-sm text-green-400">
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-400 transition-colors duration-200">
                  <FaKey className="h-5 w-5" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  className={`w-full pl-10 pr-4 py-3.5 bg-gray-700/50 border ${
                    errors.otp ? 'border-red-500' : 'border-gray-600 group-hover:border-gray-500'
                  } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 tracking-widest text-center`}
                  value={form.otp}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="123456"
                />
              </div>
              {errors.otp && (
                <div className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.otp}</span>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-2">
                We've sent a 6-digit code to <span className="text-green-400">{form.email}</span>
              </p>
              <button 
                type="button"
                className={`text-sm ${timeLeft > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-green-400 hover:underline cursor-pointer'}`}
                onClick={handleResendOtp}
                disabled={timeLeft > 0 || submitting}
              >
                Didn't receive the code? {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend OTP'}
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                className="md:w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              
              <button
                type="submit"
                className="md:w-1/2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>Verify</>
                )}
              </button>
            </div>
          </form>
        )}
        
        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200" htmlFor="password">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-400 transition-colors duration-200">
                  <FaLock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-12 py-3.5 bg-gray-700/50 border ${
                    errors.password ? 'border-red-500' : 'border-gray-600 group-hover:border-gray-500'
                  } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.password}</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-200" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-400 transition-colors duration-200">
                  <FaLock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`w-full pl-10 pr-4 py-3.5 bg-gray-700/50 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600 group-hover:border-gray-500'
                  } text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <div className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
            
            <div className="text-gray-300 text-sm">
              <p>Your new password must:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li className={form.password && form.password.length >= 8 ? 'text-green-400' : ''}>
                  Be at least 8 characters long
                </li>
                <li className={form.password && /[A-Z]/.test(form.password) ? 'text-green-400' : ''}>
                  Include at least one uppercase letter
                </li>
                <li className={form.password && /[0-9]/.test(form.password) ? 'text-green-400' : ''}>
                  Include at least one number
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                className="md:w-1/2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center"
                onClick={() => setStep(2)}
                disabled={submitting}
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              
              <button
                type="submit"
                className="md:w-1/2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>Reset Password</>
                )}
              </button>
            </div>
          </form>
        )}
        
        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Password Reset Complete!</h3>
              <p className="text-gray-300">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>
            
            <div>
              <Link
                to="/login"
                className="inline-block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}