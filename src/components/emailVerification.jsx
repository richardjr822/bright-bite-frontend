import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaArrowLeft, FaRedo } from 'react-icons/fa';

import { resendRegistrationOtp, verifyRegistrationOtp, completeRegistration } from '../api';

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef([]);

  const registrationData = location.state?.registrationData;
  const email = registrationData?.email;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!registrationData || !email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [registrationData, email, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
      if (newOtp.length === 6) {
        handleVerify(pastedData);
      }
    }
  };

  const handleVerify = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyRegistrationOtp(email, otpCode);
      setSuccess('Email verified! Completing registration...');
      const userData = await completeRegistration(registrationData);
      localStorage.setItem('user', JSON.stringify(userData.user));
      
      setTimeout(() => {
        navigate('/dashboard', { 
          state: { message: 'Registration successful! Welcome to BrightBite.' }
        });
      }, 1500);

    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await resendRegistrationOtp(registrationData.name, email);

      setSuccess('New verification code sent!');
      setTimeLeft(600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
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

      {/* Back Button */}
      <button
        onClick={() => navigate('/register')}
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
        <span className="text-sm font-medium">Back to Registration</span>
      </button>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-[#faf8f3] rounded-2xl shadow-2xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] shadow ring-1 ring-[#1a5d3a] transition hover:shadow-lg">
              <FaEnvelope className="w-6 h-6 text-white" />
            </span>
            <span className="font-bold text-2xl tracking-tight text-[#0d3d23]">
              BrightBite
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2 text-center text-neutral-900">
          Verify Your Email
        </h2>
        <p className="text-neutral-600 text-center mb-8">
          We've sent a 6-digit code to<br />
          <span className="font-semibold text-[#0d3d23]">{email}</span>
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-[#0d3d23] rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-[#1a5d3a] flex-shrink-0" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-12 h-14 text-center text-2xl font-bold bg-white border-2 ${
                error ? 'border-red-500' : 'border-neutral-300 hover:border-neutral-400'
              } text-neutral-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/20 focus:border-[#1a5d3a] transition-all duration-200`}
              disabled={loading}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-neutral-600 text-sm">
              Code expires in <span className="font-semibold text-[#1a5d3a]">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-red-600 font-semibold text-sm">Code expired</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={loading || otp.some(digit => digit === '')}
          className="w-full bg-[#0d3d23] hover:bg-[#1a5d3a] text-white font-semibold py-4 rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center group relative overflow-hidden mb-4"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-30 -translate-x-full group-hover:animate-shine"></span>
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="relative">Verifying...</span>
            </>
          ) : (
            <span className="relative">Verify Email</span>
          )}
        </button>

        {/* Resend Button */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`text-sm font-semibold flex items-center justify-center mx-auto transition-colors ${
              canResend && !loading 
                ? 'text-[#1a5d3a] hover:text-[#0d3d23] cursor-pointer' 
                : 'text-neutral-400 cursor-not-allowed'
            }`}
          >
            <FaRedo className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-neutral-500 text-xs text-center mt-6">
          Didn't receive the code? Check your spam folder or click resend after the timer expires.
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;