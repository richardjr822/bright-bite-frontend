import React, { useState, useEffect } from 'react';
import { 
  FaWallet,
  FaDollarSign,
  FaCalendar,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaUtensils
} from 'react-icons/fa';
import { API_BASE } from '../../api';

// Format order/transaction number to short readable format (e.g., #0001)
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

export default function Earnings() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEarnings();
  }, [timeRange]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !user?.id) throw new Error('Missing auth');

      const response = await fetch(`${API_BASE}/vendor/earnings/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Normalize to UI shape
        const total = Number(data.total_earnings || 0);
        const walletGross = Number(data.wallet_earnings || 0);
        const cashGross = Number(data.cash_earnings || 0);
        const platform_fees = total * 0.15;
        // Payoutable comes only from wallet payments after fees (15%)
        const payoutable = Math.max(0, walletGross * 0.85);
        const net = total - platform_fees;
        const monthList = Array.isArray(data.monthly_breakdown) ? data.monthly_breakdown : [];
        const monthly_breakdown = monthList.map(m => ({
          month: m.month || m.period || '',
          gross: m.amount || 0,
          fees: (m.amount || 0) * 0.15,
          net: (m.amount || 0) * 0.85,
        }));
        const tx = Array.isArray(data.recent_transactions) ? data.recent_transactions : [];
        const recent_transactions = tx.map(t => ({
          id: t.id,
          date: t.created_at,
          customer: t.customer || t.user_name || '',
          amount: t.total || t.amount || 0,
          fee: (t.total || t.amount || 0) * 0.15,
          net: (t.total || t.amount || 0) * 0.85,
          payment_method: t.payment_method || t.method || '',
        }));

        setEarnings({
          total_earnings: total,
          platform_fees: platform_fees,
          net_earnings: net,
          pending_payout: 0,
          available_balance: payoutable,
          wallet_earnings: walletGross,
          cash_earnings: cashGross,
          monthly_breakdown,
          recent_transactions,
          payout_history: [],
          growth_rate: 0,
        });
      } else {
        console.warn('API failed');
        throw new Error('Failed to load earnings');
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setEarnings({
        total_earnings: 0,
        platform_fees: 0,
        net_earnings: 0,
        pending_payout: 0,
        available_balance: 0,
        monthly_breakdown: [],
        recent_transactions: [],
        payout_history: [],
        growth_rate: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="text-4xl text-green-600 animate-spin" />
      </div>
    );
  }

  const handleRequestPayout = () => {
    setPayoutAmount(earnings.available_balance.toFixed(2));
    setShowPayoutModal(true);
  };

  const handleSubmitPayout = async () => {
    const amount = parseFloat(payoutAmount);
    
    // Validation
    if (amount < 500) {
      alert('Minimum payout amount is ₱500');
      return;
    }
    
    if (amount > earnings.available_balance) {
      alert('Amount exceeds available balance');
      return;
    }

    try {
      setSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new payout to history
      const newPayout = {
        id: earnings.payout_history.length + 1,
        date: new Date().toISOString(),
        amount: amount,
        status: 'pending',
        method: 'Bank Transfer'
      };
      
      // Update earnings
      setEarnings(prev => ({
        ...prev,
        available_balance: prev.available_balance - amount,
        pending_payout: prev.pending_payout + amount,
        payout_history: [newPayout, ...prev.payout_history]
      }));
      
      setShowPayoutModal(false);
      setPayoutAmount('');
      alert('Payout request submitted successfully! Your funds will be transferred within 3-5 business days.');
      
    } catch (err) {
      console.error('Error requesting payout:', err);
      alert('Failed to submit payout request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const maxEarnings = Math.max(...earnings.monthly_breakdown.map(m => m.gross));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <FaDownload /> Download Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm">Total Earnings</p>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">₱{earnings.total_earnings.toFixed(2)}</p>
          <div className="flex items-center gap-1 text-sm text-green-100">
            <FaArrowUp />
            <span>{earnings.growth_rate}% vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Platform Fees</p>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FaArrowDown className="text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">₱{earnings.platform_fees.toFixed(2)}</p>
          <p className="text-xs text-gray-500">15% commission</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Wallet Payoutable</p>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaWallet className="text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-1">₱{earnings.available_balance.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Wallet after fees (payoutable)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Cash on Pickup (Audit)</p>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FaDollarSign className="text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">₱{(earnings.cash_earnings || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-500">Collected by vendor; not payoutable</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Earnings Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Earnings Breakdown</h2>
          <div className="space-y-3">
            {earnings.monthly_breakdown.map((month, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <span className="text-sm font-bold text-gray-900">₱{month.net.toFixed(2)}</span>
                </div>
                <div className="relative">
                  <div className="flex gap-0.5 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-end pr-2 transition-all duration-500"
                      style={{ width: `${(month.net / maxEarnings) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">Net</span>
                    </div>
                    <div
                      className="bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-center transition-all duration-500"
                      style={{ width: `${(month.fees / maxEarnings) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">Fee</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">Gross: ₱{month.gross.toFixed(2)}</span>
                  <span className="text-xs text-red-600">Fee: ₱{month.fees.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout History</h2>
          <div className="space-y-3">
            {earnings.payout_history.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    payout.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    {payout.status === 'completed' ? (
                      <FaCheckCircle className="text-green-600" />
                    ) : (
                      <FaClock className="text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">₱{payout.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(payout.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{payout.method}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  payout.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={handleRequestPayout}
            className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Request Payout
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gross Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Earnings
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {earnings.recent_transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <FaUtensils className="text-[#0d3d23] text-xs" />
                      </div>
                      <span className="text-sm font-bold text-[#0d3d23]">{formatOrderNumber(transaction.id)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(transaction.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{transaction.customer || 'Customer'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${transaction.payment_method === 'wallet' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                      {transaction.payment_method === 'wallet' ? 'Wallet' : (transaction.payment_method === 'cash' ? 'Cash' : (transaction.payment_method || '—'))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ₱{transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-red-600">
                      -₱{transaction.fee.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-600">
                      ₱{transaction.net.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Request Payout</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Available Balance */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-green-600">₱{earnings.available_balance.toFixed(2)}</p>
              </div>

              {/* Payout Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payout Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₱
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="500"
                    max={earnings.available_balance}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-semibold"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum payout: ₱500.00</p>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaWallet className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bank Transfer</p>
                    <p className="text-xs text-gray-500">Processing time: 3-5 business days</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your payout will be processed within 3-5 business days and transferred to your registered bank account.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPayoutModal(false);
                    setPayoutAmount('');
                  }}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitPayout}
                  disabled={submitting || !payoutAmount || parseFloat(payoutAmount) < 500}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      Confirm Payout
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
