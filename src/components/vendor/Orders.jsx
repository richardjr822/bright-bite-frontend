import React, { useState, useEffect } from 'react';
import { 
  FaBoxOpen, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaUser
} from 'react-icons/fa';
import { API_BASE } from '../../api';

// Format order number to short readable format (e.g., #0001)
const formatOrderNumber = (orderId) => {
  if (!orderId) return '#0000';
  const idStr = String(orderId);
  const numericPart = idStr.replace(/[^0-9]/g, '');
  if (numericPart.length >= 3) {
    return `#${numericPart.slice(-4).padStart(4, '0')}`;
  }
  return `#${idStr.slice(-4).toUpperCase()}`;
};

// Format relative time for orders
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  // Staff assignment removed per new requirements

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !user?.id) throw new Error('Missing auth');

      const url = statusFilter === 'all' 
        ? `${API_BASE}/vendor/orders/${user.id}`
        : `${API_BASE}/vendor/orders/${user.id}?status_filter=${statusFilter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        console.warn('API failed');
        throw new Error('Failed to load orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Real-time websocket
  useEffect(() => {
    if (!user?.id) return;
    let ws;
    const connect = () => {
      const wsUrl = API_BASE.replace('http', 'ws') + `/ws/orders?vendorId=${user.id}`;
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg.type === 'ping') return;
            if (msg.type === 'order_status' && msg.order_id) {
              // Prefer UI status; fallback to db->ui mapping
              let ui = msg.ui_status || msg.status;
              if (!ui && msg.db_status) {
                const map = {
                  PENDING_CONFIRMATION: 'pending',
                  CONFIRMED: 'pending',
                  PAYMENT_PROCESSING: 'pending',
                  PREPARING: 'preparing',
                  READY_FOR_PICKUP: 'ready',
                  COMPLETED: 'completed',
                  RATING_PENDING: 'completed',
                  REJECTED: 'cancelled',
                  DELIVERED: 'completed',
                };
                ui = map[msg.db_status] || 'pending';
              }
              setOrders(prev => prev.map(o => o.id === msg.order_id ? { ...o, status: ui } : o));
            } else if (msg.type === 'order_created' && msg.order_id) {
              // Fetch latest orders (could optimize later)
              fetchOrders();
            }
          } catch (_) {}
        };
        ws.onclose = () => {
          setTimeout(connect, 3000); // attempt reconnection
        };
        ws.onerror = () => {
          try { ws.close(); } catch (_) {}
        };
      } catch (e) {
        console.error('WebSocket init failed', e);
      }
    };
    connect();
    return () => { try { ws && ws.close(); } catch (_) {} };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('token');
      if (!token || !user?.id) throw new Error('Missing auth');

      const response = await fetch(`${API_BASE}/vendor/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Optimistically update without full refetch; websocket will reconcile.
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      } else {
        throw new Error('Failed to update');
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      preparing: 'bg-blue-100 text-blue-800 border-blue-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="text-yellow-600" />,
      preparing: <FaSpinner className="text-blue-600 animate-spin" />,
      ready: <FaCheckCircle className="text-green-600" />,
      completed: <FaCheckCircle className="text-gray-600" />,
      cancelled: <FaTimesCircle className="text-red-600" />
    };
    return icons[status] || icons.pending;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) ||
                         order.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="text-4xl text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <FaFilter className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaBoxOpen className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-[#0d3d23]">{formatOrderNumber(order.id)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {order.fulfillment && (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${order.fulfillment === 'delivery' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {order.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {formatRelativeTime(order.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaUser className="text-gray-400 text-xs" />
                    <span className="font-medium">{order.users?.full_name || 'Unknown'}</span>
                  </div>
                  {order.assigned_staff && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Assigned to: <span className="font-medium">{order.assigned_staff.full_name || order.assigned_staff.email || 'Staff'}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">₱{order.total_amount?.toFixed(2)}</p>
                    {order.promos && (order.promos.voucherCode || order.promos.discountAmount > 0) && (
                      <div className="mt-1 text-xs text-gray-600">
                        {order.promos.voucherCode && (
                          <p>Voucher: <span className="font-medium">{order.promos.voucherCode}</span></p>
                        )}
                        {order.promos.discountAmount > 0 && (
                          <p>Discount applied: <span className="font-medium text-green-700">-₱{Number(order.promos.discountAmount).toFixed(2)}</span></p>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity}x {item.item_name}
                      </span>
                      <span className="font-medium text-gray-900">₱{item.price?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                {order.promos && (order.promos.voucherCode || order.promos.discountAmount > 0) && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-700">
                    <p className="font-semibold mb-1">Promotions</p>
                    {order.promos.voucherCode && (
                      <p>Voucher used: <span className="font-medium">{order.promos.voucherCode}</span></p>
                    )}
                    {order.promos.appliedDealId && (
                      <p>Deal ID: <span className="font-medium">{order.promos.appliedDealId}</span></p>
                    )}
                    {order.promos.originalSubtotal && (
                      <p>Original subtotal: ₱{Number(order.promos.originalSubtotal).toFixed(2)}</p>
                    )}
                    {order.promos.discountAmount > 0 && (
                      <p>Discount: -₱{Number(order.promos.discountAmount).toFixed(2)}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        disabled={updatingOrder === order.id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {updatingOrder === order.id ? 'Updating...' : 'Start Preparing'}
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={updatingOrder === order.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      disabled={updatingOrder === order.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {updatingOrder === order.id ? 'Updating...' : 'Mark as Ready'}
                    </button>
                  )}
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      disabled={updatingOrder === order.id}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      {updatingOrder === order.id ? 'Updating...' : 'Complete Order'}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
