import React, { useState, useEffect } from 'react';
import { 
  FaBoxOpen, 
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaSpinner,
  FaEye
} from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'PENDING_CONFIRMATION': {
        icon: FaClock,
        color: 'yellow',
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Pending'
      },
      'PREPARING': {
        icon: FaSpinner,
        color: 'blue',
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Preparing'
      },
      'ON_THE_WAY': {
        icon: FaTruck,
        color: 'indigo',
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        label: 'On The Way'
      },
      'DELIVERED': {
        icon: FaCheckCircle,
        color: 'green',
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Delivered'
      },
      'COMPLETED': {
        icon: FaCheckCircle,
        color: 'green',
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Completed'
      },
      'REJECTED': {
        icon: FaTimesCircle,
        color: 'red',
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Cancelled'
      }
    };
    return configs[status] || configs['PENDING_CONFIRMATION'];
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaBoxOpen className="text-purple-600" />
          Order Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">Monitor and manage all platform orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order code, customer, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING_CONFIRMATION">Pending</option>
              <option value="PREPARING">Preparing</option>
              <option value="ON_THE_WAY">On The Way</option>
              <option value="DELIVERED">Delivered</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="text-4xl text-purple-600 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{order.order_code}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-full text-xs font-medium`}>
                        <StatusIcon />
                        {statusConfig.label}
                      </span>
                      {order.payment_method && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${order.payment_method === 'wallet' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                          {order.payment_method === 'wallet' ? 'Wallet' : (order.payment_method === 'cash' ? 'Cash' : order.payment_method)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Customer: <span className="font-medium">{order.customer_name || 'Unknown'}</span></p>
                    <p className="text-sm text-gray-600">Vendor: <span className="font-medium">{order.vendor_name || 'Unknown'}</span></p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">₱{(order.total || 0).toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                  <div className="space-y-1">
                    {(order.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.item_name || item.name}
                        </span>
                        <span className="text-gray-900 font-medium">₱{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <button
                  className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <FaEye />
                  View Full Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
