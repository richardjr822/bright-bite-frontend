import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaArrowRight, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { toast } from 'react-hot-toast';

import { sendResetOtp, resetPassword } from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 3: New Password, 4: Success (OTP removed)
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

  // OTP validation removed (OTP flow disabled)

  const validatePassword = () => {
    const errs = {};
    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = 'Include at least one uppercase letter.';
    } else if (!/\d/.test(form.password)) {
      errs.password = 'Include at least one number.';
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
        // Verify email exists; OTP disabled. Proceed to password step
        await sendResetOtp(form.email);
        toast.success('Email verified. You can reset your password now.');
        setStep(3);
      } catch (error) {
        setFormError(error.message || 'Could not verify email. Please try again.');
        if (error?.message) toast.error(error.message);
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
        // OTP disabled: pass empty OTP; backend bypasses check
        await resetPassword(form.email, '', form.password);
        toast.success('Password reset successful!');
        setStep(4);
      } catch (error) {
        setFormError(error.message || 'Failed to reset password. Please try again.');
        if (error?.message) toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Resend OTP removed (OTP flow disabled)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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

      {/* Back to Login Link */}
      <Link 
        to="/login" 
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
        <span className="text-sm font-medium">Back to Login</span>
      </Link>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#faf8f3] rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] shadow ring-1 ring-[#1a5d3a] transition hover:shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </span>
            <span className="font-bold text-2xl tracking-tight text-[#0d3d23]">
              BrightBite
            </span>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200"></div>
            
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  s < step ? 'bg-[#1a5d3a] text-white' : 
                  s === step ? 'bg-[#0d3d23] text-white' : 
                  'bg-neutral-200 text-neutral-400'
                } ${s === 4 && step === 4 ? 'bg-[#1a5d3a] text-white' : ''}`}
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
          
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span className={step >= 1 ? 'text-[#1a5d3a] font-semibold' : ''}>Email</span>
            {/* Verify step removed */}
            <span className={step >= 3 ? 'text-[#1a5d3a] font-semibold' : ''}>Reset</span>
            <span className={step >= 4 ? 'text-[#1a5d3a] font-semibold' : ''}>Done</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-center text-neutral-900">
          {step === 1 && 'Reset Your Password'}
          {/* Step 2 removed */}
          {step === 3 && 'Create New Password'}
          {step === 4 && 'Password Reset Complete'}
        </h2>
        
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
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
              <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                  }`}
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <p className="text-neutral-600 text-sm">
              We will verify your email address and then let you reset your password.
            </p>
            
            <button
              type="submit"
              className="w-full rounded-lg bg-[#0d3d23] px-4 py-3 text-white font-semibold shadow hover:bg-[#1a5d3a] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:ring-offset-1"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Send OTP
                  <FaArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
        )}
        
        {/* Step 2 removed (OTP verification bypassed) */}
        
        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="password">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full rounded-lg border pl-10 pr-12 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                  }`}
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700 transition-colors"
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
                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className={`w-full rounded-lg border pl-10 pr-4 py-3 text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                  }`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="text-neutral-600 text-sm bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <p className="font-semibold mb-2">Your new password must:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li className={form.password && form.password.length >= 8 ? 'text-[#1a5d3a] font-medium' : ''}>
                  Be at least 8 characters long
                </li>
                <li className={form.password && /[A-Z]/.test(form.password) ? 'text-[#1a5d3a] font-medium' : ''}>
                  Include at least one uppercase letter
                </li>
                <li className={form.password && /[0-9]/.test(form.password) ? 'text-[#1a5d3a] font-medium' : ''}>
                  Include at least one number
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <button
                type="button"
                className="md:w-1/2 rounded-lg border-2 border-neutral-300 bg-white text-neutral-700 font-semibold py-3 hover:bg-neutral-50 transition-all flex items-center justify-center"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              
              <button
                type="submit"
                className="md:w-1/2 rounded-lg bg-[#0d3d23] px-4 py-3 text-white font-semibold shadow hover:bg-[#1a5d3a] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:ring-offset-1 flex items-center justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                      <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>
          </form>
        )}
        
        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#1a5d3a]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Password Reset Complete!</h3>
              <p className="text-neutral-600">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
            </div>
            
            <div>
              <Link
                to="/login"
                className="inline-block w-full rounded-lg bg-[#0d3d23] px-4 py-4 text-white font-semibold shadow hover:bg-[#1a5d3a] transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:ring-offset-1"
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
