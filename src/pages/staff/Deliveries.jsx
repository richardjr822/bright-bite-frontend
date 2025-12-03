import React, { useEffect, useState, useRef } from 'react';
import { FaMapMarkerAlt, FaPhone, FaClock, FaCheckCircle, FaCamera } from 'react-icons/fa';
import { API_BASE } from '../../api';
import { showSuccess, showError } from '../../utils/notifications';
import { formatOrderId } from '../../utils/orderUtils';

const Deliveries = () => {
  const [filter, setFilter] = useState('all');
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofFiles, setProofFiles] = useState({});
  const [uploading, setUploading] = useState(false);
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
          phone: o.customer_phone || 'No phone',
          location: o.delivery_address || 'Campus Location',
          items: Array.isArray(o.items)
            ? o.items.map((it) => `${it.name || it.item_name || 'Item'} x${it.quantity || 1}`)
            : [],
          total: o.total || 0,
          status: o.status === 'in-progress' ? 'in-transit' : (o.status || 'pending'),
          available: !!o.available,
          estimatedTime: o.eta_minutes ? `${o.eta_minutes} mins` : '15-20 mins',
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
    const payloadStatus = newStatus === 'in-transit' ? 'picked-up' : 'delivered';
    
    if (payloadStatus === 'delivered' && !proofFiles[id]) {
      showError('Please upload proof of delivery before marking as delivered');
      return;
    }
    
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('delivery_status', payloadStatus);
      
      if (proofFiles[id]) {
        formData.append('proof_image', proofFiles[id]);
      }
      
      const res = await fetch(`${API_BASE}/staff/deliveries/${id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (res.ok) {
        showSuccess(payloadStatus === 'delivered' ? 'Order marked as delivered!' : 'Delivery started!');
        setProofFiles(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        await fetchDeliveries();
      } else {
        const error = await res.json().catch(() => ({}));
        showError(error.detail || 'Failed to update status');
      }
    } catch (e) {
      console.error('Failed to update status', e);
      showError('Failed to update delivery status');
    } finally {
      setUploading(false);
    }
  };
  
  const handleFileChange = (orderId, file) => {
    setProofFiles(prev => ({ ...prev, [orderId]: file }));
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
                  <p className="text-lg font-bold text-gray-900" title={delivery.orderCode}>
                    {formatOrderId(delivery.orderCode)}
                  </p>
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
                <div className="flex items-center gap-2 text-sm">
                  <FaMapMarkerAlt className="text-teal-600 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{delivery.location || 'No address provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaPhone className="text-teal-600 flex-shrink-0" />
                  <a href={`tel:${delivery.phone}`} className="text-blue-600 hover:text-blue-700 font-medium">
                    {delivery.phone || 'No phone number'}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaClock className="text-teal-600 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">
                    ETA: {delivery.estimatedTime || '15-20 mins'}
                  </span>
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

              <div className="mt-4 space-y-3">
                {delivery.status === 'in-transit' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                      <FaCamera className="text-amber-600" />
                      Proof of Delivery *
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <label className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-green-300 rounded-lg cursor-pointer hover:bg-green-50 transition-colors active:scale-95">
                        <FaCamera className="text-2xl text-green-600 mb-2" />
                        <span className="text-xs font-medium text-gray-700">Take Photo</span>
                        <span className="text-[10px] text-gray-500 mt-1">Use Camera</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileChange(delivery.id, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id={`camera-${delivery.id}`}
                        />
                      </label>
                      
                      <label className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors active:scale-95">
                        <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">Upload Photo</span>
                        <span className="text-[10px] text-gray-500 mt-1">From Gallery</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileChange(delivery.id, e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id={`gallery-${delivery.id}`}
                        />
                      </label>
                    </div>
                    
                    {proofFiles[delivery.id] && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-700 font-medium flex items-center gap-2">
                          <FaCheckCircle /> Photo selected: {proofFiles[delivery.id].name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {(proofFiles[delivery.id].size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3">
                  {delivery.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'in-transit')}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {delivery.available ? 'Claim & Start' : 'Start Delivery'}
                    </button>
                  )}
                  {delivery.status === 'in-transit' && (
                    <button
                      onClick={() => handleStatusUpdate(delivery.id, 'completed')}
                      disabled={!proofFiles[delivery.id] || uploading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Uploading...' : 'Mark as Delivered'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Deliveries;
