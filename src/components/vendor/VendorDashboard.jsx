import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  FaBars, 
  FaTimes, 
  FaExclamationTriangle,
  FaSun,
  FaMoon,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaArrowUp,
  FaUtensils
} from 'react-icons/fa';
import { API_BASE } from '../../api';
import { logout } from '../../utils/auth';
import Orders from './Orders';
import MenuManagement from './MenuManagement';
import OrderHistory from './OrderHistory';
import Analytics from './Analytics';
import Reviews from './Reviews';
import Earnings from './Earnings';
import Notifications from './Notifications';
import Settings from './Settings';
import VendorSidebar from './VendorSidebar';

// Logout Modal Component
const LogoutModal = ({ isOpen, onCancel, onConfirm }) => {
  const dialogRef = useRef(null);

  if (!isOpen) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-[9999] animate-fadeIn"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div 
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-10/12 sm:w-96 p-6 transform animate-scaleIn border border-gray-200"
        style={{ maxHeight: "calc(100vh - 40px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-5">
          <div className="w-10 h-10 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mr-3">
            <FaExclamationTriangle className="text-red-500 text-lg" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to log out from your vendor account?
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Sidebar extracted to separate component VendorSidebar

const VendorDashboard = () => {
  const navigate = useNavigate();
  // Active tab is derived from route path; default 'overview'
  const location = useLocation();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef(null);
  
  // Get user from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: FaSun, color: "text-amber-500" };
    if (hour < 18) return { text: "Good Afternoon", icon: FaSun, color: "text-orange-500" };
    return { text: "Good Evening", icon: FaMoon, color: "text-indigo-500" };
  };

  const greeting = getGreeting();

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".sidebar-toggle-btn")
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Derive active tab from URL path
  const activeTab = (() => {
    const match = location.pathname.replace(/.*\/vendor\/?/, '');
    return match === '' ? 'overview' : match.split('/')[0];
  })();

  // Reload business info when navigating away from settings
  useEffect(() => {
    if (activeTab !== 'settings' && vendorData) {
      const savedBusinessInfo = localStorage.getItem('vendorBusinessInfo');
      if (savedBusinessInfo) {
        const parsedInfo = JSON.parse(savedBusinessInfo);
        setVendorData(prev => ({
          ...prev,
          businessName: parsedInfo.name,
          businessDescription: parsedInfo.description,
          businessInfo: {
            ...prev?.businessInfo,
            name: parsedInfo.name,
            description: parsedInfo.description
          }
        }));
      }
    }
  }, [activeTab]);

  // Listen for business info updates
  useEffect(() => {
    const handleBusinessInfoUpdate = (event) => {
      const businessInfo = event.detail;
      setVendorData(prev => ({
        ...prev,
        businessName: businessInfo.name,
        businessDescription: businessInfo.description,
        businessInfo: {
          ...prev?.businessInfo,
          name: businessInfo.name,
          description: businessInfo.description
        }
      }));
    };

    window.addEventListener('businessInfoUpdated', handleBusinessInfoUpdate);
    
    return () => {
      window.removeEventListener('businessInfoUpdated', handleBusinessInfoUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token || !user?.id) throw new Error('Missing auth');

        const response = await fetch(`${API_BASE}/vendor/dashboard/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setVendorData(data);
        } else {
          console.warn('API call failed');
          throw new Error('Failed to load dashboard');
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        setError('Failed to load vendor data');
        setVendorData(null);
      } finally {
        setLoading(false);
      }
    };

    // Always fetch data, even if user is null (will use mock data)
    fetchVendorData();
  }, [user]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };
  const handleSelectTab = (tab) => {
    if (tab === 'overview') {
      navigate('/vendor');
    } else {
      navigate(`/vendor/${tab}`);
    }
    if (isMobileView) setSidebarOpen(false);
  };

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    // Use centralized logout function
    await logout(navigate);
  };

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="mt-4 text-gray-600">Unable to load vendor dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`sidebar-toggle-btn lg:hidden fixed top-4 left-4 z-[99999] p-2.5 rounded-xl bg-white shadow-lg text-[#0d3d23] hover:bg-gray-50 border border-gray-200 transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Toggle Menu"
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Transparent Blurred Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 backdrop-blur-sm bg-black/30 z-[99998] transition-all duration-300"
        ></div>
      )}

      {/* Sidebar */}
      <VendorSidebar
        sidebarRef={sidebarRef}
        sidebarOpen={sidebarOpen}
        isMobileView={isMobileView}
        mounted={mounted}
        vendorData={vendorData}
        greeting={greeting}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 py-6 lg:px-8">
        <Outlet context={{ vendorData }} />
      </main>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutDialog}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
};

export default VendorDashboard;
