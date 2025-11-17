import React from 'react';
import { FaBox, FaClipboardList, FaHistory, FaUser, FaSignOutAlt, FaTruck } from 'react-icons/fa';

const StaffSidebar = ({ sidebarRef, sidebarOpen, isMobileView, mounted, staffData, activeTab, onSelectTab, onLogout }) => {
  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: FaTruck },
    { id: 'deliveries', label: 'My Deliveries', icon: FaBox },
    { id: 'history', label: 'History', icon: FaHistory },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <aside
      ref={sidebarRef}
      className={`
        ${isMobileView ? 'fixed' : 'sticky'} top-0 h-screen
        w-64 bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ease-in-out z-[99999]
        ${isMobileView ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        ${mounted ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <FaTruck className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">BrightBite</h2>
            <p className="text-xs text-gray-500">Delivery Staff</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-teal-50 rounded-lg">
          <p className="text-xs font-medium text-teal-900">{staffData?.full_name || 'Delivery Staff'}</p>
          <p className="text-xs text-teal-700 mt-1">ID: {staffData?.staff_id || 'Loading...'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectTab(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-teal-50 text-teal-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`text-lg ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <FaSignOutAlt className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
