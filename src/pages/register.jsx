import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserAlt, FaEnvelope, FaLock, FaStore, FaFilePdf, FaTimes } from "react-icons/fa";
import { toast } from 'react-hot-toast';

import { API_BASE } from '../api';

// Form steps for progress indicator
const FORM_STEPS = [
  { id: 1, title: 'Business Info', icon: '🏪' },
  { id: 2, title: 'Contact Details', icon: '📞' },
  { id: 3, title: 'Account Setup', icon: '🔐' },
];

export default function Register() {
  const [userType] = useState("vendor"); // vendor-only application
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    businessAddress: "",
    contactNumber: "",
    businessDescription: "",
    agree: false,
  });
  const [businessPermit, setBusinessPermit] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Mount animation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update current step based on form completion
  useEffect(() => {
    if (form.email && form.password && form.confirmPassword) {
      setCurrentStep(3);
    } else if (form.businessDescription || businessPermit) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  }, [form, businessPermit]);

  useEffect(() => {
    if (!form.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (form.password.length >= 8) strength += 1;
    if (/\d/.test(form.password)) strength += 1;
    if (/[a-z]/.test(form.password)) strength += 1;
    if (/[A-Z]/.test(form.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [form.password]);

  const getStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "bg-neutral-300";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        setErrors(prev => ({ ...prev, businessPermit: "Only PDF files are allowed." }));
        return;
      }
      
      // Validate file size (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, businessPermit: "File size must not exceed 10MB." }));
        return;
      }
      
      setBusinessPermit(file);
      setErrors(prev => ({ ...prev, businessPermit: undefined }));
    }
  };

  const handleRemoveFile = () => {
    setBusinessPermit(null);
    setErrors(prev => ({ ...prev, businessPermit: undefined }));
    // Reset file input
    const fileInput = document.getElementById('businessPermit');
    if (fileInput) fileInput.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) errs.email = "Invalid email.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password)) errs.password = "Include at least one uppercase letter.";
    else if (!/\d/.test(form.password)) errs.password = "Include at least one number.";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    // Vendor validations
    if (!form.businessName.trim()) errs.businessName = "Business name is required.";
    if (!form.businessAddress.trim()) errs.businessAddress = "Location is required.";
    else if (!["Main Building", "Annex"].includes(form.businessAddress)) errs.businessAddress = "Select Main Building or Annex.";
    if (!form.contactNumber.trim()) errs.contactNumber = "Contact number is required.";
    else {
      const digits = form.contactNumber.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) errs.contactNumber = "Enter a valid phone number (7-15 digits).";
    }
    if (!form.businessDescription.trim()) errs.businessDescription = "Business description is required.";
    if (!businessPermit) errs.businessPermit = "Business permit is required.";
    
    if (!form.agree) errs.agree = "You must agree to the terms.";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    
    if (Object.keys(errs).length === 0) {
      setSubmitting(true);
      try {
        // Vendor application submission
        if (!businessPermit) {
          setErrors(prev => ({ ...prev, businessPermit: "Business permit file is required." }));
          setSubmitting(false);
          return;
        }
        const formData = new FormData();
        formData.append("name", form.name.trim());
        formData.append("email", form.email.trim());
        formData.append("password", form.password);
        formData.append("businessName", form.businessName.trim());
        formData.append("businessAddress", form.businessAddress.trim());
        formData.append("contactNumber", form.contactNumber.trim());
        formData.append("businessDescription", form.businessDescription.trim());
        formData.append("businessPermit", businessPermit);

        const vendorResponse = await fetch(`${API_BASE}/auth/vendor-application`, {
          method: "POST",
          body: formData
        });

        // Attempt to parse JSON even on error for better messaging
        const respJson = await vendorResponse.json().catch(() => null);
        if (!vendorResponse.ok) {
          throw new Error(respJson?.detail || "Failed to submit vendor application");
        }

        toast.success('Application complete. Wait for admin approval.');
        navigate("/login", {
          state: {
            vendorApplicationPending: true,
            businessName: form.businessName
          }
        });

      } catch (err) {
        if (err?.message) toast.error(err.message);
        setErrors({ api: err.message || "Failed to initiate registration" });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0d3d23] font-sans text-neutral-900 antialiased py-8">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-[#1a5d3a]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-[#1a5d3a]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-64 h-64 top-1/2 left-1/4 bg-[#1a5d3a]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Background image with dark green tint and blur */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
          filter: "blur(8px)",
        }}
      />
      {/* Dark green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d3d23]/90 via-[#0d3d23]/85 to-[#1a5d3a]/80" />

      {/* Register Card Container */}
      <div className={`relative z-10 w-full max-w-4xl mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-gradient-to-b from-[#faf8f3] to-white p-8 md:p-10">
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

          {/* Welcome Text with animation */}
          <div className={`text-center mb-6 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight mb-1">Become a Vendor</h1>
            <p className="text-neutral-500 text-sm">Join BrightBite and start selling to campus students</p>
          </div>

          {/* Progress Steps */}
          <div className={`mb-6 transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center justify-between">
              {FORM_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                      currentStep >= step.id 
                        ? 'bg-[#0d3d23] text-white shadow-lg' 
                        : 'bg-neutral-100 text-neutral-400'
                    }`}>
                      {step.icon}
                    </div>
                    <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                      currentStep >= step.id ? 'text-[#0d3d23]' : 'text-neutral-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < FORM_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                      currentStep > step.id ? 'bg-[#0d3d23]' : 'bg-neutral-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Vendor Info Banner */}
          <div className="mb-6 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-emerald-900">Vendor Application</p>
              <p className="mt-0.5 text-emerald-700">Complete the form below. Your application will be reviewed by admin before approval.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Two Column Layout for Name and Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#1a5d3a] transition-colors duration-200">
                    <FaUserAlt className="h-4 w-4" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                    }`}
                    value={form.name}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="businessName">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#1a5d3a] transition-colors duration-200">
                    <FaStore className="h-4 w-4" />
                  </div>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.businessName
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                    }`}
                    value={form.businessName}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Your canteen or restaurant name"
                  />
                </div>
                {errors.businessName && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.businessName}
                  </p>
                )}
              </div>
            </div>

            {/* Vendor Additional Fields */}
            {/* Location (Main Building/Annex) and Contact Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="businessAddress">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  id="businessAddress"
                  name="businessAddress"
                  className={`w-full pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.businessAddress
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                  }`}
                  value={form.businessAddress}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="">Select location</option>
                  <option value="Main Building">Main Building</option>
                  <option value="Annex">Annex</option>
                </select>
                {errors.businessAddress && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.businessAddress}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-neutral-600">Choose where your canteen is located to improve pickup routing.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="contactNumber">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#1a5d3a] transition-colors duration-200">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.contactNumber
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                    }`}
                    value={form.contactNumber}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="e.g., +63 912 345 6789"
                  />
                </div>
                {errors.contactNumber && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.contactNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Business Description */}
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="businessDescription">
                Business Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                rows="3"
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                  errors.businessDescription
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                }`}
                value={form.businessDescription}
                onChange={handleChange}
                disabled={submitting}
                placeholder="Describe your canteen/restaurant and the types of food you offer..."
              />
              {errors.businessDescription && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.businessDescription}
                </p>
              )}
            </div>

            {/* Business Permit Upload */}
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="businessPermit">
                Business Permit <span className="text-red-500">*</span>
              </label>
              
              {!businessPermit ? (
                <div className="relative">
                  <input
                    id="businessPermit"
                    name="businessPermit"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={submitting}
                    className="hidden"
                  />
                  <label
                    htmlFor="businessPermit"
                    className={`flex flex-col items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      errors.businessPermit
                        ? 'border-red-300 bg-red-50 hover:bg-red-100'
                        : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-400'
                    }`}
                  >
                    <FaFilePdf className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-sm font-medium text-neutral-700 mb-1">
                      Click to upload business permit
                    </span>
                    <span className="text-xs text-neutral-500">
                      PDF only, maximum 10MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FaFilePdf className="h-8 w-8 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {businessPermit.name}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {formatFileSize(businessPermit.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="ml-3 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Remove file"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              {errors.businessPermit && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.businessPermit}
                </p>
              )}
              <p className="mt-1.5 text-xs text-neutral-600">Upload a valid business permit or DTI registration certificate (PDF, max 10MB).</p>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#1a5d3a] transition-colors duration-200">
                  <FaEnvelope className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                  }`}
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Two Column Layout for Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#1a5d3a] transition-colors duration-200">
                    <FaLock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-10 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
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
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-1.5" htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-[#1a5d3a] transition-colors duration-200">
                    <FaLock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-10 py-3 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-neutral-300 focus:ring-[#1a5d3a]/20 hover:border-neutral-400'
                    }`}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-700 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Password Strength Indicator */}
            {form.password && (
              <div className="space-y-1.5">
                <div className="flex space-x-1 h-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-full w-1/5 rounded-full transition-colors duration-300 ${
                        passwordStrength >= level ? getStrengthColor() : 'bg-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-600">Password strength:</span>
                  <span className={`font-medium ${
                    passwordStrength <= 2 ? 'text-red-600' : 
                    passwordStrength <= 4 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
              </div>
            )}

            {/* Terms Agreement */}
            <div className="flex items-start pt-2">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={form.agree}
                onChange={handleChange}
                className="h-4 w-4 mt-0.5 text-[#1a5d3a] focus:ring-[#1a5d3a]/20 border-neutral-300 rounded cursor-pointer"
                disabled={submitting}
              />
              <label htmlFor="agree" className="ml-2 text-sm text-neutral-700">
                I agree to the{' '}
                <Link to="/terms-of-service" className="text-[#1a5d3a] hover:text-[#0d3d23] font-medium transition-colors hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="text-[#1a5d3a] hover:text-[#0d3d23] font-medium transition-colors hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agree && (
              <p className="text-sm text-red-600 -mt-2" role="alert">
                {errors.agree}
              </p>
            )}

            {/* API Error */}
            {errors.api && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-800">{errors.api}</span>
              </div>
            )}

            {/* Submit Button with enhanced animation */}
            <button
              type="submit"
              disabled={submitting}
              className="relative w-full mt-4 rounded-xl px-4 py-3.5 text-white font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1a5d3a]/30 focus:ring-offset-2 overflow-hidden group bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting application...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Submit Vendor Application
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-neutral-400 font-medium">Already registered?</span>
              </div>
            </div>

            {/* Sign In Link */}
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-[#0d3d23]/20 text-[#0d3d23] font-semibold text-sm hover:bg-[#0d3d23]/5 hover:border-[#0d3d23]/40 transition-all duration-200 group"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign in to existing account
              <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </form>
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