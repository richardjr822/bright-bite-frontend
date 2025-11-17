import React, { useState, useMemo, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  FaSearch,
  FaSeedling,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCalendarAlt,
  FaExclamationCircle,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaUsers,
  FaBan,
  FaChevronDown
} from "react-icons/fa";
import UserSidebar from "./studentSidebar";
import { API_BASE } from '../api';

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const displayTime = `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
      options.push({ value: timeValue, label: displayTime });
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    create: {
      bg: "bg-green-500/90",
      icon: <FaPlus className="text-white text-xl" />,
      border: "border-green-400"
    },
    update: {
      bg: "bg-blue-500/90",
      icon: <FaEdit className="text-white text-xl" />,
      border: "border-blue-400"
    },
    delete: {
      bg: "bg-rose-500/90",
      icon: <FaTrash className="text-white text-xl" />,
      border: "border-rose-400"
    },
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
      icon: <FaInfoCircle className="text-white text-xl" />,
      border: "border-blue-400"
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return ReactDOM.createPortal(
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
    </div>,
    document.body
  );
}

const statusBadge = (status) => {
  switch (status) {
    case "Ongoing":
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-md border border-emerald-500/30">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          Ongoing
        </span>
      );
    case "Completed":
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-md border border-indigo-500/30">
          <FaCheckCircle /> Completed
        </span>
      );
    case "Cancelled":
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-rose-500/20 text-rose-400 text-xs font-medium rounded-md border border-rose-500/30">
          <FaBan /> Cancelled
        </span>
      );
    case "Upcoming":
    default:
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-md border border-amber-500/30">
          <FaClock /> Upcoming
        </span>
      );
  }
};

const statusOptions = [
  { value: "all", label: "All Statuses", count: 0 },
  { value: "Upcoming", label: "Upcoming", count: 0 },
  { value: "Ongoing", label: "Ongoing", count: 0 },
  { value: "Completed", label: "Completed", count: 0 },
  { value: "Cancelled", label: "Cancelled", count: 0 }
];

// Status options for creating new events (no Completed/Cancelled)
const createStatusOptions = [
  { value: "Upcoming", label: "Upcoming", icon: <FaClock className="text-amber-400" /> },
  { value: "Ongoing", label: "Ongoing", icon: <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> }
];

// Status options for editing events (all statuses)
const editStatusOptions = [
  { value: "Upcoming", label: "Upcoming", icon: <FaClock className="text-amber-400" /> },
  { value: "Ongoing", label: "Ongoing", icon: <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> },
  { value: "Completed", label: "Completed", icon: <FaCheckCircle className="text-indigo-400" /> },
  { value: "Cancelled", label: "Cancelled", icon: <FaBan className="text-rose-400" /> }
];

// Custom Dropdown Component
function CustomSelect({ value, onChange, options, placeholder, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm text-left flex items-center justify-between hover:bg-gray-700/70 transition-all focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50"
      >
        <span className="flex items-center gap-2">
          {icon && <span className="text-gray-400">{icon}</span>}
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-gray-700/70 transition-colors ${
                value === option.value ? 'bg-green-600/20 text-green-300' : 'text-gray-300'
              }`}
            >
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
              {option.count !== undefined && value === 'all' && option.value !== 'all' && (
                <span className="ml-auto text-xs text-gray-500">({option.count})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgramModal({ show, program, onClose, onEdit, onDelete }) {
  if (!show || !program) return null;
  
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] animate-fadeIn font-['Montserrat'] p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto animate-scaleIn relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <FaTimes />
        </button>
        
        <div className="p-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="bg-green-500/20 p-3 rounded-xl">
              <FaSeedling className="text-green-400 text-2xl" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{program.name}</h2>
              {statusBadge(program.status)}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{program.description || "No description provided"}</p>
            </div>

            {/* Event Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className="text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-400">Event Date</h3>
                </div>
                <p className="text-white font-medium">{formatDate(program.event_date)}</p>
                {program.event_time && (
                  <p className="text-gray-400 text-xs mt-1">{formatTime(program.event_time)}</p>
                )}
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className="text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-400">Location</h3>
                </div>
                <p className="text-white font-medium">{program.location}</p>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-400">Participants</h3>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-lg">{program.beneficiaries_count || 0}</span>
                  {program.max_participants && (
                    <span className="text-gray-400 text-sm"> / {program.max_participants}</span>
                  )}
                </div>
              </div>
              {program.max_participants && (
                <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{ 
                      width: `${Math.min(((program.beneficiaries_count || 0) / program.max_participants) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {(program.contact_person || program.contact_number) && (
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {program.contact_person && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaUser className="text-green-400" />
                      <span className="text-gray-400">Contact Person:</span>
                      <span className="text-white font-medium">{program.contact_person}</span>
                    </div>
                  )}
                  {program.contact_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaPhone className="text-green-400" />
                      <span className="text-gray-400">Phone:</span>
                      <span className="text-white font-medium">{program.contact_number}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Event Countdown/Status */}
            {program.status === "Upcoming" && program.days_until_event !== null && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-300">
                  <FaClock className="text-lg" />
                  <span className="font-semibold">
                    {program.days_until_event === 0 
                      ? "Event is today!" 
                      : `${program.days_until_event} day${program.days_until_event !== 1 ? 's' : ''} until event`
                    }
                  </span>
                </div>
              </div>
            )}

            {program.is_past_event && program.status !== "Completed" && program.status !== "Cancelled" && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-rose-300">
                  <FaExclamationCircle className="text-lg" />
                  <span className="text-sm">This event date has passed. Consider updating the status.</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700/50">
            <button
              onClick={() => onEdit(program)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-green-600/80 hover:bg-green-700 text-white flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <FaEdit /> Edit Event
            </button>
            <button
              onClick={() => onDelete(program)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600/80 hover:bg-rose-700 text-white flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <FaTrash /> Delete Event
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ProgramFormModal({ show, onClose, onSave, initial }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      description: "",
      location: "",
      event_date: "",
      event_time: "",
      status: "Upcoming",
      max_participants: "",
      contact_person: "",
      contact_number: ""
    }
  );
  const [errors, setErrors] = useState({});
  const isEdit = !!initial;

  React.useEffect(() => {
    if (initial) {
      setForm(initial);
      setErrors({});
    } else {
      // Reset form when creating new
      setForm({
        name: "",
        description: "",
        location: "",
        event_date: "",
        event_time: "",
        status: "Upcoming",
        max_participants: "",
        contact_person: "",
        contact_number: ""
      });
      setErrors({});
    }
  }, [initial, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Event name is required";
    }

    if (!form.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!form.event_date) {
      newErrors.event_date = "Event date is required";
    }

    if (form.max_participants && form.max_participants < 1) {
      newErrors.max_participants = "Must be at least 1";
    }

    if (form.contact_number && !/^[\d\s\-\+\(\)]+$/.test(form.contact_number)) {
      newErrors.contact_number = "Invalid phone number format";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(form);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Determine which status options to show
  const statusOptionsToShow = isEdit ? editStatusOptions : createStatusOptions;

  return show
    ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] animate-fadeIn font-['Montserrat'] p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto animate-scaleIn relative">
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 p-6 z-10">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? "Edit Event" : "Create New Event"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {isEdit ? "Update event details" : "Fill in the event information below"}
              </p>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Event Name <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2 bg-gray-700/50 border ${
                    errors.name ? 'border-rose-500' : 'border-gray-600/50'
                  } rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all`}
                  placeholder="e.g., Community Nutrition Workshop"
                />
                {errors.name && (
                  <p className="text-rose-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500/50 resize-none transition-all"
                  placeholder="Brief description of the event..."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <FaMapMarkerAlt className="inline mr-1" />
                  Location <span className="text-rose-400">*</span>
                </label>
                <input
                  required
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className={`w-full px-3 py-2 bg-gray-700/50 border ${
                    errors.location ? 'border-rose-500' : 'border-gray-600/50'
                  } rounded-lg text-white text-sm focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all`}
                  placeholder="e.g., Barangay Hall, Community Center"
                />
                {errors.location && (
                  <p className="text-rose-400 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              {/* Event Date and Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaCalendarAlt className="inline mr-1" />
                    Event Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={getTodayDate()}
                    value={form.event_date || ""}
                    onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))}
                    className={`w-full px-3 py-2 bg-gray-700/50 border ${
                      errors.event_date ? 'border-rose-500' : 'border-gray-600/50'
                    } rounded-lg text-white text-sm transition-all focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50`}
                  />
                  {errors.event_date && (
                    <p className="text-rose-400 text-xs mt-1">{errors.event_date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaClock className="inline mr-1" />
                    Event Time
                  </label>
                  <CustomSelect
                    value={form.event_time}
                    onChange={(val) => setForm(f => ({ ...f, event_time: val }))}
                    options={[{ value: "", label: "Select time (optional)" }, ...TIME_OPTIONS]}
                    placeholder="Select time"
                    icon={<FaClock />}
                  />
                </div>
              </div>

              {/* Status and Max Participants */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status <span className="text-rose-400">*</span>
                  </label>
                  <CustomSelect
                    value={form.status}
                    onChange={(val) => setForm(f => ({ ...f, status: val }))}
                    options={statusOptionsToShow}
                    placeholder="Select status"
                  />
                  {!isEdit && (
                    <p className="text-xs text-gray-500 mt-1">
                      New events can only be Upcoming or Ongoing
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    <FaUsers className="inline mr-1" />
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.max_participants || ""}
                    onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))}
                    className={`w-full px-3 py-2 bg-gray-700/50 border ${
                      errors.max_participants ? 'border-rose-500' : 'border-gray-600/50'
                    } rounded-lg text-white text-sm transition-all focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50`}
                    placeholder="Unlimited"
                  />
                  {errors.max_participants && (
                    <p className="text-rose-400 text-xs mt-1">{errors.max_participants}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Contact Information (Optional)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      <FaUser className="inline mr-1" />
                      Contact Person
                    </label>
                    <input
                      value={form.contact_person || ""}
                      onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm transition-all focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50"
                      placeholder="e.g., Juan Dela Cruz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      <FaPhone className="inline mr-1" />
                      Contact Number
                    </label>
                    <input
                      value={form.contact_number || ""}
                      onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))}
                      className={`w-full px-3 py-2 bg-gray-700/50 border ${
                        errors.contact_number ? 'border-rose-500' : 'border-gray-600/50'
                      } rounded-lg text-white text-sm transition-all focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50`}
                      placeholder="e.g., 0917-123-4567"
                    />
                    {errors.contact_number && (
                      <p className="text-rose-400 text-xs mt-1">{errors.contact_number}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                  <FaInfoCircle className="inline mr-1" />
                  <strong>Note:</strong> Participant count is automatically tracked from enrolled beneficiaries.
                  Days until event are calculated automatically.
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-gray-900/95 backdrop-blur-md pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-gray-700/50 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600/50 transition-colors border border-gray-600/50 hover:border-gray-500/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600/80 to-green-700/80 text-white text-sm font-medium rounded-lg hover:from-green-600/90 hover:to-green-700/90 transition-colors border border-green-500/50"
                >
                  {isEdit ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )
    : null;
}

function DeleteModal({ show, program, onCancel, onConfirm }) {
  if (!show || !program) return null;
  
  const hasBeneficiaries = program.beneficiaries_count > 0;
  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] animate-fadeIn font-['Montserrat'] p-4">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl w-full max-w-md animate-scaleIn relative">
        <div className="p-6">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-500/20 p-3 rounded-xl">
              <FaTrash className="text-rose-400 text-xl" />
            </div>
            <h2 className="text-xl font-bold text-white">Delete Event</h2>
          </div>
          
          <p className="text-gray-300 mb-2 text-sm">Are you sure you want to delete:</p>
          <p className="text-white font-semibold mb-4">{program.name}</p>
          
          {hasBeneficiaries && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mb-4">
              <p className="text-rose-300 text-xs flex items-start gap-2">
                <FaExclamationCircle className="text-base mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Warning:</strong> This event has {program.beneficiaries_count} enrolled participant{program.beneficiaries_count !== 1 ? 's' : ''}. 
                  You must remove all participants before deleting this event.
                </span>
              </p>
            </div>
          )}
          
          {!hasBeneficiaries && (
            <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 bg-gray-700/50 text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-600/50 transition-colors border border-gray-600/50 hover:border-gray-500/50"
            >
              Cancel
            </button>
            {!hasBeneficiaries && (
              <button
                onClick={onConfirm}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600/80 to-rose-700/80 text-white text-sm font-medium rounded-lg hover:from-rose-700/80 hover:to-rose-800/80 transition-colors border border-rose-700/50"
              >
                Yes, Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editProgram, setEditProgram] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/programs`);
      if (!response.ok) {
        throw new Error('Failed to fetch programs');
      }
      const data = await response.json();
      console.log("Fetched programs:", data);
      setPrograms(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching programs:", err);
      showToast("Failed to load programs", "error");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: programs.length,
      Upcoming: 0,
      Ongoing: 0,
      Completed: 0,
      Cancelled: 0
    };
    programs.forEach(p => {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    });
    return counts;
  }, [programs]);

  // Update status options with counts
  const statusOptionsWithCounts = useMemo(() => {
    return statusOptions.map(opt => ({
      ...opt,
      count: statusCounts[opt.value],
      label: opt.value === 'all' ? `All Statuses (${statusCounts.all})` : `${opt.label} (${statusCounts[opt.value]})`
    }));
  }, [statusCounts]);

  const filteredPrograms = useMemo(() => {
    const s = search.toLowerCase();
    return programs.filter(
      (p) =>
        (status === "all" || p.status === status) &&
        (p.name.toLowerCase().includes(s) ||
          (p.description && p.description.toLowerCase().includes(s)) ||
          (p.location && p.location.toLowerCase().includes(s)))
    );
  }, [search, programs, status]);

  const handleAdd = () => {
    setEditProgram(null);
    setShowForm(true);
  };

  const handleEdit = (program) => {
    setEditProgram(program);
    setShowForm(true);
    setShowModal(false);
  };

  const handleSave = async (form) => {
    try {
      console.log("Saving program:", form);
      
      const duplicateName = programs.find(
        p => p.name.toLowerCase() === form.name.toLowerCase() && 
        (!editProgram || p.id !== editProgram.id)
      );
      
      if (duplicateName) {
        showToast("An event with this name already exists", "error");
        return;
      }
      
      const payload = {
        name: form.name,
        description: form.description || "",
        location: form.location,
        event_date: form.event_date,
        event_time: form.event_time || null,
        status: form.status,
        max_participants: form.max_participants ? parseInt(form.max_participants) : null,
        contact_person: form.contact_person || null,
        contact_number: form.contact_number || null
      };

      console.log("Payload to send:", payload);

      let response;
      if (editProgram) {
        console.log("Updating program:", editProgram.id);
        response = await fetch(`${API_BASE}/programs/${editProgram.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        console.log("Creating new program");
        response = await fetch(`${API_BASE}/programs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.detail || `Failed to ${editProgram ? 'update' : 'add'} event`);
      }
      
      const result = await response.json();
      console.log("Success result:", result);
      
      await fetchPrograms();
      setShowForm(false);
      setEditProgram(null);
      
      if (editProgram) {
        showToast(`Event "${form.name}" updated successfully!`, "update");
      } else {
        showToast(`Event "${form.name}" created successfully!`, "create");
      }
    } catch (err) {
      console.error("Error saving program:", err);
      showToast(err.message || "Failed to save event", "error");
    }
  };

  const handleDelete = (program) => {
    setSelectedProgram(program);
    setShowDelete(true);
    setShowModal(false);
  };

  const confirmDelete = async () => {
    if (selectedProgram) {
      try {
        console.log("Deleting program:", selectedProgram.id);
        const response = await fetch(`${API_BASE}/programs/${selectedProgram.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete event');
        }
        
        console.log("Program deleted successfully");
        const deletedName = selectedProgram.name;
        await fetchPrograms();
        setShowDelete(false);
        setSelectedProgram(null);
        
        showToast(`Event "${deletedName}" deleted successfully!`, "delete");
      } catch (err) {
        console.error("Error deleting program:", err);
        showToast(err.message || "Failed to delete event", "error");
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
      
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      <div className="transition-all duration-500 flex-shrink-0 z-[999999] relative">
        <UserSidebar />
      </div>
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-2.5 rounded-lg mr-3">
                <FaSeedling className="text-green-300 h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-white">Events & Programs</h1>
                <p className="text-sm text-gray-400">Manage nutrition program events</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="w-full md:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search events..."
                    className="block w-full pl-10 pr-3 py-2.5 bg-gray-800/40 border border-gray-700/40 rounded-lg text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="w-48">
                <CustomSelect
                  value={status}
                  onChange={setStatus}
                  options={statusOptionsWithCounts}
                  placeholder="Filter by status"
                />
              </div>
              <button
                onClick={handleAdd}
                className="flex items-center px-4 py-2 bg-green-600/90 hover:bg-green-700 text-white rounded-lg border border-green-600 text-sm font-medium transition-colors whitespace-nowrap shadow-lg"
              >
                <FaPlus className="mr-2" />
                New Event
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="mt-4">Loading events...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <div
                  key={program.id}
                  className="bg-gray-800/50 rounded-xl border border-gray-700/40 p-6 shadow-lg hover:border-green-500/40 hover:shadow-green-500/10 transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedProgram(program);
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500/20 p-2 rounded-lg">
                        <FaSeedling className="text-green-400 text-lg" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                          {program.name}
                        </h2>
                      </div>
                    </div>
                    {statusBadge(program.status)}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {program.description || "No description"}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaCalendarAlt className="text-green-400" />
                      <span>{formatDate(program.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <FaMapMarkerAlt className="text-green-400" />
                      <span className="truncate">{program.location}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                      <div className="flex items-center gap-2 text-gray-400">
                        <FaUsers className="text-green-400" />
                        <span>{program.beneficiaries_count || 0} participant{(program.beneficiaries_count || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      {program.max_participants && (
                        <span className="text-xs text-gray-500">/ {program.max_participants} max</span>
                      )}
                    </div>
                  </div>
                  
                  {program.status === "Upcoming" && program.days_until_event !== null && (
                    <div className="mt-3 pt-3 border-t border-gray-700/50">
                      <div className="text-xs text-amber-300 flex items-center gap-1">
                        <FaClock />
                        <span>
                          {program.days_until_event === 0 
                            ? "Today!" 
                            : `In ${program.days_until_event} day${program.days_until_event !== 1 ? 's' : ''}`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredPrograms.length === 0 && (
                <div className="col-span-full text-center py-20 border border-dashed border-gray-700/50 rounded-xl">
                  <FaInfoCircle className="text-gray-500 text-4xl mx-auto mb-3" />
                  <p className="text-gray-400">No events found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
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
      
      <ProgramModal
        show={showModal}
        program={selectedProgram}
        onClose={() => setShowModal(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      
      <ProgramFormModal
        show={showForm}
        onClose={() => {
          setShowForm(false);
          setEditProgram(null);
        }}
        onSave={handleSave}
        initial={editProgram}
      />
      
      <DeleteModal
        show={showDelete}
        program={selectedProgram}
        onCancel={() => setShowDelete(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Programs;