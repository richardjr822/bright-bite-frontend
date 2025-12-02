import React, { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaClock,
  FaStore,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaUser
} from 'react-icons/fa';
import { API_BASE } from '../../api';

// Status constants
export const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  REJECTED: 'REJECTED',
  CONFIRMED: 'CONFIRMED',
  PAYMENT_PROCESSING: 'PAYMENT_PROCESSING',
  PREPARING: 'PREPARING',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  ON_THE_WAY: 'ON_THE_WAY',
  ARRIVING_SOON: 'ARRIVING_SOON',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  RATING_PENDING: 'RATING_PENDING'
};

// Backend adapters
const api = {
    createOrder: async (payload) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/student/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      try {
            const err = await res.json();
            const detail = err?.detail;
            if (detail && typeof detail === 'object') {
              const e = new Error(detail?.message || 'Failed to create order');
              e.code = detail?.code;
              e.status = detail?.status;
              throw e;
            }
            throw new Error(detail || err?.message || 'Failed to create order');
      } catch (_) {
        throw new Error('Failed to create order');
      }
    }
    const data = await res.json();
    return data.order;
  },
    // Phone verification endpoints removed; ordering no longer gated by phone confirmation.
  getOrder: async (orderId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/student/orders/${orderId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error('Failed to fetch order');
    const data = await res.json();
    return data.order;
  },
  cancelOrder: async (orderId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/student/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) {
      try {
        const err = await res.json();
        throw new Error(err?.detail || err?.message || 'Failed to cancel order');
      } catch (_) {
        throw new Error('Failed to cancel order');
      }
    }
    return true;
  }
};

// Hook controlling order lifecycle
export const useOrderLifecycle = () => {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const wsRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const startOrder = useCallback(async (payload) => {
    setError(null);
    let created;
    try {
      created = await api.createOrder(payload);
    } catch (e) {
      setError(e);
      return;
    }

    // If paying by wallet, debit AFTER order creation. If debit fails, cancel the order.
    try {
      const payMethod = (payload?.paymentMethod || payload?.payment_method || '').toLowerCase();
      if (payMethod === 'wallet') {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        const descr = `Order from ${payload?.restaurantName || 'Vendor'}`;
        const debitRes = await fetch(`${API_BASE}/wallet/debit`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ amount: payload.total, description: descr, userId: user.id, order_id: created.id })
        });
        if (!debitRes.ok) {
          const errData = await debitRes.json().catch(() => ({}));
          throw new Error(errData.detail || errData.message || 'Wallet payment failed');
        }
        try { window.dispatchEvent(new CustomEvent('wallet:balance-updated')); } catch (_) {}
      }
    } catch (err) {
      try { await api.cancelOrder(created.id); } catch (_) {}
      setError(err);
      toast.error(err?.message || 'Wallet payment failed');
      return;
    }

    // Persist chosen serviceType locally for UI logic (pickup vs delivery)
    if (payload && payload.serviceType) {
      created.serviceType = payload.serviceType;
    }
    setOrder(created);
    setStatus(created.status || ORDER_STATUS.PENDING_CONFIRMATION);

    // WebSocket primary channel; reconnection with backoff
    const connect = () => {
      if (!user?.id) return;
      try {
        const wsUrl = API_BASE.replace('http', 'ws') + `/ws/orders?userId=${user.id}`;
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen = () => {
          // Stop polling fallback if active
          if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        };
        wsRef.current.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg.type === 'ping') return; // heartbeat
            if (msg.type === 'points_awarded' && msg.order_id === created.id) {
              const pts = msg.reward_points || msg.points || 0;
              toast.success(`You've earned ${pts} reward points!`);
            }
            if (msg.type === 'order_status' && msg.order_id === created.id) {
              if (msg.staff) {
                setOrder(prev => prev ? { ...prev, delivery_staff: msg.staff } : prev);
              }
              const dbStatus = msg.db_status;
              if (dbStatus && ORDER_STATUS[dbStatus]) {
                setStatus(dbStatus);
                if (dbStatus === ORDER_STATUS.ARRIVING_SOON) {
                  toast(`Your courier is arriving now — please be ready to claim your order.`, { icon: '🚴' });
                }
              } else {
                // Map ui_status to db status if needed
                const ui = msg.ui_status;
                const uiMap = {
                  pending: ORDER_STATUS.PENDING_CONFIRMATION,
                  preparing: ORDER_STATUS.PREPARING,
                  ready: ORDER_STATUS.READY_FOR_PICKUP,
                  completed: ORDER_STATUS.COMPLETED,
                  cancelled: ORDER_STATUS.REJECTED,
                };
                if (ui && uiMap[ui]) setStatus(uiMap[ui]);
              }
              if ([ORDER_STATUS.REJECTED, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED, ORDER_STATUS.RATING_PENDING].includes(status)) {
                if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
              }
            }
          } catch (_) {}
        };
        wsRef.current.onclose = () => {
          // Start fallback polling if not terminal
          if (order && ![ORDER_STATUS.REJECTED, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED, ORDER_STATUS.RATING_PENDING].includes(status)) {
            if (!pollRef.current) startPolling(created.id);
            // attempt reconnection
            setTimeout(() => connect(), 3000);
          }
        };
        wsRef.current.onerror = () => {
          if (!pollRef.current) startPolling(created.id);
        };
      } catch (e) {
        if (!pollRef.current) startPolling(created.id);
      }
    };

    const startPolling = (id) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const latest = await api.getOrder(id);
          setStatus(latest.status);
          if (latest.delivery_staff) {
            setOrder(prev => prev ? { ...prev, delivery_staff: latest.delivery_staff } : prev);
          }
          if ([ORDER_STATUS.REJECTED, ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED, ORDER_STATUS.RATING_PENDING].includes(latest.status)) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } catch (_) {}
      }, 3000);
    };

    connect();
  }, []);

  const setManualStatus = useCallback(async (next) => {
    if (!order) return; // No direct update API for students; local override
    setStatus(next);
  }, [order]);

  const dismissOrder = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (_) {}
      wsRef.current = null;
    }
    setOrder(null);
    setStatus(null);
    setEtaMinutes(null);
    setError(null);
  }, []);

  return {
    order,
    status,
    etaMinutes,
    // rider removed
    error,
    startOrder,
    setManualStatus,
    dismissOrder
  };
};

