import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaTimes,
  FaClipboardCheck,
  FaArrowUp,
  FaArrowDown,
  FaShieldAlt
} from 'react-icons/fa';
import { API_BASE } from '../../api';

// Format order number to short readable format
const formatOrderNumber = (orderId) => {
  if (!orderId) return '#0000';
  const idStr = String(orderId);
  const numericPart = idStr.replace(/[^0-9]/g, '');
  if (numericPart.length >= 3) {
    return `#${numericPart.slice(-4).padStart(4, '0')}`;
  }
  return `#${idStr.slice(-4).toUpperCase()}`;
};

// Format relative time
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

// Transaction Detail Modal
const TransactionDetailModal = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaClipboardCheck />
            Payment Audit Details
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <FaTimes className="text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Transaction ID & Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="text-lg font-bold text-[#0d3d23]">{formatOrderNumber(transaction.id)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              transaction.status === 'disputed' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {transaction.status || 'Unknown'}
            </span>
          </div>

          {/* Amount Verification */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FaShieldAlt className="text-[#0d3d23]" />
              Amount Verification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Recorded Amount</p>
                <p className="text-xl font-bold text-gray-900">₱{(transaction.amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expected Amount</p>
                <p className="text-xl font-bold text-gray-900">₱{(transaction.expected_amount || transaction.amount || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {transaction.amount === (transaction.expected_amount || transaction.amount) ? (
                  <>
                    <FaCheckCircle className="text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Amount Verified - Match Confirmed</span>
                  </>
                ) : (
                  <>
                    <FaExclamationTriangle className="text-amber-600" />
                    <span className="text-sm text-amber-700 font-medium">
                      Discrepancy: ₱{Math.abs((transaction.amount || 0) - (transaction.expected_amount || transaction.amount || 0)).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Type</p>
                <p className="font-medium capitalize">{transaction.type || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Date/Time</p>
                <p className="font-medium">{transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">User ID</p>
                <p className="font-medium font-mono text-xs">{transaction.user_id || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500">Wallet ID</p>
                <p className="font-medium font-mono text-xs">{transaction.wallet_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{transaction.description}</p>
            </div>
          )}

          {/* Audit Trail */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Audit Trail</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-600 text-xs" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Transaction Recorded</p>
                  <p className="text-xs text-gray-500">{transaction.created_at ? new Date(transaction.created_at).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
              {transaction.status === 'completed' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaCheckCircle className="text-blue-600 text-xs" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Transaction Completed</p>
                    <p className="text-xs text-gray-500">{transaction.updated_at ? new Date(transaction.updated_at).toLocaleString() : 'Same as recorded'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true); setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/transactions`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load transactions');
      const data = await res.json();
      setTransactions(data.transactions || data || []); // support both shapes
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm || 
      String(t.id).includes(searchTerm) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.user_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (t.status || '').toLowerCase() === statusFilter;
    const matchesType = typeFilter === 'all' || (t.type || '').toLowerCase() === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalVolume = filteredTransactions.reduce((s, t) => s + (t.amount || 0), 0);
  const creditTransactions = filteredTransactions.filter(t => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);
  const debitTransactions = filteredTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + (t.amount || 0), 0);
  const pendingPayouts = filteredTransactions.filter(t => (t.status || '').toLowerCase() === 'pending').reduce((s, t) => s + (t.amount || 0), 0);
  const completedPayouts = filteredTransactions.filter(t => (t.status || '').toLowerCase() === 'completed').reduce((s, t) => s + (t.amount || 0), 0);
  const disputesCount = filteredTransactions.filter(t => (t.status || '').toLowerCase() === 'disputed').length;

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Type', 'Status', 'Amount', 'Description', 'User ID', 'Date'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.type || '',
      t.status || '',
      t.amount?.toFixed(2) || '0.00',
      t.description || '',
      t.user_id || '',
      t.created_at ? new Date(t.created_at).toISOString() : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-600 mt-1">Monitor financial transactions and payouts</p>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <FaMoneyBillWave className="text-indigo-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{totalVolume.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Total Volume</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FaArrowDown className="text-green-600 text-xl" />
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FaArrowUp className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-bold text-green-600">₱{creditTransactions.toFixed(2)}</h3>
              <p className="text-xs text-gray-500">Credits</p>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold text-red-600">₱{debitTransactions.toFixed(2)}</h3>
              <p className="text-xs text-gray-500">Debits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <FaClock className="text-yellow-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{pendingPayouts.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{disputesCount}</h3>
          <p className="text-sm text-gray-600">Disputes</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3d23] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3d23] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3d23] focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="credit">Credits Only</option>
            <option value="debit">Debits Only</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-colors font-medium"
          >
            <FaDownload />
            Export Audit Log
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaClipboardCheck className="text-[#0d3d23]" />
            Payment Audit Log
          </h2>
          <button
            onClick={fetchTransactions}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            disabled={loading}
          >{loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="px-4 py-3 text-left font-medium">Transaction ID</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#0d3d23]">{formatOrderNumber(t.id)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.type === 'credit' ? (
                          <FaArrowDown className="text-green-600 text-xs" />
                        ) : (
                          <FaArrowUp className="text-red-600 text-xs" />
                        )}
                        <span className="capitalize">{t.type || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        (t.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 
                        (t.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        (t.status || '').toLowerCase() === 'disputed' ? 'bg-red-100 text-red-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>{t.status || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold">₱{(t.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '—'}</div>
                      <div className="text-xs text-gray-500">{formatRelativeTime(t.created_at)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetails(t)}
                        className="flex items-center gap-1 text-[#0d3d23] hover:text-[#1a5d3a] font-medium text-xs"
                      >
                        <FaEye />
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <FaClipboardCheck className="text-4xl mx-auto mb-2 opacity-30" />
                      <p>No transactions found matching your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
}
