import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaCheck, FaTimes, FaSpinner, FaUserTie, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFilePdf } from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function AdminPendingVendors() {
  const { fetchStats } = useOutletContext();
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState({});

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/pending-vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch pending vendors');
      const data = await response.json();
      // Normalize combined structure { pending_vendors: [ { vendor_profile, user } ] }
      const origin = API_BASE.replace(/\/api$/, '');
      const list = (data.pending_vendors || []).map(item => {
        const rawPermit = item.vendor_profile?.business_permit_url;
        const permitUrl = rawPermit
          ? (rawPermit.startsWith('http') ? rawPermit : `${origin}${rawPermit}`)
          : null;
        return {
          id: item.user?.id,
          full_name: item.user?.full_name,
          email: item.user?.email,
          business_name: item.vendor_profile?.business_name,
          business_address: item.vendor_profile?.business_address,
          contact_number: item.vendor_profile?.contact_number,
          business_description: item.vendor_profile?.business_description,
          business_permit_url: permitUrl,
          submitted_at: item.user?.created_at
        };
      });
      setPendingVendors(list);
    } catch (err) {
      setError(err.message || 'Failed to load pending vendors');
      console.error('Error fetching pending vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingVendors();
  }, []);

  const handleApprove = async (vendorId) => {
    try {
      setProcessing(prev => ({ ...prev, [vendorId]: 'approving' }));
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/approve-vendor/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve vendor');
      }

      await fetchPendingVendors();
      if (fetchStats) fetchStats();
    } catch (err) {
      setError(err.message);
      console.error('Error approving vendor:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [vendorId]: null }));
    }
  };

  const handleReject = async (vendorId) => {
    try {
      setProcessing(prev => ({ ...prev, [vendorId]: 'rejecting' }));
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/reject-vendor/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject vendor');
      }

      await fetchPendingVendors();
      if (fetchStats) fetchStats();
    } catch (err) {
      setError(err.message);
      console.error('Error rejecting vendor:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [vendorId]: null }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="text-4xl text-orange-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaUserTie className="text-orange-600" />
          Pending Vendor Approvals
        </h1>
        <p className="text-sm text-gray-600 mt-1">Review and approve vendor applications</p>
      </div>

      {pendingVendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaUserTie className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No pending vendor applications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingVendors.map(vendor => (
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Vendor Info Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {vendor.business_name?.charAt(0) || 'V'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{vendor.business_name}</h3>
                    <p className="text-sm text-gray-600">By {vendor.full_name}</p>
                    {vendor.submitted_at && (
                      <p className="text-xs text-gray-400 mt-0.5">Submitted {new Date(vendor.submitted_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                  Pending
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaEnvelope className="text-gray-400" />
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaPhone className="text-gray-400" />
                  <span>{vendor.contact_number || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span>{vendor.business_address || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaBuilding className="text-gray-400" />
                  <span>{vendor.business_address || 'Not provided'}</span>
                </div>
              </div>

              {/* Business Documents */}
              {vendor.business_permit_url ? (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <a
                    href={vendor.business_permit_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <FaFilePdf />
                    View Business Permit
                  </a>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                  No permit file uploaded
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleApprove(vendor.id)}
                  disabled={processing[vendor.id]}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  {processing[vendor.id] === 'approving' ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleReject(vendor.id)}
                  disabled={processing[vendor.id]}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                >
                  {processing[vendor.id] === 'rejecting' ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <FaTimes />
                      Reject
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