// UI component
const statusConfig = {
  PENDING_CONFIRMATION: {
    label: 'Waiting for Restaurant Confirmation',
    desc: 'Please wait while we confirm your order with the restaurant.'
  },
  REJECTED: {
    label: 'Order Rejected',
    desc: 'The restaurant could not accept your order. You were not charged.'
  },
  CONFIRMED: {
    label: 'Order Accepted',
    desc: 'Restaurant accepted your order. Processing payment...'
  },
  PAYMENT_PROCESSING: {
    label: 'Processing Payment',
    desc: 'Finalizing payment. Do not close the app.'
  },
  PREPARING: {
    label: 'Preparing Your Order',
    desc: 'The restaurant is preparing your food.'
  },
  READY_FOR_PICKUP: {
     label: 'Ready for Pickup',
     desc: 'Order packed and ready for handoff.'
  },
  ON_THE_WAY: {
     label: 'Out for Delivery',
     desc: 'Your order is on its way.'
  },
  ARRIVING_SOON: {
     label: 'Arriving Soon',
     desc: 'Your order is nearing your location.'
  },
  DELIVERED: {
    label: 'Delivered',
    desc: 'Order delivered. Thank you!'
  },
  COMPLETED: {
    label: 'Completed',
    desc: 'Order flow complete.'
  },
  RATING_PENDING: {
    label: 'Rate Your Order',
    desc: 'Please rate your experience.'
  }
};

