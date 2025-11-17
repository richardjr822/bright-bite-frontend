import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaSpinner, FaUserTie, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFilePdf } from 'react-icons/fa';
import { API_BASE } from '../../api';

const PendingVendors = ({ onUpdate }) => {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState({});

  const fetchPendingVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/pending-vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending vendors');
      }

      const data = await response.json();
      setPendingVendors(data);
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
      const response = await fetch(`${API_BASE}/auth/approve-vendor/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve vendor');
      }

      // Refresh the list
      await fetchPendingVendors();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to approve vendor');
      console.error('Error approving vendor:', err);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[vendorId];
        return newState;
      });
    }
  };

  const handleReject = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor application? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessing(prev => ({ ...prev, [vendorId]: 'rejecting' }));
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/auth/reject-vendor/${vendorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject vendor');
      }

      // Refresh the list
      await fetchPendingVendors();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to reject vendor');
      console.error('Error rejecting vendor:', err);
    } finally {
      setProcessing(prev => {
        const newState = { ...prev };
        delete newState[vendorId];
        return newState;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-green-600 mr-2" />
        <span>Loading pending vendors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (pendingVendors.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-green-600 text-2xl" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No pending vendor applications</h3>
        <p className="text-gray-500">All vendor applications have been processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Pending Vendor Applications</h2>
        <p className="text-sm text-gray-500">Review and approve or reject new vendor applications.</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {pendingVendors.map((vendor) => (
            <li key={vendor.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FaUserTie className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{vendor.full_name}</h3>
                    <div className="mt-1 text-sm text-gray-500 space-y-1">
                      <div className="flex items-center">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        <span>{vendor.email}</span>
                      </div>
                      <div className="flex items-center">
                        <FaBuilding className="mr-2 text-gray-400" />
                        <span>{vendor.organization}</span>
                      </div>
                      {vendor.contact_number && (
                        <div className="flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          <span>{vendor.contact_number}</span>
                        </div>
                      )}
                      {vendor.business_address && (
                        <div className="flex items-start">
                          <FaMapMarkerAlt className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span>{vendor.business_address}</span>
                        </div>
                      )}
                      {vendor.business_description && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Business Description:</p>
                          <p className="mt-1">{vendor.business_description}</p>
                        </div>
                      )}
                      {vendor.business_permit_path && (
                        <div className="mt-2">
                          <a
                            href={`${API_BASE}/storage/${vendor.business_permit_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-green-600 hover:text-green-800"
                          >
                            <FaFilePdf className="mr-1.5 h-4 w-4" />
                            View Business Permit
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(vendor.id)}
                    disabled={processing[vendor.id]}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${processing[vendor.id] === 'approving' ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {processing[vendor.id] === 'approving' ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <FaCheck className="-ml-1 mr-1.5 h-4 w-4" />
                        Approve
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(vendor.id)}
                    disabled={processing[vendor.id]}
                    className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${processing[vendor.id] ? 'opacity-50' : ''}`}
                  >
                    {processing[vendor.id] === 'rejecting' ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <FaTimes className="-ml-1 mr-1.5 h-4 w-4 text-red-500" />
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PendingVendors;
