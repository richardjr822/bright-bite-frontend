import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaBox, FaCheckCircle, FaClock } from 'react-icons/fa';
import { API_BASE } from '../../api';

const StaffOverview = () => {
  const { staffData } = useOutletContext();

  const [stats, setStats] = React.useState({
    total_deliveries: 0,
    completed_today: 0,
    active_orders: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        if (!user.id || !token) return;

        // Stats
        const statsRes = await fetch(`${API_BASE}/staff/stats/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s);
        }

        // Recent deliveries (take first 5)
        const delivRes = await fetch(`${API_BASE}/staff/deliveries/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (delivRes.ok) {
          const d = await delivRes.json();
          const mapped = (d.deliveries || []).slice(0, 5).map((o) => ({
            id: o.id,
            orderCode: o.order_code || o.orderCode || '—',
            customer: o.customer_name || 'Customer',
            location: o.delivery_address || '—',
            status: o.status === 'in-progress' ? 'in-transit' : (o.status || 'pending'),
            time: o.created_at ? new Date(o.created_at).toLocaleTimeString() : '—',
          }));
          setRecentDeliveries(mapped);
        }
      } catch (e) {
        console.error('Failed to load overview data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-transit':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-transit':
        return 'In Transit';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-gray-600">Loading...</div>
    );
  }

  const statCards = [
    { label: "Active Orders", value: String(stats.active_orders || 0), icon: FaClock, bgGradient: 'from-orange-500 to-orange-600' },
    { label: "Completed Today", value: String(stats.completed_today || 0), icon: FaCheckCircle, bgGradient: 'from-green-500 to-green-600' },
    { label: "Total Deliveries", value: String(stats.total_deliveries || 0), icon: FaBox, bgGradient: 'from-blue-500 to-blue-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Welcome back, {staffData?.full_name || 'Delivery Staff'}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="text-white text-xl" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Deliveries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {delivery.orderCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {delivery.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {delivery.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {delivery.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        delivery.status
                      )}`}
                    >
                      {getStatusText(delivery.status)}
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
};

export default StaffOverview;
