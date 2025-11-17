import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartLine, FaDollarSign, FaUtensils, FaStar } from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({ ordersByStatus: {}, dailyRevenue: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const tzOffsetMinutes = -new Date().getTimezoneOffset(); // convert to positive eastward offset
      const res = await fetch(`${API_BASE}/admin/analytics?days=${days}&tz_offset_minutes=${tzOffsetMinutes}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = analytics.dailyRevenue.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalOrders = Object.values(analytics.ordersByStatus).reduce((a, b) => a + b, 0);
  const completedOrders = (analytics.ordersByStatus['DELIVERED'] || 0) + (analytics.ordersByStatus['COMPLETED'] || 0);
  const averageOrderValue = completedOrders ? (totalRevenue / completedOrders) : 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaChartBar className="text-indigo-600" />
            Analytics & Reports
          </h1>
          <p className="text-sm text-gray-600 mt-1">Performance metrics for last {days} days</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value) || 7)}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={21}>21 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <FaChartLine className="text-blue-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{totalRevenue.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <FaUtensils className="text-purple-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalOrders}</h3>
          <p className="text-sm text-gray-600">Total Orders (All Status)</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
            <FaDollarSign className="text-emerald-600 text-xl" />
          </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{averageOrderValue.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Avg Value (Delivered+Completed)</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
            <FaStar className="text-amber-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">N/A</h3>
          <p className="text-sm text-gray-600">Average Rating (not implemented)</p>
        </div>
      </div>

      {/* Orders By Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders By Status</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{status}</p>
                <p className="text-lg font-bold text-gray-900">{count}</p>
              </div>
            ))}
            {Object.keys(analytics.ordersByStatus).length === 0 && (
              <p className="text-gray-500 text-sm">No orders in range.</p>
            )}
          </div>
        )}
      </div>

      {/* Daily Revenue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Revenue</h2>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {analytics.dailyRevenue.map(d => (
              <div key={d.date} className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-center">
                <p className="text-xs text-gray-500">{d.date}</p>
                <p className="text-sm font-semibold text-gray-900">₱{d.revenue.toFixed(2)}</p>
              </div>
            ))}
            {analytics.dailyRevenue.length === 0 && (
              <p className="text-gray-500 text-sm">No revenue data.</p>
            )}
          </div>
        )}
      </div>

      {/* Placeholder future sections */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Future Insights</h2>
        <p className="text-sm text-gray-600">Additional charts (top vendors, menu performance) can be added here.</p>
      </div>
    </div>
  );
}
