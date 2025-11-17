import React, { useState, useEffect, useCallback, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import { 
  FaSearch, 
  FaUserPlus, 
  FaFilter, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash, 
  FaUserCircle,
  FaUsers,
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaCheck,
  FaChevronDown,
  FaExclamationCircle,
  FaWeight,
  FaRulerVertical,
  FaHeart,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt
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
    create: {
      bg: "bg-green-500/90",
      icon: <FaUserPlus className="text-white text-xl" />,
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

// Form Modal Component
const FormModal = ({ show, onClose, onSubmit, isEdit = false, formData, handleInputChange, programs }) => {
  if (!show) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100000] animate-fadeIn font-['Montserrat'] p-4">
      <div 
        className="bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-3 rounded-xl shadow-lg">
                {isEdit ? <FaEdit className="text-xl" /> : <FaUserPlus className="text-xl" />}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {isEdit ? 'Edit Beneficiary' : 'Add New Beneficiary'}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {isEdit ? 'Update beneficiary information' : 'Fill in the details to add a new beneficiary'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <form onSubmit={onSubmit} className="px-8 py-6">
          {/* Personal Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaUserCircle className="text-green-400 text-lg" />
              <h4 className="text-lg font-semibold text-white">Personal Information</h4>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="Juan"
                />
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="Dela Cruz"
                />
              </div>
              
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">
                  Age <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="25"
                />
              </div>
              
              {/* Age Group (Auto-calculated) */}
              <div>
                <label htmlFor="ageGroup" className="block text-sm font-medium text-gray-300 mb-2">
                  Age Group <span className="text-xs text-gray-500">(Auto)</span>
                </label>
                <input
                  type="text"
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-lg text-gray-400 cursor-not-allowed"
                  placeholder="--"
                />
              </div>
              
              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300 mb-2">
                  Gender <span className="text-rose-400">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Program */}
              <div>
                <label htmlFor="programId" className="block text-sm font-medium text-gray-300 mb-2">
                  Program
                </label>
                <select
                  id="programId"
                  name="programId"
                  value={formData.programId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Registration Date */}
              <div className="md:col-span-2">
                <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <FaCalendarAlt className="text-xs text-gray-500" />
                  Registration Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  id="registrationDate"
                  name="registrationDate"
                  required
                  value={formData.registrationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaPhone className="text-green-400 text-lg" />
              <h4 className="text-lg font-semibold text-white">Contact Information</h4>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contact Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <FaPhone className="text-xs text-gray-500" />
                  Contact Number
                </label>
                <input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="09123456789"
                />
              </div>
              
              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-xs text-gray-500" />
                  Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="123 Main St, Manila"
                />
              </div>
            </div>
          </div>

          {/* Health Metrics Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaHeart className="text-green-400 text-lg" />
              <h4 className="text-lg font-semibold text-white">Health Metrics</h4>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Height */}
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <FaRulerVertical className="text-xs text-gray-500" />
                  Height (cm) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  required
                  min="0"
                  step="0.1"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="170"
                />
              </div>
              
              {/* Weight */}
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                  <FaWeight className="text-xs text-gray-500" />
                  Weight (kg) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  required
                  min="0"
                  step="0.1"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="70"
                />
              </div>
              
              {/* BMI (Auto-calculated) */}
              <div>
                <label htmlFor="bmi" className="block text-sm font-medium text-gray-300 mb-2">
                  BMI <span className="text-xs text-gray-500">(Auto)</span>
                </label>
                <input
                  type="text"
                  id="bmi"
                  name="bmi"
                  value={formData.bmi}
                  readOnly
                  className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-lg text-gray-400 cursor-not-allowed"
                  placeholder="--"
                />
              </div>
              
              {/* Weight Status (Auto-calculated) */}
              <div>
                <label htmlFor="weightStatus" className="block text-sm font-medium text-gray-300 mb-2">
                  Weight Status <span className="text-xs text-gray-500">(Auto)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="weightStatus"
                    name="weightStatus"
                    value={formData.weightStatus}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-lg cursor-not-allowed font-medium"
                    placeholder="--"
                    style={{
                      color: formData.weightStatus === 'Underweight' ? '#60a5fa' :
                             formData.weightStatus === 'Normal' ? '#34d399' :
                             formData.weightStatus === 'Overweight' ? '#fbbf24' :
                             formData.weightStatus === 'Obese' ? '#f87171' : '#9ca3af'
                    }}
                  />
                  {formData.weightStatus && (
                    <div 
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: formData.weightStatus === 'Underweight' ? '#60a5fa' :
                                       formData.weightStatus === 'Normal' ? '#34d399' :
                                       formData.weightStatus === 'Overweight' ? '#fbbf24' :
                                       formData.weightStatus === 'Obese' ? '#f87171' : '#9ca3af'
                      }}
                    ></div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaInfoCircle className="text-green-400 text-lg" />
              <h4 className="text-lg font-semibold text-white">Additional Information</h4>
            </div>
            <div className="h-px bg-gradient-to-r from-green-500/50 via-green-500/20 to-transparent mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dietary Restrictions */}
              <div>
                <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-300 mb-2">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., Gluten-free, Vegan"
                />
              </div>
              
              {/* Health Conditions */}
              <div>
                <label htmlFor="healthConditions" className="block text-sm font-medium text-gray-300 mb-2">
                  Health Conditions
                </label>
                <input
                  type="text"
                  id="healthConditions"
                  name="healthConditions"
                  value={formData.healthConditions}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 hover:border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
                  placeholder="e.g., Diabetes, Asthma"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 backdrop-blur-sm mb-6">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300 leading-relaxed">
                <p className="mb-1">
                  <strong>Note:</strong> Age group, BMI, and weight status are automatically calculated based on your inputs.
                </p>
                <p className="text-xs text-blue-400">
                  <span className="text-rose-400">*</span> Required fields must be filled in to add or update a beneficiary.
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-gradient-to-t from-gray-800/95 via-gray-800/95 to-transparent pt-6 pb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent mb-6"></div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white text-sm font-semibold rounded-lg shadow-lg transition-all duration-300 border border-gray-600/50 hover:border-gray-500/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {isEdit ? 'Save Changes' : 'Add Beneficiary'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState(null);
  const [beneficiaryToEdit, setBeneficiaryToEdit] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'first_name', direction: 'ascending' });
  const [mounted, setMounted] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    ageGroup: "",
    gender: "",
    height: "",
    weight: "",
    bmi: "",
    weightStatus: "",
    programId: "",
    address: "",
    contactNumber: "",
    registrationDate: new Date().toISOString().split('T')[0],
    dietaryRestrictions: "",
    healthConditions: ""
  });

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API_BASE}/programs`);
        if (!response.ok) {
          throw new Error('Failed to fetch programs');
        }
        const data = await response.json();
        setPrograms(data);
      } catch (err) {
        console.error("Error fetching programs:", err);
      }
    };

    const fetchBeneficiaries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/beneficiaries`);
        if (!response.ok) {
          throw new Error('Failed to fetch beneficiaries');
        }
        const data = await response.json();
        setBeneficiaries(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching beneficiaries:", err);
        setToast({ message: "Failed to load beneficiaries", type: "error" });
        setLoading(false);
      }
    };

    fetchPrograms();
    fetchBeneficiaries();
  }, []);

  const refreshBeneficiaries = async () => {
    try {
      const response = await fetch(`${API_BASE}/beneficiaries`);
      if (!response.ok) {
        throw new Error('Failed to fetch beneficiaries');
      }
      const data = await response.json();
      setBeneficiaries(data);
    } catch (err) {
      console.error("Error fetching beneficiaries:", err);
      setToast({ message: "Failed to refresh beneficiaries", type: "error" });
    }
  };

  const calculateAgeGroup = (age) => {
    const ageNum = parseInt(age);
    if (ageNum < 5) return "Infant (0-4)";
    if (ageNum < 13) return "Child (5-12)";
    if (ageNum < 18) return "Teen (13-17)";
    if (ageNum < 60) return "Adult (18-59)";
    return "Senior (60+)";
  };

  const calculateBMI = (height, weight) => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return { bmi: "", status: "" };
    
    const heightM = h / 100;
    const bmi = (w / (heightM * heightM)).toFixed(1);
    
    let status = "";
    if (bmi < 18.5) status = "Underweight";
    else if (bmi < 25) status = "Normal";
    else if (bmi < 30) status = "Overweight";
    else status = "Obese";
    
    return { bmi, status };
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedBeneficiaries = React.useMemo(() => {
    let sortableBeneficiaries = [...beneficiaries];
    if (sortConfig.key) {
      sortableBeneficiaries.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBeneficiaries;
  }, [beneficiaries, sortConfig]);

  const filteredBeneficiaries = React.useMemo(() => {
    return sortedBeneficiaries.filter(beneficiary => {
      const fullName = `${beneficiary.first_name} ${beneficiary.last_name}`.toLowerCase();
      const matchesSearch = 
        beneficiary.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase()) ||
        beneficiary.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiary.contact_number?.includes(searchTerm);
      
      const matchesProgram = selectedProgram === 'all' || beneficiary.program_id === selectedProgram;
      
      return matchesSearch && matchesProgram;
    });
  }, [sortedBeneficiaries, searchTerm, selectedProgram]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBeneficiaries = filteredBeneficiaries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBeneficiaries.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'age' && value) {
        updated.ageGroup = calculateAgeGroup(value);
      }
      if (name === 'height' || name === 'weight') {
        const height = name === 'height' ? value : prev.height;
        const weight = name === 'weight' ? value : prev.weight;
        const { bmi, status } = calculateBMI(height, weight);
        updated.bmi = bmi;
        updated.weightStatus = status;
      }
      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      age: "",
      ageGroup: "",
      gender: "",
      height: "",
      weight: "",
      bmi: "",
      weightStatus: "",
      programId: "",
      address: "",
      contactNumber: "",
      registrationDate: new Date().toISOString().split('T')[0],
      dietaryRestrictions: "",
      healthConditions: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/beneficiaries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: formData.programId || null,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: formData.age ? Number(formData.age) : null,
          age_group: formData.ageGroup || null,
          gender: formData.gender || null,
          height: formData.height ? Number(formData.height) : null,
          weight: formData.weight ? Number(formData.weight) : null,
          bmi: formData.bmi ? Number(formData.bmi) : null,
          weight_status: formData.weightStatus || null,
          address: formData.address || null,
          contact_number: formData.contactNumber || null,
          registration_date: formData.registrationDate || null,
          dietary_restrictions: formData.dietaryRestrictions || null,
          health_conditions: formData.healthConditions || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add beneficiary');
      }
      
      await refreshBeneficiaries();
      setShowAddModal(false);
      resetForm();
      showToast(`Beneficiary "${formData.firstName} ${formData.lastName}" added successfully!`, "create");
    } catch (err) {
      console.error("Error adding beneficiary:", err);
      showToast(err.message || "Failed to add beneficiary", "error");
    }
  };

  const handleEdit = (beneficiary) => {
    setBeneficiaryToEdit(beneficiary);
    setFormData({
      firstName: beneficiary.first_name,
      lastName: beneficiary.last_name,
      age: beneficiary.age?.toString() || "",
      ageGroup: beneficiary.age_group || "",
      gender: beneficiary.gender || "",
      height: beneficiary.height?.toString() || "",
      weight: beneficiary.weight?.toString() || "",
      bmi: beneficiary.bmi?.toString() || "",
      weightStatus: beneficiary.weight_status || "",
      programId: beneficiary.program_id || "",
      address: beneficiary.address || "",
      contactNumber: beneficiary.contact_number || "",
      registrationDate: beneficiary.registration_date || new Date().toISOString().split('T')[0],
      dietaryRestrictions: beneficiary.dietary_restrictions || "",
      healthConditions: beneficiary.health_conditions || ""
    });
    setShowEditModal(true);
    setShowViewModal(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/beneficiaries/${beneficiaryToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: formData.programId || null,
          first_name: formData.firstName,
          last_name: formData.lastName,
          age: formData.age ? Number(formData.age) : null,
          age_group: formData.ageGroup || null,
          gender: formData.gender || null,
          height: formData.height ? Number(formData.height) : null,
          weight: formData.weight ? Number(formData.weight) : null,
          bmi: formData.bmi ? Number(formData.bmi) : null,
          weight_status: formData.weightStatus || null,
          address: formData.address || null,
          contact_number: formData.contactNumber || null,
          registration_date: formData.registrationDate || null,
          dietary_restrictions: formData.dietaryRestrictions || null,
          health_conditions: formData.healthConditions || null,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update beneficiary');
      }
      
      await refreshBeneficiaries();
      setShowEditModal(false);
      setBeneficiaryToEdit(null);
      resetForm();
      showToast(`Beneficiary "${formData.firstName} ${formData.lastName}" updated successfully!`, "update");
    } catch (err) {
      console.error("Error updating beneficiary:", err);
      showToast(err.message || "Failed to update beneficiary", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (beneficiaryToDelete) {
      try {
        const response = await fetch(`${API_BASE}/beneficiaries/${beneficiaryToDelete.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete beneficiary');
        }
        
        const deletedName = `${beneficiaryToDelete.first_name} ${beneficiaryToDelete.last_name}`;
        await refreshBeneficiaries();
        setShowDeleteModal(false);
        setBeneficiaryToDelete(null);
        showToast(`Beneficiary "${deletedName}" deleted successfully!`, "delete");
      } catch (err) {
        console.error("Error deleting beneficiary:", err);
        showToast(err.message || "Failed to delete beneficiary", "error");
      }
    }
  };

  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program?.name || "No Program";
  };

  const getProgramBadge = (programId) => {
    const programName = getProgramName(programId);
    const program = programs.find(p => p.id === programId);
    const color = program?.color || 'gray';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-${color}-500/20 text-${color}-300 border border-${color}-500/20`}>
        {programName}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const programCounts = React.useMemo(() => {
    const c = {};
    beneficiaries.forEach(b => { 
      const key = b.program_id || 'none';
      c[key] = (c[key] || 0) + 1; 
    });
    return c;
  }, [beneficiaries]);

  const DropdownFilter = ({
    label,
    value,
    onChange,
    options,
    renderOptionIcon
  }) => {
    const [open, setOpen] = useState(false);
    const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
    const wrapperRef = React.useRef(null);
    const btnRef = React.useRef(null);
    const portalAttr = 'data-dropdown-portal';

    useEffect(() => {
      if (!open) return;
      const handler = (e) => {
        if (
          wrapperRef.current &&
          (wrapperRef.current.contains(e.target) || e.target.closest(`[${portalAttr}]`))
        ) {
          return;
        }
        setOpen(false);
      };
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }, [open]);

    useLayoutEffect(() => {
      if (!open || !btnRef.current) return;
      const place = () => {
        const rect = btnRef.current.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const menuMaxHeight = 320;
        const spaceBelow = viewportH - rect.bottom;
        const openUpwards = spaceBelow < 180 && rect.top > spaceBelow;
        setMenuStyle({
          top: (openUpwards ? rect.top - Math.min(menuMaxHeight, rect.top - 12) - 8 : rect.bottom + 8) + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          origin: openUpwards ? 'bottom' : 'top',
          maxHeight: openUpwards ? Math.min(menuMaxHeight, rect.top - 20) : Math.min(menuMaxHeight, spaceBelow - 20)
        });
      };
      place();
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
      return () => {
        window.removeEventListener("resize", place);
        window.removeEventListener("scroll", place, true);
      };
    }, [open]);

    const activeOption = options.find(o => o.value === value);

    const menu = open ? ReactDOM.createPortal(
      <div
        style={{
          position: 'fixed',
          top: menuStyle.top,
          left: menuStyle.left,
          width: menuStyle.width,
          zIndex: 10000
        }}
        {...{ [portalAttr]: 'true' }}
      >
        <div
          className={`bg-gray-800/95 backdrop-blur-md rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden
            ${menuStyle.origin === 'bottom' ? 'origin-bottom animate-scaleIn' : 'origin-top animate-scaleIn'}`}
          style={{ maxHeight: menuStyle.maxHeight || 320 }}
        >
          <ul className="overflow-auto text-sm py-1.5">
            {options.map(opt => {
              const selected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-all duration-200 ${
                      selected 
                        ? 'bg-green-600/20 text-green-300 border-l-2 border-green-500' 
                        : 'text-gray-300 hover:bg-gray-700/40 hover:text-white border-l-2 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {renderOptionIcon && renderOptionIcon(opt)}
                      <span className="font-medium">{opt.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {opt.count !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                          selected 
                            ? 'bg-green-500/20 text-green-200 border border-green-500/30' 
                            : 'bg-gray-700/60 text-gray-400'
                        }`}>
                          {opt.count}
                        </span>
                      )}
                      {selected && (
                        <FaCheck className="text-green-400 h-3.5 w-3.5 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>,
      document.body
    ) : null;

    return (
      <div className="relative z-30" ref={wrapperRef}>
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`w-full px-4 py-2.5 bg-gray-800/40 backdrop-blur-sm border rounded-xl text-left flex items-center justify-between transition-all duration-200 ${
            open 
              ? 'border-green-500/50 ring-2 ring-green-500/20 bg-gray-800/60' 
              : 'border-gray-700/40 hover:border-gray-600/60 hover:bg-gray-800/60'
          }`}
        >
          <span className="flex items-center gap-2.5 text-sm">
            <FaFilter className={`text-xs transition-colors ${open ? 'text-green-400' : 'text-gray-500'}`} />
            {renderOptionIcon && renderOptionIcon(activeOption)}
            <span className={`font-medium ${open ? 'text-white' : 'text-gray-300'}`}>
              {activeOption ? activeOption.label : label}
            </span>
            {activeOption && activeOption.count !== undefined && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 font-medium">
                {activeOption.count}
              </span>
            )}
          </span>
          <FaChevronDown className={`h-3.5 w-3.5 transition-all duration-200 ${
            open ? 'rotate-180 text-green-400' : 'text-gray-500'
          }`} />
        </button>
        {menu}
      </div>
    )
  };
  

  const programOptions = [
    { value: 'all', label: 'All Programs', count: beneficiaries.length },
    ...programs.map(prog => ({
      value: prog.id,
      label: prog.name,
      count: programCounts[prog.id] || 0,
      color: prog.color
    }))
  ];

  const renderProgramIcon = (opt) => {
    const base = "w-3 h-3 rounded-full shadow-sm";
    if (opt.value === 'all') return <span className={`${base} bg-gray-400`} />;
    const color = opt.color || 'gray';
    return <span className={`${base} bg-${color}-400`} />;
  };

  const BeneficiariesContent = () => (
    <div className="h-full overflow-visible flex flex-col">
      <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="bg-green-500/20 p-2.5 rounded-lg mr-3">
              <FaUsers className="text-green-300 h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white">Beneficiaries</h1>
              <p className="text-sm text-gray-400">Manage program participants</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center px-4 py-2 bg-green-600/90 hover:bg-green-700 text-white rounded-lg border border-green-600 text-sm font-medium transition-colors"
            >
              <FaUserPlus className="mr-2 text-white" />
              Add Beneficiary
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-green-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-2.5 bg-gray-800/40 backdrop-blur-sm border border-gray-700/40 rounded-xl text-gray-300 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all duration-200"
                placeholder="Search beneficiaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <DropdownFilter
              label="Programs"
              value={selectedProgram}
              onChange={setSelectedProgram}
              options={programOptions}
              renderOptionIcon={renderProgramIcon}
            />
          </div>
        </div>
      </div>

      <div className={`flex justify-between items-center mb-4 text-sm text-gray-400 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '100ms' }}>
        <div>
          Showing <span className="text-white font-medium">{filteredBeneficiaries.length}</span> beneficiaries
          {searchTerm && <span> matching "<span className="text-green-300">{searchTerm}</span>"</span>}
        </div>
        <div>
          Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages || 1}</span>
        </div>
      </div>

      <div className={`flex-1 overflow-auto rounded-xl border border-gray-700/40 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
        <table className="min-w-full divide-y divide-gray-700/40">
          <thead className="bg-gray-800/40 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('first_name')}
              >
                <div className="flex items-center">
                  Name
                  {sortConfig.key === 'first_name' ? (
                    sortConfig.direction === 'ascending' ? (
                      <FaSortUp className="ml-1 text-green-400" />
                    ) : (
                      <FaSortDown className="ml-1 text-green-400" />
                    )
                  ) : (
                    <FaSort className="ml-1 text-gray-600" />
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('age')}
              >
                <div className="flex items-center">
                  Age
                  {sortConfig.key === 'age' ? (
                    sortConfig.direction === 'ascending' ? (
                      <FaSortUp className="ml-1 text-green-400" />
                    ) : (
                      <FaSortDown className="ml-1 text-green-400" />
                    )
                  ) : (
                    <FaSort className="ml-1 text-gray-600" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Program
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('registration_date')}
              >
                <div className="flex items-center">
                  Registered
                  {sortConfig.key === 'registration_date' ? (
                    sortConfig.direction === 'ascending' ? (
                      <FaSortUp className="ml-1 text-green-400" />
                    ) : (
                      <FaSortDown className="ml-1 text-green-400" />
                    )
                  ) : (
                    <FaSort className="ml-1 text-gray-600" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/20 backdrop-blur-sm divide-y divide-gray-700/40">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                  Loading beneficiaries...
                </td>
              </tr>
            ) : currentBeneficiaries.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <FaInfoCircle className="h-8 w-8 text-green-500 mb-4" />
                    <p className="text-lg text-gray-300 font-medium">No beneficiaries found</p>
                    <p className="text-gray-500 mt-1 text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentBeneficiaries.map((beneficiary) => (
                <tr
                  key={beneficiary.id}
                  className="hover:bg-gray-700/20 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedBeneficiary(beneficiary);
                    setShowViewModal(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{beneficiary.first_name} {beneficiary.last_name}</div>
                      <div className="text-xs text-gray-400">{beneficiary.contact_number || "No contact"}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{beneficiary.age || "N/A"}</div>
                    <div className="text-xs text-gray-400">{beneficiary.gender || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getProgramBadge(beneficiary.program_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(beneficiary.registration_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        className="text-green-500 hover:text-green-400 transition-colors"
                        title="Edit"
                        onClick={e => { 
                          e.stopPropagation(); 
                          handleEdit(beneficiary);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-rose-400 hover:text-rose-300 transition-colors"
                        title="Delete"
                        onClick={e => {
                          e.stopPropagation();
                          setBeneficiaryToDelete(beneficiary);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredBeneficiaries.length > 0 && (
        <div className={`flex items-center justify-between mt-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
              currentPage === 1
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-green-500 hover:text-white hover:bg-green-700/40'
            } transition-colors`}
          >
            <FaChevronLeft className="h-3 w-3" />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  currentPage === number
                    ? 'bg-green-600/80 text-white border border-green-600'
                    : 'text-gray-400 hover:bg-green-700/40 hover:text-white'
                } transition-colors`}
              >
                {number}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
              currentPage === totalPages
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-green-500 hover:text-white hover:bg-green-700/40'
            } transition-colors`}
          >
            <span>Next</span>
            <FaChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {showViewModal && selectedBeneficiary && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/70 backdrop-blur-md transition-all font-['Montserrat'] p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-8 md:p-10 relative animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
              onClick={() => setShowViewModal(false)}
            >
              <FaTimes className="text-lg" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-700/30">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/30 flex-shrink-0">
                <FaUsers className="text-green-400 text-4xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedBeneficiary.first_name} {selectedBeneficiary.last_name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {getProgramBadge(selectedBeneficiary.program_id)}
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-400">ID: #{selectedBeneficiary.id}</span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaUserCircle className="text-base" />
                  Personal Information
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">Gender</span>
                    <span className="text-sm text-white font-medium">{selectedBeneficiary.gender || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">Age</span>
                    <span className="text-sm text-white font-medium">{selectedBeneficiary.age || "N/A"} years</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">Age Group</span>
                    <span className="text-sm text-white font-medium">{selectedBeneficiary.age_group || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">Contact</span>
                    <span className="text-sm text-white font-medium">{selectedBeneficiary.contact_number || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm font-medium text-gray-400">Address</span>
                    <span className="text-sm text-white font-medium text-right max-w-[60%]">{selectedBeneficiary.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Health Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-base" />
                  Health Metrics
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">Height</span>
                    <span className="text-sm text-white font-medium">
                      {selectedBeneficiary.height ? `${selectedBeneficiary.height} cm` : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">Weight</span>
                    <span className="text-sm text-white font-medium">
                      {selectedBeneficiary.weight ? `${selectedBeneficiary.weight} kg` : "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">BMI</span>
                    <span className="text-sm text-white font-medium">{selectedBeneficiary.bmi || "N/A"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-700/20">
                    <span className="text-sm font-medium text-gray-400">Weight Status</span>
                    <span className={`text-sm font-bold ${
                      selectedBeneficiary.weight_status === 'Underweight' ? 'text-blue-400' :
                      selectedBeneficiary.weight_status === 'Normal' ? 'text-green-400' :
                      selectedBeneficiary.weight_status === 'Overweight' ? 'text-yellow-400' :
                      selectedBeneficiary.weight_status === 'Obese' ? 'text-rose-400' : 'text-gray-400'
                    }`}>
                      {selectedBeneficiary.weight_status || "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-400">Registered</span>
                    <span className="text-sm text-white font-medium">{formatDate(selectedBeneficiary.registration_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(selectedBeneficiary.dietary_restrictions || selectedBeneficiary.health_conditions) && (
              <div className="space-y-4 mb-8 p-4 bg-gray-700/20 rounded-lg border border-gray-700/30">
                <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3">
                  Additional Notes
                </h3>
                
                {selectedBeneficiary.dietary_restrictions && (
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Dietary Restrictions</span>
                    <p className="text-sm text-white mt-1">{selectedBeneficiary.dietary_restrictions}</p>
                  </div>
                )}
                
                {selectedBeneficiary.health_conditions && (
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Health Conditions</span>
                    <p className="text-sm text-white mt-1">{selectedBeneficiary.health_conditions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-700/30">
              <button
                onClick={() => {
                  handleEdit(selectedBeneficiary);
                }}
                className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-green-500/20"
              >
                <FaEdit className="text-base" /> Edit Beneficiary
              </button>
              <button
                onClick={() => {
                  setBeneficiaryToDelete(selectedBeneficiary);
                  setShowDeleteModal(true);
                  setShowViewModal(false);
                }}
                className="flex-1 px-5 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-rose-500/20"
              >
                <FaTrash className="text-base" /> Delete Beneficiary
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );

  return (
    <div className="relative font-['Montserrat'] overflow-hidden">
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
      
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>
        <div className="absolute top-20 right-0 w-1/3 h-1/3 bg-green-900/20 rounded-full mix-blend-screen filter blur-3xl opacity-40"></div>
        <div className="absolute bottom-10 left-0 w-1/4 h-1/4 bg-green-800/20 rounded-full mix-blend-screen filter blur-2xl opacity-40"></div>
      </div>

      <div className="flex min-h-screen h-screen w-full">
        <div 
          className={`transition-all duration-500 flex-shrink-0 ${
            mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
          } ${
            showAddModal || showEditModal || showDeleteModal || showViewModal 
              ? 'blur-sm pointer-events-none' 
              : ''
          } z-[999] relative`}
        >
          <UserSidebar />
        </div>

        <main 
          className={`flex-1 transition-all duration-500 overflow-auto ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${
            showAddModal || showEditModal || showDeleteModal || showViewModal 
              ? 'blur-sm pointer-events-none' 
              : ''
          }`} 
          style={{ transitionDelay: '200ms' }}
        >
          <div className="w-full h-full backdrop-blur-[2px] shadow-[inset_0_0_100px_rgba(0,0,0,0.2)] p-6">
            <BeneficiariesContent />
          </div>
        </main>
      </div>

      {/* Modals */}
      <FormModal
        show={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        onSubmit={handleSubmit}
        isEdit={false}
        formData={formData}
        handleInputChange={handleInputChange}
        programs={programs}
      />

      <FormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setBeneficiaryToEdit(null);
          resetForm();
        }}
        onSubmit={handleEditSubmit}
        isEdit={true}
        formData={formData}
        handleInputChange={handleInputChange}
        programs={programs}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && beneficiaryToDelete && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[3px] flex items-center justify-center z-[100000] animate-fadeIn font-['Montserrat']">
          <div 
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-2xl max-w-md w-full mx-4 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-5">
              <div className="bg-rose-500/20 p-3.5 rounded-xl mr-3 border border-rose-500/30">
                <FaTrash className="text-rose-400 text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Confirm Deletion</h3>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-white">{beneficiaryToDelete.first_name} {beneficiaryToDelete.last_name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBeneficiaryToDelete(null);
                }}
                className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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

export default Beneficiaries;