export const OrderTracking = ({
  order,
  status,
  etaMinutes,
  onClose,
  onRate
}) => {
  if (!order || !status) return null;

  const cfg = statusConfig[status];
  const [userInfo, setUserInfo] = useState({ full_name: '', phone: '' });

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE}/student/profile`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.user) {
          setUserInfo({ full_name: data.user.full_name || '', phone: data.user.phone || '' });
        }
      } catch (_) {
        /* ignore */
      }
    };
    fetchProfile();
    return () => { active = false; };
  }, [order?.id]);
  const [canceling, setCanceling] = useState(false);

  const handleCancel = async () => {
    if (canceling) return;
    const confirmed = window.confirm('Cancel this order? You can only cancel while waiting for confirmation.');
    if (!confirmed) return;
    try {
      setCanceling(true);
      await api.cancelOrder(order.id);
      onClose();
    } catch (e) {
      alert(e?.message || 'Failed to cancel order');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <FaStore className="text-green-600 text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
              <p className="text-xs text-gray-500">ID: {order.id}</p>
            </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              {status === ORDER_STATUS.REJECTED ? (
                <FaExclamationTriangle className="text-red-500 text-xl" />
              ) : [ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.ARRIVING_SOON].includes(status) ? (
                <FaUser className="text-green-600 text-xl" />
              ) : status === ORDER_STATUS.DELIVERED || status === ORDER_STATUS.COMPLETED ? (
                <FaCheckCircle className="text-green-600 text-xl" />
              ) : (
                <FaClock className="text-green-600 text-xl animate-pulse" />
              )}
            </div>
                      {/* User Delivery Details */}
                      <div className="border rounded-xl p-4 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <FaUser /> {order?.serviceType === 'delivery' ? 'Delivery To' : order?.serviceType === 'pickup' ? 'Pickup By' : 'Customer'}
                        </h4>
                        <p className="text-sm text-gray-700"><span className="font-medium">Name:</span> {userInfo.full_name || '—'}</p>
                        <p className="text-sm text-gray-700"><span className="font-medium">Phone:</span> {userInfo.phone || '—'}</p>
                        {(!userInfo.phone) && (
                          <p className="text-xs text-gray-500 mt-2">No phone number on file. Add one in Settings for easier coordination.</p>
                        )}
                      </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{cfg.label}</h3>
              <p className="text-sm text-gray-600">{cfg.desc}</p>
              {etaMinutes && status === ORDER_STATUS.PREPARING && (
                <p className="mt-2 text-sm text-gray-700">
                  Est. ready in: <span className="font-medium">{etaMinutes} min</span>
                </p>
              )}
            </div>
          </div>

          {/* Delivery staff info for student */}
          {order?.delivery_staff && (
            <div className="border rounded-xl p-4 bg-blue-50 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex-shrink-0">
                {order.delivery_staff.profile_photo_url ? (
                  <img
                    src={`${API_BASE.replace(/\/api$/, '')}${order.delivery_staff.profile_photo_url}`}
                    alt="Delivery Staff"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="w-full h-full p-3 text-blue-500" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-700 mb-0.5">Delivery Staff</h4>
                <p className="text-sm text-blue-800"><span className="font-medium">Name:</span> {order.delivery_staff.full_name || '—'}</p>
                {order.delivery_staff.phone && (
                  <p className="text-sm text-blue-800"><span className="font-medium">Phone:</span> {order.delivery_staff.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Arrival/Claim notice */}
          {status === ORDER_STATUS.ARRIVING_SOON && (
            <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                Your delivery staff is here or arriving shortly. Please be ready to claim your order.
              </p>
            </div>
          )}
          {status === ORDER_STATUS.READY_FOR_PICKUP && order?.serviceType === 'pickup' && (
            <div className="rounded-xl p-4 bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">Your order is ready at the counter. Please claim it.</p>
            </div>
          )}

          {/* Items */}
          <div className="border rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {order.items.map(i => (
                <li key={i.id} className="flex justify-between">
                  <span>{i.name} × {i.quantity}</span>
                  <span className="font-medium">₱{(i.price * i.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between mt-3 pt-3 border-t text-sm font-bold">
              <span>Total</span>
              <span className="text-green-600">₱{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Rating Prompt */}
          {status === ORDER_STATUS.RATING_PENDING && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-gray-800 mb-3">How was your order?</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(r => (
                  <button
                    key={r}
                    onClick={() => onRate(r)}
                    className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:bg-yellow-100 text-sm font-medium"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          {status === ORDER_STATUS.PENDING_CONFIRMATION && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${canceling ? 'bg-red-300 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
              {canceling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
          >
            Close
          </button>
          {status === ORDER_STATUS.COMPLETED && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Done
            </button>
          )}
          {status === ORDER_STATUS.RATING_PENDING && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Integration helper:
// 1. Collect cart + orderDetails in checkout.
// 2. On Place Order: startOrder({
//      restaurantId: selectedVendor.id,
//      paymentMethod: orderDetails.paymentMethod,
//      items: cart.map(c => ({ id: c.id, name: c.name, quantity: c.quantity, price: c.price })),
//      total: cart.reduce((t, i) => t + i.price * i.quantity, 0)
//    });
// 3. Render <OrderTracking ... /> while status active.