import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import { API_BASE } from '../../api';
import {
  FaUserPlus,
  FaCamera,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaSpinner,
  FaArrowLeft,
  FaKey,
  FaCopy,
  FaCheck,
} from 'react-icons/fa';

const DeliverStaff = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePhoto: null,
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedStaffId, setGeneratedStaffId] = useState('');
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [lastCreated, setLastCreated] = useState({ name: '', email: '' });

  // Do not generate locally; will be provided by backend after creation
  useEffect(() => {
    setGeneratedStaffId('');
    setGeneratedPassword('');
  }, []);

  const generateStaffId = () => {
    // VND-YYYYMMDD-XXXX
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `VND-${y}${m}${day}-${rand}`;
  };

  const generatePassword = () => {
    // 10 chars: upper, lower, digits
    const U = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const L = 'abcdefghijkmnopqrstuvwxyz';
    const D = '23456789';
    const all = U + L + D;
    let pwd = '';
    pwd += U[Math.floor(Math.random() * U.length)];
    pwd += L[Math.floor(Math.random() * L.length)];
    pwd += D[Math.floor(Math.random() * D.length)];
    for (let i = 0; i < 7; i++) pwd += all[Math.floor(Math.random() * all.length)];
    return pwd.split('').sort(() => 0.5 - Math.random()).join('');
  };

  const [staffList, setStaffList] = useState([]);
  const fetchStaffList = async () => {
    try {
      const token = localStorage.getItem('token');
      const resp = await fetch(`${API_BASE}/vendor/delivery-staff`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Failed to load staff');
      const data = await resp.json();
      setStaffList(Array.isArray(data?.staff) ? data.staff : []);
    } catch (e) {
      console.error('Failed to fetch staff list', e);
      setStaffList([]);
    }
  };
  useEffect(() => { fetchStaffList(); }, []);

  const generatePdf = async ({ firstName, lastName, email, phone, staffId, password, photo }) => {
    const doc = new jsPDF();
    const brand = 'BrightBite';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`${brand} — Delivery Staff Credentials`, 14, 18);
    doc.setDrawColor(16, 185, 129);
    doc.line(14, 22, 196, 22);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let y = 32;
    doc.text(`Name: ${firstName} ${lastName}`.trim(), 14, y); y += 8;
    doc.text(`Email: ${email}`, 14, y); y += 8;
    doc.text(`Phone: ${phone}`, 14, y); y += 8;
    doc.text(`Staff ID: ${staffId}`, 14, y); y += 8;
    doc.text(`Temporary Password: ${password}`, 14, y); y += 10;
    doc.setTextColor(75);
    doc.text('Please change this password upon first login.', 14, y); y += 10;
    doc.setTextColor(0);

    if (photo) {
      try {
        // Add profile photo at top-right
        doc.addImage(photo, 'JPEG', 150, 28, 40, 40, undefined, 'FAST');
      } catch {}
    }

    const date = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated: ${date}`, 14, 285);
    doc.save(`${staffId}-credentials.pdf`);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, profilePhoto: 'Photo must be less than 5MB' }));
        return;
      }
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, profilePhoto: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) newErrors.phone = 'Enter a valid phone number (7-15 digits).';
    }
    if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('firstName', formData.firstName.trim());
      fd.append('lastName', formData.lastName.trim());
      fd.append('email', formData.email.trim());
      fd.append('phone', formData.phone.trim());
      if (formData.profilePhoto) fd.append('profilePhoto', formData.profilePhoto);

      const resp = await fetch(`${API_BASE}/vendor/delivery-staff`, {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : '' },
        body: fd,
        credentials: 'include',
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const msg = data?.detail || data?.message || 'Failed to create delivery staff';
        throw new Error(msg);
      }

      const staffId = data?.staff_id || generateStaffId();
      const initialPassword = data?.initial_password || generatePassword();

      // Update UI
      setGeneratedStaffId(staffId);
      setGeneratedPassword(initialPassword);
      setLastCreated({ name: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email.trim() });
      setShowSuccess(true);

      // Generate and download PDF (client-side) using returned credentials
      await generatePdf({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        staffId,
        password: initialPassword,
        photo: photoPreview || null,
      });

      toast.success('Delivery staff created and PDF downloaded.');

      // Refresh list from backend
      await fetchStaffList();

      // Reset form for next entry
      setFormData({ firstName: '', lastName: '', email: '', phone: '', profilePhoto: null });
      setPhotoPreview(null);
      setErrors({});
    } catch (error) {
      console.error('Error creating staff locally:', error);
      setErrors({ submit: error?.message || 'Failed to create staff. Please try again.' });
      toast.error(error?.message || 'Failed to create staff.');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center animate-scaleIn">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-600 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Account Created Successfully!</h2>
          <p className="text-gray-600 mb-6">
            {lastCreated.name || 'Delivery Staff'}'s account credentials have been generated.
            <br />
            <span className="font-medium">Staff ID: {generatedStaffId}</span>
            <br />
            A PDF with login instructions has been downloaded. Share it securely with {lastCreated.email || 'the staff'}.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowSuccess(false)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <FaUserPlus className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Delivery Staff Account</h1>
            <p className="text-sm text-gray-600 mt-1">Add a new delivery person to your team. A PDF with credentials will be generated and the staff will be saved to your account.</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Auto-Generated Info Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaKey className="mr-2 text-purple-600" />
            Auto-Generated Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Staff ID Display */}
            <div className="bg-white rounded-xl p-4 border border-purple-200">
              <label className="block text-xs font-medium text-gray-600 mb-2">Staff ID</label>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">{generatedStaffId || 'Will be generated on create'}</span>
              </div>
            </div>

            {/* Password Display */}
            <div className="bg-white rounded-xl p-4 border border-purple-200">
              <label className="block text-xs font-medium text-gray-600 mb-2">Initial Password</label>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-mono text-gray-900 truncate">{generatedPassword || 'Will be generated on create'}</span>
                {generatedPassword && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="text-purple-600 hover:text-purple-700 transition-colors"
                      title="Copy password"
                    >
                      {passwordCopied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 flex items-center gap-1">
            <FaCheckCircle className="text-green-500" />
            Staff will be required to change password on first login
          </p>
        </div>

        {/* Personal Details Section */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-blue-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUserPlus className="mr-2 text-teal-600" />
            Personal Information
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Photo <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div
                  className={`w-32 h-32 rounded-xl border-2 ${
                    errors.profilePhoto ? 'border-red-300' : 'border-gray-300'
                  } border-dashed bg-gray-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-teal-400 cursor-pointer`}
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FaCamera className="text-gray-400 text-3xl" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a clear photo for identification by customers and for order tracking.
                </p>
                <p className="text-xs text-gray-500">Recommended: Square photo, max 5MB (JPG, PNG)</p>
                {errors.profilePhoto && <p className="text-xs text-red-500 mt-1">{errors.profilePhoto}</p>}
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                placeholder="John"
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                placeholder="john.doe@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            <p className="text-xs text-gray-500 mt-1">Used for login and receiving delivery notifications</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                placeholder="+63 912 345 6789"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            <p className="text-xs text-gray-500 mt-1">For order coordination and customer contact</p>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {errors.submit}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors border border-gray-300 flex items-center gap-2"
          >
            <FaArrowLeft className="text-sm" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <FaUserPlus />
                Create Account & Download PDF
              </>
            )}
          </button>
        </div>
      </form>

      {/* Staff List */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Staff</h2>
          <span className="text-sm text-gray-500">{staffList.length} total</span>
        </div>
        {staffList.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No delivery staff yet. Create one using the form above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-6 py-3">Photo</th>
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-left px-6 py-3">Email</th>
                  <th className="text-left px-6 py-3">Staff ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((s) => (
                  <tr key={s.id || s.staff_id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                        {s.profile_photo_url ? (
                          <img
                            src={`${API_BASE.replace(/\/api$/, '')}${s.profile_photo_url}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">N/A</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-900">{s.full_name || 'Delivery Staff'}</td>
                    <td className="px-6 py-3 text-gray-700">{s.email}</td>
                    <td className="px-6 py-3 font-mono">{s.staff_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverStaff;