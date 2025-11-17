import React, { useState, useEffect } from 'react';
import { 
  FaTags, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaPercentage,
  FaDollarSign,
  FaStore,
  FaSpinner
} from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function AdminDeals() {
  const [deals, setDeals] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendor, setFilterVendor] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [formData, setFormData] = useState({
    vendor_id: '',
    title: '',
    description: '',
    discount: '',
    min_spend: 0,
    expiry: ''
  });

  useEffect(() => {
    fetchDeals();
    fetchVendors();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/deals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDeal 
        ? `${API_BASE}/admin/deals/${editingDeal.id}`
        : `${API_BASE}/admin/deals`;
      
      const response = await fetch(url, {
        method: editingDeal ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchDeals();
        handleCloseModal();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save deal');
      }
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Failed to save deal');
    }
  };

  const handleDelete = async (dealId) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/admin/deals/${dealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchDeals();
      } else {
        alert('Failed to delete deal');
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      alert('Failed to delete deal');
    }
  };

  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setFormData({
      vendor_id: deal.vendor_id,
      title: deal.title,
      description: deal.description || '',
      discount: deal.discount,
      min_spend: deal.min_spend || 0,
      expiry: deal.expiry || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDeal(null);
    setFormData({
      vendor_id: '',
      title: '',
      description: '',
      discount: '',
      min_spend: 0,
      expiry: ''
    });
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = filterVendor === 'all' || deal.vendor_id === filterVendor;
    return matchesSearch && matchesVendor;
  });

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.business_name || vendor?.full_name || 'Unknown Vendor';
  };

  const isExpired = (expiry) => {
    if (!expiry) return false;
    const expiryDate = new Date(expiry);
    return expiryDate < new Date();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaTags className="text-pink-600" />
            Deals & Promos Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">Create and manage promotional deals for vendors</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <FaPlus />
          Create Deal
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={filterVendor}
              onChange={(e) => setFilterVendor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="all">All Vendors</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.business_name || vendor.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deals List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="text-4xl text-pink-600 animate-spin" />
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FaTags className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No deals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map(deal => (
            <div
              key={deal.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-md ${
                isExpired(deal.expiry) ? 'border-gray-300 opacity-60' : 'border-pink-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{deal.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <FaStore className="text-[10px]" />
                    {getVendorName(deal.vendor_id)}
                  </p>
                </div>
                {isExpired(deal.expiry) && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                    Expired
                  </span>
                )}
              </div>

              {/* Description */}
              {deal.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{deal.description}</p>
              )}

              {/* Deal Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                    <FaPercentage className="text-pink-600 text-xs" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Discount</p>
                    <p className="font-semibold text-gray-900">{deal.discount}</p>
                  </div>
                </div>

                {deal.min_spend > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FaDollarSign className="text-emerald-600 text-xs" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Min. Spend</p>
                      <p className="font-semibold text-gray-900">₱{deal.min_spend}</p>
                    </div>
                  </div>
                )}

                {deal.expiry && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaCalendarAlt className="text-blue-600 text-xs" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expires</p>
                      <p className="font-semibold text-gray-900">{new Date(deal.expiry).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(deal)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <FaEdit />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(deal.id)}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">
                {editingDeal ? 'Edit Deal' : 'Create New Deal'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Vendor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vendor_id}
                  onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.business_name || vendor.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., 20% Off All Menu Items"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the deal details..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  required
                  placeholder="e.g., 20% or ₱50 off"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Min Spend */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Spend (₱)
                </label>
                <input
                  type="number"
                  value={formData.min_spend}
                  onChange={(e) => setFormData({ ...formData, min_spend: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiry}
                  onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
                >
                  {editingDeal ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
