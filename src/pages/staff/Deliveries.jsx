import React, { useEffect, useState, useRef } from 'react';
import { FaMapMarkerAlt, FaPhone, FaClock, FaCheckCircle } from 'react-icons/fa';
import { API_BASE } from '../../api';

const Deliveries = () => {
  const [filter, setFilter] = useState('all');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchDeliveries();
    // Realtime updates
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const connect = () => {
      if (!user?.id) return;
      const wsUrl = API_BASE.replace('http', 'ws') + `/ws/orders?staffUserId=${user.id}`;
      try {
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onmessage = (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            if (msg.type === 'ping') return;
            if (msg.type === 'order_status' && msg.order_id) {
              const db = msg.db_status;
              setDeliveries(prev => prev.map(d => {
                if (d.id !== msg.order_id) return d;
                // map DB to staff UI status
                if (db === 'ON_THE_WAY') return { ...d, status: 'in-transit' };
                if (db === 'READY_FOR_PICKUP' || db === 'PENDING_CONFIRMATION' || db === 'PREPARING' || db === 'CONFIRMED' || db === 'PAYMENT_PROCESSING') return { ...d, status: 'pending' };
                if (db === 'DELIVERED') return { ...d, status: 'completed' };
                return d;
              }));
              // If delivered, refresh to remove from active list
              if (db === 'DELIVERED') fetchDeliveries();
            }
          } catch (_) {}
        };
        wsRef.current.onclose = () => { setTimeout(connect, 3000); };
        wsRef.current.onerror = () => { try { wsRef.current.close(); } catch (_) {} };
      } catch (_) {}
    };
    connect();
    return () => { try { wsRef.current && wsRef.current.close(); } catch (_) {} };
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      if (!user.id || !token) return;

      const res = await fetch(`${API_BASE}/staff/deliveries/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.deliveries || []).map((o) => ({
          id: o.id,
          orderCode: o.order_code || o.orderCode || '—',
          customer: o.customer_name || 'Customer',
          phone: o.customer_phone || '',
          location: o.delivery_address || '—',
          items: Array.isArray(o.items)
            ? o.items.map((it) => `${it.name || it.item_name || 'Item'} x${it.quantity || 1}`)
            : [],
          total: o.total || 0,
          status: o.status === 'in-progress' ? 'in-transit' : (o.status || 'pending'),
          available: !!o.available,
          estimatedTime: '—',
        }));
        setDeliveries(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch deliveries', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'available') return d.available === true;
    return d.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-transit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const payloadStatus = newStatus === 'in-transit' ? 'picked-up' : 'delivered';
      const res = await fetch(`${API_BASE}/staff/deliveries/${id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: payloadStatus }),
      });
      if (res.ok) { await fetchDeliveries(); }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Deliveries</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your active delivery orders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2">
          {['all', 'available', 'pending', 'in-transit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`
                flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === tab
                  ? 'bg-teal-50 text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-600">
            Loading...
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FaCheckCircle className="mx-auto text-5xl text-gray-300 mb-4" />
            <p className="text-gray-500">No {filter !== 'all' ? filter : ''} deliveries at the moment</p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">{delivery.orderCode}</p>
                  <p className="text-sm text-gray-600">{delivery.customer}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                    delivery.status
                  )}`}
                >
                  {delivery.available ? 'Available' : (delivery.status === 'in-transit' ? 'In Transit' : 'Pending')}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="text-teal-600" />
                  <span>{delivery.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone className="text-teal-600" />
                  <span>{delivery.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaClock className="text-teal-600" />
                  <span>ETA: {delivery.estimatedTime}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <ul className="text-sm text-gray-600 mb-3 space-y-1">
                  {delivery.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
                <p className="text-sm font-bold text-gray-900">Total: ₱{delivery.total}</p>
              </div>

              <div className="flex gap-3 mt-4">
                {delivery.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(delivery.id, 'in-transit')}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors"
                  >
                    {delivery.available ? 'Claim & Start' : 'Start Delivery'}
                  </button>
                )}
                {delivery.status === 'in-transit' && (
                  <button
                    onClick={() => handleStatusUpdate(delivery.id, 'completed')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Deliveries;
