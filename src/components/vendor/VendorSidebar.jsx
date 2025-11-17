import React from 'react';
import {
  FaBoxOpen,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaStore,
  FaHistory,
  FaBell,
  FaUtensils,
  FaStar,
  FaWallet,
  FaDollarSign,
  FaUserPlus,
} from 'react-icons/fa';

const MenuItem = ({ icon: Icon, label, isActive, color = 'green', onClick, badge }) => {
  const colorClasses = {
    green: {
      active: 'from-[#0d3d23] to-[#1a5d3a] border-green-300',
      inactive: 'text-gray-700 hover:bg-green-50',
      icon: 'text-green-600',
    },
    blue: {
      active: 'from-blue-600 to-blue-700 border-blue-300',
      inactive: 'text-gray-700 hover:bg-blue-50',
      icon: 'text-blue-600',
    },
    purple: {
      active: 'from-purple-600 to-purple-700 border-purple-300',
      inactive: 'text-gray-700 hover:bg-purple-50',
      icon: 'text-purple-600',
    },
    orange: {
      active: 'from-orange-600 to-orange-700 border-orange-300',
      inactive: 'text-gray-700 hover:bg-orange-50',
      icon: 'text-orange-600',
    },
    yellow: {
      active: 'from-yellow-500 to-yellow-600 border-yellow-300',
      inactive: 'text-gray-700 hover:bg-yellow-50',
      icon: 'text-yellow-600',
    },
    emerald: {
      active: 'from-emerald-600 to-emerald-700 border-emerald-300',
      inactive: 'text-gray-700 hover:bg-emerald-50',
      icon: 'text-emerald-600',
    },
    red: {
      active: 'from-red-600 to-red-700 border-red-300',
      inactive: 'text-gray-700 hover:bg-red-50',
      icon: 'text-red-600',
    },
    gray: {
      active: 'from-gray-600 to-gray-700 border-gray-300',
      inactive: 'text-gray-700 hover:bg-gray-50',
      icon: 'text-gray-600',
    },
    teal: {
      active: 'from-teal-600 to-teal-700 border-teal-300',
      inactive: 'text-gray-700 hover:bg-teal-50',
      icon: 'text-teal-600',
    },
  };

  const colors = colorClasses[color] || colorClasses.green;

  return (
    <button
      onClick={onClick}
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
    </button>
  );
};

export default function VendorSidebar({
  sidebarRef,
  sidebarOpen,
  isMobileView,
  mounted,
  vendorData,
  greeting,
  activeTab,
  onSelectTab,
  onLogout,
}) {
  return (
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
        <div className="absolute top-20 right-0 w-40 h-40 bg-green-100/50 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-32 left-0 w-48 h-48 bg-blue-100/40 rounded-full filter blur-3xl"></div>
      </div>

      {/* Vendor Info Section */}
      <div className="relative z-10 mb-6">
        {/* Profile Picture & Greeting */}
        <div className="flex items-center mb-4">
          <div className="relative group">
            <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] border-2 border-green-200 shadow-md group-hover:border-green-300 transition-all duration-300">
              <div className="absolute inset-0 flex items-center justify-center">
                <FaStore className="text-white text-2xl group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full border-2 border-green-500 flex items-center justify-center shadow-md">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <div className={`flex items-center gap-1.5 ${greeting.color} text-xs mb-0.5 font-medium`}>
              <greeting.icon className="text-[11px]" />
              <span>{greeting.text}</span>
            </div>
            <h3 className="text-gray-900 font-semibold text-sm leading-tight">
              {vendorData?.businessInfo?.name || 'Vendor'}
            </h3>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100/80 text-xs font-medium mb-1">Weekly Earnings</p>
              <p className="text-white font-bold text-xl">₱{vendorData?.weeklyEarnings?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <FaDollarSign className="text-white text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

      {/* Menu Items - Scrollable */}
      <nav className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-1">
        {/* Business Group */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">Business</p>

          <MenuItem
            icon={FaChartLine}
            label="Overview"
            isActive={activeTab === 'overview'}
            color="green"
            onClick={() => onSelectTab('overview')}
          />

          <MenuItem
            icon={FaBoxOpen}
            label="Orders"
            isActive={activeTab === 'orders'}
            color="blue"
            onClick={() => onSelectTab('orders')}
            badge={vendorData?.allOrders?.filter((o) => o.status === 'pending').length || 0}
          />

          <MenuItem
            icon={FaUtensils}
            label="Menu Management"
            isActive={activeTab === 'menu-management'}
            color="purple"
            onClick={() => onSelectTab('menu-management')}
          />

          <MenuItem
            icon={FaHistory}
            label="Order History"
            isActive={activeTab === 'order-history'}
            color="orange"
            onClick={() => onSelectTab('order-history')}
          />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>

        {/* Insights Group */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">Insights</p>

          <MenuItem
            icon={FaStar}
            label="Reviews"
            isActive={activeTab === 'reviews'}
            color="yellow"
            onClick={() => onSelectTab('reviews')}
          />

          <MenuItem
            icon={FaWallet}
            label="Earnings"
            isActive={activeTab === 'earnings'}
            color="emerald"
            onClick={() => onSelectTab('earnings')}
          />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>

        {/* Management Group */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">Management</p>

          <MenuItem
            icon={FaUserPlus}
            label="Delivery Staff"
            isActive={activeTab === 'delivery-staff'}
            color="teal"
            onClick={() => onSelectTab('delivery-staff')}
          />
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4"></div>

        {/* Account Group */}
        <div className="mb-2">
          <p className="text-[10px] font-bold text-gray-500 mb-2 px-2 tracking-wider uppercase">Account</p>

          <MenuItem
            icon={FaBell}
            label="Notifications"
            isActive={activeTab === 'notifications'}
            color="red"
            onClick={() => onSelectTab('notifications')}
          />

          <MenuItem
            icon={FaCog}
            label="Settings"
            isActive={activeTab === 'settings'}
            color="gray"
            onClick={() => onSelectTab('settings')}
          />
        </div>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto relative z-10 pt-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 w-full 
            py-3 px-3 rounded-xl border border-red-200 hover:border-red-300
            flex items-center justify-center transition-all duration-200 group text-sm font-medium shadow-sm"
        >
          <FaSignOutAlt className="text-base mr-2 group-hover:translate-x-1 transition-transform duration-300" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}