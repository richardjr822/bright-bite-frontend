import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaShoppingBag, FaArrowUp, FaClock, FaUtensils, FaCheckCircle } from 'react-icons/fa';

export default function VendorOverview() {
  const { vendorData } = useOutletContext() || { vendorData: null };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Today's Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaShoppingBag className="text-blue-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Today</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{vendorData?.todayOrders || 0}</h3>
          <p className="text-sm text-gray-600">Orders Today</p>
        </div>

        {/* Weekly Earnings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FaArrowUp className="text-green-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Week</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{vendorData?.weeklyEarnings?.toFixed(2) || '0.00'}</h3>
          <p className="text-sm text-gray-600">Weekly Earnings</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FaClock className="text-orange-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pending</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{vendorData?.pendingOrders || 0}</h3>
          <p className="text-sm text-gray-600">Pending Orders</p>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FaUtensils className="text-purple-600 text-xl" />
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{vendorData?.menuItems?.length || 0}</h3>
          <p className="text-sm text-gray-600">Menu Items</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendorData?.recentOrders?.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.itemCount} items</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₱{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'completed' && <FaCheckCircle className="mr-1" />}
                      {order.status === 'pending' && <FaClock className="mr-1" />}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
