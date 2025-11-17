import React, { useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { logout } from '../../utils/auth';
import { 
  FaChartLine, 
  FaStore,
  FaUsers,
  FaBoxOpen,
  FaChartBar,
  FaDollarSign,
  FaCog,
  FaSignOutAlt,
  FaHourglassHalf,
  FaUserShield,
  FaSun,
  FaMoon,
  FaTags,
  FaBars,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

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
          Are you sure you want to log out from the admin panel?
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

// MenuItem Component
const MenuItem = ({ icon: Icon, label, isActive, color = "blue", to, badge }) => {
  const colorClasses = {
    blue: {
      active: 'from-blue-600 to-blue-700 border-blue-300',
      inactive: 'text-gray-700 hover:bg-blue-50',
      icon: 'text-blue-600'
    },
    green: {
      active: 'from-green-600 to-green-700 border-green-300',
      inactive: 'text-gray-700 hover:bg-green-50',
      icon: 'text-green-600'
    },
    purple: {
      active: 'from-purple-600 to-purple-700 border-purple-300',
      inactive: 'text-gray-700 hover:bg-purple-50',
      icon: 'text-purple-600'
    },
    orange: {
      active: 'from-orange-600 to-orange-700 border-orange-300',
      inactive: 'text-gray-700 hover:bg-orange-50',
      icon: 'text-orange-600'
    },
    indigo: {
      active: 'from-indigo-600 to-indigo-700 border-indigo-300',
      inactive: 'text-gray-700 hover:bg-indigo-50',
      icon: 'text-indigo-600'
    },
    amber: {
      active: 'from-amber-600 to-amber-700 border-amber-300',
      inactive: 'text-gray-700 hover:bg-amber-50',
      icon: 'text-amber-600'
    },
    emerald: {
      active: 'from-emerald-600 to-emerald-700 border-emerald-300',
      inactive: 'text-gray-700 hover:bg-emerald-50',
      icon: 'text-emerald-600'
    },
    gray: {
      active: 'from-gray-600 to-gray-700 border-gray-300',
      inactive: 'text-gray-700 hover:bg-gray-50',
      icon: 'text-gray-600'
    },
    pink: {
      active: 'from-pink-600 to-pink-700 border-pink-300',
      inactive: 'text-gray-700 hover:bg-pink-50',
      icon: 'text-pink-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <Link
      to={to}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1.5 transition-all duration-200 group ${
        isActive
          ? `bg-gradient-to-r ${colors.active} text-white shadow-md border`
          : `${colors.inactive} border border-transparent`
      }`}
    >
      <div className="flex items-center">
        <Icon className={`text-base mr-3 ${isActive ? 'text-white' : colors.icon} transition-transform group-hover:scale-110`} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default function AdminSidebar({ 
  pendingVendorsCount = 0,
  sidebarOpen,
  setSidebarOpen,
  isMobileView 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const sidebarRef = useRef(null);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: FaSun, color: "text-amber-500" };
    if (hour < 18) return { text: "Good Afternoon", icon: FaSun, color: "text-orange-500" };
    return { text: "Good Evening", icon: FaMoon, color: "text-indigo-500" };
  };

  const greeting = getGreeting();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
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

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`sidebar-toggle-btn lg:hidden fixed top-4 left-4 z-[99999] p-2.5 rounded-xl bg-white shadow-lg text-blue-600 hover:bg-gray-50 border border-gray-200 transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Toggle Menu"
      >
        {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Transparent Blurred Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 backdrop-blur-sm bg-black/30 z-[99998] transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 shadow-xl border-r border-gray-200 flex flex-col
          transition-all duration-500 ease-in-out
          ${isMobileView 
            ? `fixed z-[999999] ${sidebarOpen ? 'left-0' : '-left-[280px]'} w-[280px] py-4 px-3`
            : 'w-[280px] py-6 px-4 sticky top-0 left-0 z-30'}
          ${mounted ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-0 w-40 h-40 bg-blue-100/50 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-32 left-0 w-48 h-48 bg-purple-100/40 rounded-full filter blur-3xl"></div>
        </div>
        
        {/* Admin Info Section */}
        <div className="relative z-10 mb-6">
          {/* Profile Picture & Greeting */}
          <div className="flex items-center mb-4">
            <div className="relative group">
              <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-200 shadow-md group-hover:border-blue-300 transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaUserShield className="text-white text-2xl group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <div className={`flex items-center gap-1.5 ${greeting.color} text-xs mb-0.5 font-medium`}>
                <greeting.icon className="text-[11px]" />
                <span>{greeting.text}</span>
              </div>
              <h3 className="text-gray-900 font-semibold text-sm leading-tight">
                Admin Panel
              </h3>
              <p className="text-gray-500 text-xs">System Administrator</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-1">
          {/* Management Group */}
          <div className="mb-4">
            <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">MANAGEMENT</p>
            
            <MenuItem 
              icon={FaChartLine}
              label="Overview"
              isActive={location.pathname === '/admin' || location.pathname === '/admin/'}
              color="blue"
              to="/admin"
            />

            <MenuItem 
              icon={FaHourglassHalf}
              label="Pending Vendors"
              isActive={location.pathname === '/admin/pending-vendors'}
              color="orange"
              to="/admin/pending-vendors"
              badge={pendingVendorsCount > 0 ? pendingVendorsCount : null}
            />
            
            <MenuItem 
              icon={FaStore}
              label="Vendors"
              isActive={location.pathname === '/admin/vendors'}
              color="green"
              to="/admin/vendors"
            />

            <MenuItem 
              icon={FaUsers}
              label="Students"
              isActive={location.pathname === '/admin/students'}
              color="blue"
              to="/admin/students"
            />

            <MenuItem 
              icon={FaBoxOpen}
              label="Orders"
              isActive={location.pathname === '/admin/orders'}
              color="purple"
              to="/admin/orders"
            />

            <MenuItem 
              icon={FaTags}
              label="Deals & Promos"
              isActive={location.pathname === '/admin/deals'}
              color="pink"
              to="/admin/deals"
            />

            <MenuItem 
              icon={FaChartBar}
              label="Analytics"
              isActive={location.pathname === '/admin/analytics'}
              color="indigo"
              to="/admin/analytics"
            />

            <MenuItem 
              icon={FaDollarSign}
              label="Transactions"
              isActive={location.pathname === '/admin/transactions'}
              color="emerald"
              to="/admin/transactions"
            />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>

          {/* Account Group */}
          <div className="mb-2">
            <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">System</p>
            
            <MenuItem 
              icon={FaCog}
              label="Settings"
              isActive={location.pathname === '/admin/settings'}
              color="gray"
              to="/admin/settings"
            />
          </div>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto relative z-10 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 w-full 
            py-3 px-3 rounded-xl border border-red-200 hover:border-red-300
            flex items-center justify-center transition-all duration-200 group text-sm font-medium shadow-sm"
          >
            <FaSignOutAlt className="text-base mr-2 group-hover:translate-x-1 transition-transform duration-300" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutDialog}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </>
  );
}
