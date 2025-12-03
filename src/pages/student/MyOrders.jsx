import React, { useState, useEffect } from 'react';
import {
  FaClipboardList,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaEye,
  FaReceipt,
  FaStar,
  FaStore,
  FaCalendarAlt,
  FaArrowRight,
  FaUtensils,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaBoxOpen,
  FaTimes,
  FaHistory,
  FaChartLine,
  FaUser,
  FaDownload,
  FaPhone,
  FaMapMarkerAlt,
  FaMotorcycle
} from 'react-icons/fa';
import { apiClient, API_BASE } from '../../api';
import { formatOrderId } from '../../utils/orderUtils';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [vendorsMap, setVendorsMap] = useState({});
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, order: null });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [refundModal, setRefundModal] = useState({ open: false, order: null });
  const [receiptModal, setReceiptModal] = useState({ open: false, order: null });

  useEffect(() => {
    fetchOrdersAndVendors();
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        if (selectedOrder?.id) {
          const res = await apiClient(`/student/orders/${selectedOrder.id}`);
          if (active) setSelectedOrderDetails(res.order || null);
        } else {
          setSelectedOrderDetails(null);
        }

      } catch (_) {
        if (active) setSelectedOrderDetails(null);
      }
    })();
    return () => { active = false; };
  }, [selectedOrder?.id]);

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
          paymentMethod: (o.payment_method || '').toLowerCase(),
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

  // Format order number to short readable format (e.g., #001)
  const formatOrderNumber = (orderId, index) => {
    // Use last 3-4 digits of order ID or fallback to index
    if (!orderId) return `#${String(index + 1).padStart(3, '0')}`;
    const idStr = String(orderId);
    // If it's a UUID or long string, extract numeric portion or use last 4 chars
    const numericPart = idStr.replace(/[^0-9]/g, '');
    if (numericPart.length >= 3) {
      return `#${numericPart.slice(-4).padStart(4, '0')}`;
    }
    return `#${idStr.slice(-4).toUpperCase()}`;
  };

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

  // Calculate order stats
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Refined Header */}
      <div className="relative bg-white border-b border-slate-200/60">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100/50"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl flex items-center justify-center shadow-sm">
                <FaClipboardList className="text-lg text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Orders</h1>
                <p className="text-slate-500 text-sm">Track and manage your food orders</p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-3">
              <div className="bg-slate-50 rounded-xl px-5 py-3 text-center border border-slate-200">
                <p className="text-xl font-semibold text-slate-900">{orderStats.total}</p>
                <p className="text-xs text-slate-500 font-medium">Total Orders</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-5 py-3 text-center border border-slate-200">
                <p className="text-xl font-semibold text-slate-900">₱{orderStats.totalSpent.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-medium">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Active Order Tracking Section */}
        {orders.filter(o => ['pending', 'preparing'].includes(o.status)).length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FaMotorcycle className="text-teal-600" />
              Active Orders
            </h2>
            <div className="space-y-3">
              {orders.filter(o => ['pending', 'preparing'].includes(o.status)).map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <div 
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="bg-white border border-teal-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {order.vendor.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{order.vendor}</p>
                          <p className="text-xs text-slate-500">{formatOrderNumber(order.id, 0)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-full text-xs font-semibold`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    {/* Order Tracking Progress */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        {[
                          { step: 'pending', label: 'Confirmed', icon: FaCheckCircle },
                          { step: 'preparing', label: 'Preparing', icon: FaUtensils },
                          { step: 'on_the_way', label: 'On the Way', icon: FaTruck },
                          { step: 'delivered', label: 'Delivered', icon: FaMapMarkerAlt }
                        ].map((step, idx) => {
                          const isActive = 
                            (step.step === 'pending' && ['pending', 'preparing', 'delivered'].includes(order.status)) ||
                            (step.step === 'preparing' && ['preparing', 'delivered'].includes(order.status)) ||
                            (step.step === 'on_the_way' && order.status === 'preparing') ||
                            (step.step === 'delivered' && order.status === 'delivered');
                          const StepIcon = step.icon;
                          return (
                            <div key={step.step} className="flex flex-col items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isActive ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'
                              }`}>
                                <StepIcon className="text-sm" />
                              </div>
                              <span className={`text-[10px] mt-1 ${isActive ? 'text-teal-600 font-medium' : 'text-slate-400'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Progress Line */}
                      <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 -z-10">
                        <div 
                          className="h-full bg-teal-500 transition-all duration-500"
                          style={{ 
                            width: order.status === 'pending' ? '0%' : 
                                   order.status === 'preparing' ? '66%' : 
                                   order.status === 'delivered' ? '100%' : '33%' 
                          }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <span className="text-sm text-slate-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} • ₱{order.total.toLocaleString()}
                      </span>
                      <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
                        <FaEye className="text-[10px]" />
                        Tap to view details
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Filter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { status: 'pending', label: 'Pending', icon: FaHourglassHalf, color: 'amber', count: orderStats.pending },
            { status: 'preparing', label: 'Preparing', icon: FaUtensils, color: 'slate', count: orderStats.preparing },
            { status: 'delivered', label: 'Delivered', icon: FaCheckCircle, color: 'teal', count: orderStats.delivered },
            { status: 'cancelled', label: 'Cancelled', icon: FaTimesCircle, color: 'rose', count: orders.filter(o => o.status === 'cancelled').length }
          ].map(item => (
            <button
              key={item.status}
              onClick={() => setFilter(item.status)}
              className={`bg-white rounded-xl p-4 transition-all duration-200 border ${
                filter === item.status 
                  ? 'border-slate-900 shadow-sm ring-1 ring-slate-900/5' 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2.5 ${
                item.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                item.color === 'slate' ? 'bg-slate-100 text-slate-600' :
                item.color === 'teal' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-500'
              }`}>
                <item.icon className="text-lg" />
              </div>
              <p className="text-2xl font-semibold text-slate-900">{item.count}</p>
              <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by order ID or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 focus:bg-white transition-all text-sm"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {['all', 'pending', 'preparing', 'delivered', 'cancelled'].map(status => {
                const icons = { all: FaHistory, pending: FaClock, preparing: FaTruck, delivered: FaCheckCircle, cancelled: FaTimesCircle };
                const Icon = icons[status];
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      filter === status
                        ? 'bg-[#0d3d23] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="text-xs" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse">
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-14 bg-slate-100 rounded-lg mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-slate-100 rounded-lg flex-1"></div>
                  <div className="h-10 bg-slate-100 rounded-lg flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-5 bg-slate-100 rounded-xl flex items-center justify-center">
              <FaBoxOpen className="text-2xl text-slate-400" />
            </div>
            <p className="text-lg font-medium text-slate-900 mb-1">No orders found</p>
            <p className="text-slate-500 text-sm mb-5">
              {filter !== 'all' ? `No ${filter} orders yet` : 'Start ordering from campus vendors!'}
            </p>
            <a 
              href="/campus-canteen" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d3d23] text-white rounded-lg font-medium text-sm hover:bg-[#1a5d3a] transition-all"
            >
              <FaStore /> Browse Canteen
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order, idx) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const statusColors = {
                pending: 'bg-amber-400',
                preparing: 'bg-slate-400',
                delivered: 'bg-teal-500',
                cancelled: 'bg-rose-400'
              };

              return (
                <div
                  key={order.id}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  {/* Status indicator */}
                  <div className={`h-1 ${statusColors[order.status] || statusColors.pending}`} />
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {/* Vendor Avatar */}
                        <div className="w-11 h-11 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-lg flex items-center justify-center text-white text-base font-semibold">
                          {order.vendor.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 mb-1">
                            <h3 className="font-medium text-slate-900">{order.vendor}</h3>
                            <span className="text-sm font-semibold text-[#0d3d23]">{formatOrderNumber(order.id, idx)}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${statusConfig.bg} ${statusConfig.text} rounded text-xs font-medium`}>
                              <StatusIcon className="text-[9px]" />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <FaCalendarAlt className="text-slate-400 text-[10px]" />
                            <span>{formatDate(order.orderDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-slate-900">₱{order.total.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {order.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-700">
                            <span className="text-slate-900 font-medium">{item.quantity}×</span> {item.name}
                          </span>
                        ))}
                        {order.items.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-1.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 px-3 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <FaEye className="text-xs" />
                        View Details
                      </button>
                      {order.paymentMethod === 'wallet' ? (
                        <button
                          onClick={() => setRefundModal({ open: true, order })}
                          className="flex-1 px-3 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-slate-300 transition-all font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <FaMoneyBillWave className="text-xs" />
                          Request Refund
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 text-slate-400 rounded-lg font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                          title="Only wallet payments are refundable"
                        >
                          <FaMoneyBillWave className="text-xs" />
                          Refund Unavailable
                        </button>
                      )}
                      {order.status === 'delivered' && !order.rating && (
                        <button
                          onClick={() => { setReviewModal({ open: true, order }); setReviewRating(5); setReviewComment(''); }}
                          className="flex-1 px-3 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <FaStar className="text-xs" />
                          Rate Order
                        </button>
                      )}
                      {order.status === 'delivered' && order.rating && (
                        <div className="flex-1 px-3 py-2.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border border-amber-200">
                          <FaStar className="text-xs" />
                          Rated {order.rating}/5
                        </div>
                      )}
                      {order.status === 'delivered' && (
                        <button onClick={() => setReceiptModal({ open: true, order })} className="px-3 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm flex items-center justify-center">
                          <FaReceipt className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] px-5 py-5 relative">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
                >
                  <FaTimes className="text-sm" />
                </button>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-white text-xl font-semibold">
                    {selectedOrder.vendor.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">{selectedOrder.vendor}</h2>
                      <span className="px-2 py-0.5 bg-white/20 rounded text-white text-xs font-semibold" title={selectedOrderDetails?.order_code}>
                        {selectedOrderDetails?.order_code ? formatOrderId(selectedOrderDetails.order_code) : formatOrderNumber(selectedOrder.id, 0)}
                      </span>
                    </div>
                    <p className="text-green-200/80 text-xs">{formatDate(selectedOrder.orderDate)}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 overflow-y-auto max-h-[60vh]">
                {/* Status and Date */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${getStatusConfig(selectedOrder.status).bg} flex items-center justify-center`}>
                      {React.createElement(getStatusConfig(selectedOrder.status).icon, { className: `text-base ${getStatusConfig(selectedOrder.status).text}` })}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${getStatusConfig(selectedOrder.status).text}`}>{getStatusConfig(selectedOrder.status).label}</p>
                      <p className="text-xs text-slate-500">{formatDate(selectedOrder.orderDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-slate-900">₱{selectedOrder.total.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.items.length} items</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-5">
                  <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2 text-sm">
                    <FaUtensils className="text-slate-500" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-200 rounded-md flex items-center justify-center text-slate-700 font-semibold text-xs">
                            {item.quantity}×
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-500">₱{item.price} each</p>
                          </div>
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">₱{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-slate-50 rounded-lg p-4 mb-5">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="text-slate-900">₱{selectedOrder.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Fee</span>
                      <span className="text-teal-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold pt-2.5 border-t border-slate-200">
                      <span className="text-slate-900">Total Paid</span>
                      <span className="text-slate-900">₱{selectedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Staff Info */}
                {selectedOrderDetails?.delivery_staff && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <FaTruck className="text-blue-600" />
                      Delivery Staff
                    </h4>
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedOrderDetails.delivery_staff.profile_photo_url 
                          ? `${API_BASE.replace(/\/api$/, '')}${selectedOrderDetails.delivery_staff.profile_photo_url}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedOrderDetails.delivery_staff.full_name || 'Staff')}&background=3b82f6&color=fff`
                        } 
                        alt={selectedOrderDetails.delivery_staff.full_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-200"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{selectedOrderDetails.delivery_staff.full_name || 'Delivery Staff'}</p>
                        {selectedOrderDetails.delivery_staff.phone && (
                          <a href={`tel:${selectedOrderDetails.delivery_staff.phone}`} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <FaPhone className="text-xs" />
                            {selectedOrderDetails.delivery_staff.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Proof of Delivery */}
                {selectedOrderDetails?.proof_of_delivery_url && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      Proof of Delivery
                    </h4>
                    <img 
                      src={`${API_BASE.replace(/\/api$/, '')}${selectedOrderDetails.proof_of_delivery_url}`}
                      alt="Proof of delivery"
                      className="w-full rounded-lg border border-green-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(`${API_BASE.replace(/\/api$/, '')}${selectedOrderDetails.proof_of_delivery_url}`, '_blank')}
                    />
                    <p className="text-xs text-green-700 mt-2 text-center">Click to view full size</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {selectedOrder.status === 'delivered' && !selectedOrder.rating && (
                    <button
                      onClick={() => { setSelectedOrder(null); setReviewModal({ open: true, order: selectedOrder }); setReviewRating(5); setReviewComment(''); }}
                      className="flex-1 px-4 py-3 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <FaStar className="text-xs" />
                      Rate This Order
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
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

        <RefundModal
          open={refundModal.open}
          order={refundModal.order}
          onClose={() => setRefundModal({ open: false, order: null })}
          onSubmitted={(res) => {
            setRefundModal({ open: false, order: null });
            if (res?.status === 'APPROVED' && res?.method === 'wallet') {
              try { window.dispatchEvent(new CustomEvent('wallet:balance-updated')); } catch (_) {}
            }
          }}
        />

        <ReceiptModal
          open={receiptModal.open}
          order={receiptModal.order}
          onClose={() => setReceiptModal({ open: false, order: null })}
        />
      </div>
    </div>
  );
}

function RefundModal({ open, order, onClose, onSubmitted }) {
  const [issue, setIssue] = useState('NOT_DELIVERED');
  const [description, setDescription] = useState('');
  const [delayMinutes, setDelayMinutes] = useState('');
  const [initiatedBy, setInitiatedBy] = useState('');
  const [items, setItems] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setIssue('NOT_DELIVERED');
      setDescription('');
      setDelayMinutes('');
      setInitiatedBy('');
      setItems('');
    }
  }, [open]);

  if (!open || !order) return null;

  const showDelay = issue === 'DELIVERED_LATE' || issue === 'LATE' || issue === 'DELAY';
  const showInitiator = issue === 'CANCELED' || issue === 'CANCELLED';
  const showItems = issue === 'WRONG_ITEMS' || issue === 'MISSING_ITEMS' || issue === 'WRONG_ITEM' || issue === 'MISSING_ITEM';

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        issue,
        description,
        delayMinutes: showDelay ? parseInt(delayMinutes || '0', 10) : undefined,
        initiatedBy: showInitiator ? initiatedBy : undefined,
        items: showItems ? items.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      };
      const res = await apiClient(`/student/orders/${order.id}/refunds`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onSubmitted && onSubmitted(res);
    } catch (err) {
      alert(`Failed to request refund: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-slate-900 px-5 py-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
          >
            <FaTimes className="text-sm" />
          </button>
          <div className="w-12 h-12 mx-auto mb-2.5 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <FaMoneyBillWave className="text-lg text-emerald-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Request a Refund</h2>
          <p className="text-slate-400 text-sm mt-0.5">{order.vendor}</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Issue</label>
            <select
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400"
            >
              <option value="NOT_DELIVERED">Order not delivered</option>
              <option value="DELIVERED_LATE">Delivered late</option>
              <option value="WRONG_ITEMS">Wrong items received</option>
              <option value="MISSING_ITEMS">Missing items</option>
              <option value="QUALITY">Food quality issues</option>
              <option value="CANCELED">Order canceled</option>
            </select>
          </div>

          {showDelay && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Delay (minutes)</label>
              <input
                type="number"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400"
                placeholder="e.g., 35"
                min="0"
              />
            </div>
          )}

          {showInitiator && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Who canceled?</label>
              <select
                value={initiatedBy}
                onChange={(e) => setInitiatedBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400"
              >
                <option value="">Select</option>
                <option value="restaurant">Restaurant</option>
                <option value="rider">Delivery partner</option>
                <option value="customer">Me (customer)</option>
              </select>
            </div>
          )}

          {showItems && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Affected items (comma-separated)</label>
              <input
                type="text"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400"
                placeholder="e.g., Burger, Fries"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400"
              placeholder="Briefly describe the issue"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">Cancel</button>
            <button onClick={submit} disabled={submitting} className="flex-1 px-4 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ open, order, onClose }) {
  if (!open || !order) return null;

  const formatMoneyUI = (v) => `₱${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatMoneyPdf = (v) => `PHP ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const loadJsPDF = () => new Promise((resolve) => {
    const existing = (window.jspdf && window.jspdf.jsPDF) ? true : false;
    if (existing) return resolve(window.jspdf.jsPDF);
    const prior = document.querySelector('script[data-jspdf]');
    if (prior) {
      prior.addEventListener('load', () => resolve(window.jspdf?.jsPDF || null), { once: true });
      prior.addEventListener('error', () => resolve(null), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
    s.async = true;
    s.defer = true;
    s.setAttribute('data-jspdf', '1');
    s.onload = () => resolve(window.jspdf?.jsPDF || null);
    s.onerror = () => resolve(null);
    document.body.appendChild(s);
  });

  const handleDownload = async () => {
    const JsPDF = await loadJsPDF();
    if (!JsPDF) {
      alert('Failed to load PDF generator. Please try again.');
      return;
    }
    const doc = new JsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin + 10;

    doc.setFontSize(16);
    doc.text('BrightBite Receipt', margin, y);
    doc.setFontSize(11);
    y += 22;
    doc.text(`Order ID: ${order.id}`, margin, y); y += 16;
    doc.text(`Vendor: ${order.vendor}`, margin, y); y += 16;
    doc.text(`Date: ${new Date(order.orderDate).toLocaleString()}`, margin, y); y += 16;
    doc.text(`Payment: ${(order.paymentMethod || '').toUpperCase()}`, margin, y); y += 24;

    doc.setFontSize(12);
    doc.text('Items', margin, y);
    doc.text('Qty', 360, y);
    doc.text('Price', 500, y, { align: 'right' });
    y += 8;
    doc.line(margin, y, 555, y); y += 14;

    order.items.forEach((it) => {
      const name = `${it.name}`;
      const qty = `${it.quantity}`;
      const lineTotal = Number(it.price || 0) * Number(it.quantity || 1);
      doc.text(name, margin, y);
      doc.text(qty, 360, y);
      doc.text(formatMoneyPdf(lineTotal), 500, y, { align: 'right' });
      y += 16;
    });

    y += 6; doc.line(margin, y, 555, y); y += 20;
    doc.setFontSize(13);
    doc.text('Total:', 440, y);
    doc.text(formatMoneyPdf(order.total), 500, y, { align: 'right' });

    doc.save(`receipt-${order.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] px-5 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
          >
            <FaTimes className="text-sm" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-white text-xl font-semibold">
              {order.vendor?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Receipt Preview</h2>
              <p className="text-green-200/80 text-xs">{new Date(order.orderDate).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <p className="text-sm text-slate-500">Order ID</p>
            <p className="font-semibold text-slate-900 text-sm break-all">{order.id}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm font-medium text-slate-600 border-b border-slate-200 pb-2">
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Total</span>
          </div>
          <div className="divide-y divide-slate-100">
            {order.items.map((it, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 py-2 text-sm">
                <span className="text-slate-800">{it.name}</span>
                <span className="text-center text-slate-700">{it.quantity}</span>
                <span className="text-right text-slate-900">{formatMoneyUI((it.price || 0) * (it.quantity || 1))}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Payment</span>
            <span className="font-semibold text-slate-800">{(order.paymentMethod || '').toUpperCase()}</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-base font-semibold">
            <span className="text-slate-900">Total Paid</span>
            <span className="text-slate-900">{formatMoneyUI(order.total)}</span>
          </div>

          <div className="mt-5 flex gap-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm">Close</button>
            <button onClick={handleDownload} className="flex-1 px-4 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm flex items-center justify-center gap-2">
              <FaDownload className="text-xs" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Review Modal - Refined Theme
export function ReviewModal({ open, order, rating, setRating, comment, setComment, onClose, onSubmit }) {
  if (!open || !order) return null;
  
  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-5 py-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all"
          >
            <FaTimes className="text-sm" />
          </button>
          <div className="w-12 h-12 mx-auto mb-2.5 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <FaStar className="text-lg text-amber-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Rate Your Experience</h2>
          <p className="text-slate-400 text-sm mt-0.5">{order.vendor}</p>
        </div>
        
        <div className="p-5 space-y-5">
          {/* Star Rating */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-3">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-11 h-11 rounded-lg transition-all duration-200 ${
                    rating >= star 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <FaStar className="mx-auto text-base" />
                </button>
              ))}
            </div>
            <p className={`text-sm font-medium ${
              rating >= 4 ? 'text-teal-600' : rating >= 3 ? 'text-amber-600' : 'text-rose-500'
            }`}>
              {ratingLabels[rating]}
            </p>
          </div>
          
          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Share your experience (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="What did you like or dislike about your order?"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 transition-all resize-none text-sm"
              rows={3}
            />
            <p className="text-xs text-slate-400 text-right mt-1">{comment.length}/500</p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={onSubmit} 
              className="flex-1 px-4 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm flex items-center justify-center gap-1.5"
            >
              <FaStar className="text-xs" />
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
