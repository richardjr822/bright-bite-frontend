import React, { useState, useEffect } from 'react';
import { 
  FaChartBar,
  FaChartLine,
  FaTrophy,
  FaClock,
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaSpinner
} from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [analytics, setAnalytics] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !user?.id) throw new Error('Missing auth');

      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
      const response = await fetch(`${API_BASE}/vendor/analytics/${user.id}?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize optional fields for UI
        setAnalytics({
          total_orders: data.total_orders || 0,
          total_revenue: data.total_revenue || 0,
          average_order_value: data.average_order_value || 0,
          daily_sales: Array.isArray(data.daily_sales) ? data.daily_sales : [],
          popular_items: Array.isArray(data.popular_items) ? data.popular_items.map(it => ({
            name: it.name,
            count: it.count || 0,
            revenue: it.revenue || 0,
          })) : [],
          peak_hours: [],
          growth_rate: 0,
          completion_rate: 100,
        });
      } else {
        console.warn('API failed');
        throw new Error('Failed to load analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setAnalytics({
        total_orders: 0,
        total_revenue: 0,
        average_order_value: 0,
        daily_sales: [],
        popular_items: [],
        peak_hours: [],
        growth_rate: 0,
        completion_rate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="text-4xl text-green-600 animate-spin" />
      </div>
    );
  }

  const maxSales = analytics.daily_sales.length ? Math.max(...analytics.daily_sales.map(d => d.amount || 0)) : 1;
  const maxOrders = analytics.peak_hours.length ? Math.max(...analytics.peak_hours.map(h => h.orders || 0)) : 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <div className="flex items-center gap-2">
          <FaCalendar className="text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Orders</p>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaChartBar className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{analytics.total_orders}</p>
          <div className="flex items-center gap-1 text-sm">
            <FaArrowUp className="text-green-600" />
            <span className="text-green-600 font-medium">{analytics.growth_rate}%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaChartLine className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">₱{analytics.total_revenue.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-sm">
            <FaArrowUp className="text-green-600" />
            <span className="text-green-600 font-medium">8.2%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Order Value</p>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaTrophy className="text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">₱{analytics.average_order_value.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-sm">
            <FaArrowDown className="text-red-600" />
            <span className="text-red-600 font-medium">2.1%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completion Rate</p>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FaClock className="text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{analytics.completion_rate.toFixed(1)}%</p>
          <div className="flex items-center gap-1 text-sm">
            <FaArrowUp className="text-green-600" />
            <span className="text-green-600 font-medium">3.5%</span>
            <span className="text-gray-500">vs last period</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
          <div className="space-y-2">
            {analytics.daily_sales.map((day, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-20">
                  {day.date ? new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${((day.amount || 0) / maxSales) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">₱{(day.amount || 0).toFixed(0)}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">{day.orders || 0} orders</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h2>
          <div className="space-y-2">
            {analytics.peak_hours.map((hour, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-20">{hour.hour}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${((hour.orders || 0) / maxOrders) * 100}%` }}
                  >
                    <span className="text-xs font-medium text-white">{hour.orders} orders</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popularity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.popular_items.map((item, idx) => {
                const maxCount = analytics.popular_items[0].count;
                const popularity = (item.count / maxCount) * 100;
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.count} orders</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">₱{item.revenue.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${popularity}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{popularity.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
