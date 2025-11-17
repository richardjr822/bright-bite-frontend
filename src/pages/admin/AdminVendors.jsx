import React, { useState, useEffect } from 'react';
import { 
  FaStore, 
  FaSearch, 
  FaEye,
  FaChartLine,
  FaUtensils,
  FaStar,
  FaSpinner,
  FaBan,
  FaCheckCircle
} from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaStore className="text-green-600" />
          Vendor Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">Manage all approved vendors and monitor their performance</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="text-4xl text-green-600 animate-spin" />
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaStore className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map(vendor => (
            <div
              key={vendor.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{vendor.business_name || vendor.full_name}</h3>
                  <p className="text-xs text-gray-500">{vendor.email}</p>
                </div>
                {vendor.status === 'active' && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" />
                    Active
                  </span>
                )}
                {vendor.status === 'suspended' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <FaBan className="text-[10px]" />
                    Suspended
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <FaUtensils className="text-blue-600 mx-auto mb-1 text-lg" />
                  <p className="text-xs text-gray-600">Menu Items</p>
                  <p className="text-lg font-bold text-gray-900">{vendor.menu_items_count || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <FaChartLine className="text-purple-600 mx-auto mb-1 text-lg" />
                  <p className="text-xs text-gray-600">Orders</p>
                  <p className="text-lg font-bold text-gray-900">{vendor.orders_count || 0}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <FaStar className="text-amber-600 mx-auto mb-1 text-lg" />
                  <p className="text-xs text-gray-600">Rating</p>
                  <p className="text-lg font-bold text-gray-900">{vendor.rating ? vendor.rating.toFixed(1) : 'N/A'}</p>
                </div>
              </div>

              {/* Actions */}
              <button
                className="w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <FaEye />
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
