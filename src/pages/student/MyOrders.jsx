import React, { useState, useEffect } from 'react';
import {
  FaClipboardList,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaEye,
  FaReceipt
} from 'react-icons/fa';
import { apiClient } from '../../api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vendorsMap, setVendorsMap] = useState({});
  const [reviewModal, setReviewModal] = useState({ open: false, order: null });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchOrdersAndVendors();
  }, []);

  const fetchOrdersAndVendors = async () => {
    try {
      setLoading(true);
      // Fetch vendors to map names
      const vres = await apiClient('/vendor/list');
      const vmap = {};
      (vres?.vendors || []).forEach(v => { vmap[v.id] = v.name; });
      setVendorsMap(vmap);

      // Fetch student's orders
      const ores = await apiClient('/student/orders');
      const rawOrders = ores?.orders || [];

      // Normalize shape for UI
      const normalized = rawOrders.map(o => {
        const items = Array.isArray(o.items) ? o.items.map(it => ({
          name: it.item_name || it.name || 'Item',
          quantity: it.quantity || 1,
          price: Number(it.price || 0),
        })) : [];

        const dbStatus = o.status || 'PENDING_CONFIRMATION';
        const status = dbToUiStatus(dbStatus);

        return {
          id: o.id,
          vendorId: o.restaurant_id,
          vendor: vmap[o.restaurant_id] || 'Vendor',
          items,
          total: Number(o.total || 0),
          status,
          orderDate: o.created_at,
          rating: o.rating ?? null,
        };
      });

      setOrders(normalized);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const dbToUiStatus = (dbStatus) => {
    const map = {
      PENDING_CONFIRMATION: 'pending',
      CONFIRMED: 'pending',
      PAYMENT_PROCESSING: 'pending',
      PREPARING: 'preparing',
      READY_FOR_PICKUP: 'preparing',
      ON_THE_WAY: 'preparing',
      ARRIVING_SOON: 'preparing',
      DELIVERED: 'delivered',
      COMPLETED: 'delivered',
      RATING_PENDING: 'delivered',
      REJECTED: 'cancelled',
    };
    return map[dbStatus] || 'pending';
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: FaClock,
        color: 'yellow',
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Pending'
      },
      preparing: {
        icon: FaTruck,
        color: 'blue',
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Preparing'
      },
      delivered: {
        icon: FaCheckCircle,
        color: 'green',
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Delivered'
      },
      cancelled: {
        icon: FaTimesCircle,
        color: 'red',
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaClipboardList className="text-green-600" />
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">Track and manage your food orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order ID or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'preparing', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaClipboardList className="text-6xl text-gray-300 mx-auto mb-4" />
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
                        <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-full text-xs font-medium`}>
                          <StatusIcon />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.vendor}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₱{order.total}</p>
                      {order.estimatedTime && (
                        <p className="text-xs text-gray-500 mt-1">Est: {order.estimatedTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-900 font-medium">₱{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <FaEye />
                      View Details
                    </button>
                    {order.status === 'delivered' && !order.rating && (
                      <button
                        onClick={() => { setReviewModal({ open: true, order }); setReviewRating(5); setReviewComment(''); }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        Leave a Review
                      </button>
                    )}
                    {order.status === 'delivered' && order.rating && (
                      <div className="flex-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center">
                        Rated: {order.rating}/5
                      </div>
                    )}
                    {order.status === 'delivered' && (
                      <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                        <FaReceipt />
                        Download Receipt
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
                <h2 className="text-xl font-bold text-white">Order Details</h2>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedOrder.id}</h3>
                      <p className="text-gray-600">{selectedOrder.vendor}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-4 py-2 ${getStatusConfig(selectedOrder.status).bg} ${getStatusConfig(selectedOrder.status).text} rounded-full font-medium`}>
                      {getStatusConfig(selectedOrder.status).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedOrder.orderDate)}</p>
                    </div>
                    {selectedOrder.deliveryDate && (
                      <div>
                        <p className="text-gray-500">Delivered At</p>
                        <p className="font-medium text-gray-900">{formatDate(selectedOrder.deliveryDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-900">₱{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₱{selectedOrder.total}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal
          open={reviewModal.open}
          order={reviewModal.order}
          rating={reviewRating}
          setRating={setReviewRating}
          comment={reviewComment}
          setComment={setReviewComment}
          onClose={() => setReviewModal({ open: false, order: null })}
          onSubmit={async () => {
            if (!reviewModal.order) return;
            try {
              await apiClient(`/student/orders/${reviewModal.order.id}/rate`, {
                method: 'POST',
                body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
              });
              // Update local state
              setOrders(prev => prev.map(o => o.id === reviewModal.order.id ? { ...o, rating: reviewRating } : o));
              setReviewModal({ open: false, order: null });
              setReviewComment('');
            } catch (err) {
              console.error('Failed to submit review:', err);
              alert(`Failed to submit review: ${err.message || err}`);
            }
          }}
        />
      </div>
    </div>
  );
}

// Review Modal component could be inlined; adding here for simplicity
export function ReviewModal({ open, order, rating, setRating, comment, setComment, onClose, onSubmit }) {
  if (!open || !order) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-white">Leave a Review</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Vendor</p>
            <p className="font-semibold text-gray-900">{order.vendor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Rating</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center ${rating >= star ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Comment (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Share your experience..."
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
            />
            <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={onSubmit} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
