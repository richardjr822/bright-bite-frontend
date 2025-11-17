import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaUserTie, 
  FaHourglassHalf,
  FaClipboardList, 
  FaChartLine,
  FaUtensils,
  FaBoxOpen,
  FaChartBar
} from 'react-icons/fa';

export default function AdminOverview() {
  const { stats } = useOutletContext();
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Students</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalStudents}</h3>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>

        {/* Total Vendors */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FaUserTie className="text-green-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Vendors</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalVendors}</h3>
          <p className="text-sm text-gray-600">Active Vendors</p>
        </div>

        {/* Pending Vendors */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FaHourglassHalf className="text-orange-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingVendors}</h3>
          <p className="text-sm text-gray-600">Pending Vendors</p>
        </div>

        {/* Active Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FaClipboardList className="text-purple-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Today</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeOrders}</h3>
          <p className="text-sm text-gray-600">Active Orders</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-emerald-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Revenue</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>

        {/* Total Meals Served */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <FaUtensils className="text-amber-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Meals</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalMeals.toLocaleString()}</h3>
          <p className="text-sm text-gray-600">Meals Served</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/pending-vendors')}
            className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors group"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                <FaHourglassHalf className="text-orange-600 text-lg" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Review Vendors</p>
                <p className="text-xs text-gray-600">{stats.pendingVendors} pending</p>
              </div>
            </div>
            <span className="text-orange-600">→</span>
          </button>

          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors group"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors">
                <FaBoxOpen className="text-purple-600 text-lg" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">View Orders</p>
                <p className="text-xs text-gray-600">{stats.activeOrders} active</p>
              </div>
            </div>
            <span className="text-purple-600">→</span>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors group"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-indigo-200 transition-colors">
                <FaChartBar className="text-indigo-600 text-lg" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">View Analytics</p>
                <p className="text-xs text-gray-600">Sales & trends</p>
              </div>
            </div>
            <span className="text-indigo-600">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
