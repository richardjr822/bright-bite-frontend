import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  FaUserCircle, 
  FaUtensils, 
  FaStore, 
  FaClipboardList, 
  FaHeartbeat, 
  FaWallet, 
  FaGift, 
  FaComments,
  FaCog, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaExclamationTriangle,
  FaSun,
  FaMoon,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

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
          Are you sure you want to log out? Any unsaved changes will be lost.
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

const StudentSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef(null);
  const [userInfo, setUserInfo] = useState({ 
    fullName: "Guest User",
    organization: "",
    walletBalance: 0.00
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: FaSun, color: "text-amber-500" };
    if (hour < 18) return { text: "Good Afternoon", icon: FaSun, color: "text-orange-500" };
    return { text: "Good Evening", icon: FaMoon, color: "text-indigo-500" };
  };

  const greeting = getGreeting();

  // Fetch user data from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserInfo({
          fullName: user.full_name || user.name || "User",
          organization: user.organization || "No Organization",
          walletBalance: user.wallet_balance || 0.00
        });
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Check if mobile view based on window size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobileView) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobileView]);

  // Animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Collapse sidebar when clicking outside (mobile only)
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".sidebar-toggle-btn")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Handle logout process
  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutDialog(true);
  };
  
  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    // Use centralized logout function
    await logout(navigate);
  };
  
  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  // Get first name for collapsed view
  const getFirstName = () => {
    return userInfo.fullName.split(' ')[0];
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`sidebar-toggle-btn lg:hidden fixed top-4 left-4 z-[99999] p-2.5 rounded-xl bg-white shadow-lg text-[#0d3d23] hover:bg-gray-50 border border-gray-200 transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Desktop Collapse Toggle Button */}
      {!isMobileView && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:block fixed top-4 z-[99999] p-2.5 rounded-xl bg-white shadow-lg text-[#0d3d23] hover:bg-gray-50 border border-gray-200 transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ left: isCollapsed ? '84px' : '264px' }}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
        </button>
      )}

      {/* Transparent Blurred Backdrop for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 backdrop-blur-sm bg-black/30 z-[99998] transition-all duration-300"
        ></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-xl border-r border-gray-200 flex flex-col
          transition-all duration-500 ease-in-out
          ${isMobileView 
            ? `fixed z-[999999] ${isMobileMenuOpen ? 'left-0' : '-left-[280px]'} w-[280px] py-4 px-3`
            : `sticky top-0 left-0 z-30 py-6 px-4 ${isCollapsed ? 'w-[100px]' : 'w-[280px]'}`}
          ${mounted ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-40 h-40 bg-green-100/50 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-32 left-0 w-48 h-48 bg-blue-100/40 rounded-full filter blur-3xl"></div>
        </div>
        
        {/* User Info Section */}
        <div className="relative z-10 mb-6">
          {/* Profile Picture & Greeting */}
          <div className={`flex items-center mb-4 ${isCollapsed && !isMobileView ? 'justify-center' : ''}`}>
            <div className="relative group">
              <div className={`relative rounded-full overflow-hidden bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] border-2 border-green-200 shadow-md group-hover:border-green-300 transition-all duration-300 ${isCollapsed && !isMobileView ? 'w-14 h-14' : 'w-12 h-12'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaUserCircle className={`text-white group-hover:scale-110 transition-transform duration-300 ${isCollapsed && !isMobileView ? 'text-3xl' : 'text-2xl'}`} />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full border-2 border-green-500 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>
            {(!isCollapsed || isMobileView) && (
              <div className="ml-3 flex-1">
                <div className={`flex items-center gap-1.5 ${greeting.color} text-xs mb-0.5 font-medium`}>
                  <greeting.icon className="text-[11px]" />
                  <span>{greeting.text}</span>
                </div>
                <h3 className="text-gray-900 font-semibold text-sm leading-tight">
                  {userInfo.fullName}
                </h3>
              </div>
            )}
          </div>

          {/* Wallet Balance Card */}
          {(!isCollapsed || isMobileView) ? (
            <div className="bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl p-3.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100/80 text-xs font-medium mb-1">Wallet Balance</p>
                  <p className="text-white font-bold text-xl">₱{userInfo.walletBalance.toFixed(2)}</p>
                </div>
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaWallet className="text-white text-lg" />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl p-3 shadow-lg flex flex-col items-center">
              <FaWallet className="text-white text-2xl mb-2" />
              <p className="text-white font-bold text-sm">₱{Math.floor(userInfo.walletBalance)}</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-1">
          {/* Food & Orders Group */}
          <div className="mb-4">
            {(!isCollapsed || isMobileView) && (
              <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">Food & Orders</p>
            )}
            
            <MenuItem 
              to="/meal-planner"
              icon={FaUtensils}
              label="Meal Planner"
              isActive={location.pathname === "/meal-planner"}
              color="green"
              isCollapsed={isCollapsed && !isMobileView}
            />
            
            <MenuItem 
              to="/canteen"
              icon={FaStore}
              label="Campus Canteen"
              isActive={location.pathname === "/canteen"}
              color="emerald"
              isCollapsed={isCollapsed && !isMobileView}
            />

            <MenuItem 
              to="/orders"
              icon={FaClipboardList}
              label="My Orders"
              isActive={location.pathname === "/orders"}
              color="blue"
              isCollapsed={isCollapsed && !isMobileView}
            />

            <MenuItem 
              to="/nutrition"
              icon={FaHeartbeat}
              label="Nutrition Tracker"
              isActive={location.pathname === "/nutrition"}
              color="red"
              isCollapsed={isCollapsed && !isMobileView}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>

          {/* Wallet & Rewards Group */}
          <div className="mb-4">
            {(!isCollapsed || isMobileView) && (
              <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">Wallet & Perks</p>
            )}
            
            <MenuItem 
              to="/wallet"
              icon={FaWallet}
              label="My Wallet"
              isActive={location.pathname === "/wallet"}
              color="yellow"
              isCollapsed={isCollapsed && !isMobileView}
            />

            <MenuItem 
              to="/rewards"
              icon={FaGift}
              label="Rewards & Deals"
              isActive={location.pathname === "/rewards"}
              color="purple"
              badge="New"
              isCollapsed={isCollapsed && !isMobileView}
            />

            <MenuItem 
              to="/feedback"
              icon={FaComments}
              label="Feedback"
              isActive={location.pathname === "/feedback"}
              color="pink"
              isCollapsed={isCollapsed && !isMobileView}
            />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>

          {/* Account Group */}
          <div className="mb-2">
            {(!isCollapsed || isMobileView) && (
              <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">Account</p>
            )}
            
            <MenuItem 
              to="/settings"
              icon={FaCog}
              label="Settings"
              isActive={location.pathname === "/settings"}
              color="gray"
              isCollapsed={isCollapsed && !isMobileView}
            />
          </div>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto relative z-10 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogoutClick}
            className={`bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 w-full 
            py-3 rounded-xl border border-red-200 hover:border-red-300
            flex items-center justify-center transition-all duration-200 group text-sm font-medium shadow-sm
            ${isCollapsed && !isMobileView ? 'px-2' : 'px-3'}`}
          >
            <FaSignOutAlt className={`text-base group-hover:translate-x-1 transition-transform duration-300 ${(!isCollapsed || isMobileView) ? 'mr-2' : ''}`} />
            {(!isCollapsed || isMobileView) && <span>Logout</span>}
          </button>
          {(!isCollapsed || isMobileView) && (
            <div className="text-gray-400 text-[10px] text-center mt-3 font-medium">
              BrightBite v2.1.0
            </div>
          )}
        </div>
      </div>

      {/* Use the Portal-based Modal component */}
      <LogoutModal 
        isOpen={showLogoutDialog}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(209,213,219,0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156,163,175,0.7);
        }
      `}</style>
    </>
  );
};

// Enhanced MenuItem Component with Collapsed State
const MenuItem = ({ to, icon: Icon, label, isActive, color = "green", badge = null, isCollapsed = false }) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };
  
  // Light mode color scheme mapping
  const colorClasses = {
    green: {
      active: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md shadow-green-200',
      icon: 'text-white',
      hover: 'hover:bg-green-50',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    },
    emerald: {
      active: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200',
      icon: 'text-white',
      hover: 'hover:bg-emerald-50',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    },
    blue: {
      active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200',
      icon: 'text-white',
      hover: 'hover:bg-blue-50',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    },
    red: {
      active: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200',
      icon: 'text-white',
      hover: 'hover:bg-red-50',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    },
    yellow: {
      active: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-yellow-200',
      icon: 'text-white',
      hover: 'hover:bg-yellow-50',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    },
    purple: {
      active: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-200',
      icon: 'text-white',
      hover: 'hover:bg-purple-50',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    },
    pink: {
      active: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md shadow-pink-200',
      icon: 'text-white',
      hover: 'hover:bg-pink-50',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    },
    gray: {
      active: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-md shadow-gray-200',
      icon: 'text-white',
      hover: 'hover:bg-gray-100',
      inactive: 'text-gray-600',
      inactiveIcon: 'text-gray-500'
    }
  };
  
  const classes = colorClasses[color] || colorClasses.green;
  
  return (
    <div className="relative">
      <a
        href={to}
        onClick={handleClick}
        onMouseEnter={() => isCollapsed && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center mb-2 rounded-lg transition-all duration-200 group relative overflow-hidden
          ${isCollapsed ? 'justify-center py-3 px-2' : 'px-3 py-2.5'}
          ${isActive 
            ? classes.active
            : `${classes.inactive} ${classes.hover}`
          }`}
      >
        {/* Icon */}
        <Icon className={`relative z-10 ${isActive ? classes.icon : `${classes.inactiveIcon} group-hover:text-gray-700`} transition-colors duration-200 ${isCollapsed ? 'text-xl' : 'text-base mr-3'}`} />
        
        {/* Label */}
        {!isCollapsed && (
          <>
            <span className="font-medium text-sm relative z-10 flex-1">{label}</span>
            
            {/* Badge (e.g., "New") */}
            {badge && (
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                {badge}
              </span>
            )}
            
            {/* Active indicator dot */}
            {isActive && (
              <div className="ml-auto bg-white w-1.5 h-1.5 rounded-full relative z-10 shadow-sm"></div>
            )}
          </>
        )}
        
        {/* Active indicator for collapsed state */}
        {isCollapsed && isActive && (
          <div className="absolute right-1 bg-white w-1 h-1 rounded-full shadow-sm"></div>
        )}
      </a>
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && showTooltip && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap z-[100000] shadow-lg">
          {label}
          {badge && (
            <span className="ml-2 px-1.5 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full">
              {badge}
            </span>
          )}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default StudentSidebar;