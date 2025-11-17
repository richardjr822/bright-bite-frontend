import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const totalVolume = transactions.reduce((s, t) => s + (t.amount || 0), 0);
  const pendingPayouts = transactions.filter(t => (t.status || '').toLowerCase() === 'pending').reduce((s, t) => s + (t.amount || 0), 0);
  const completedPayouts = transactions.filter(t => (t.status || '').toLowerCase() === 'completed').reduce((s, t) => s + (t.amount || 0), 0);
  const disputesCount = transactions.filter(t => (t.status || '').toLowerCase() === 'disputed').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-600 mt-1">Monitor financial transactions and payouts</p>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <FaMoneyBillWave className="text-indigo-600 text-xl" />
          </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{totalVolume.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Total Volume</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <FaClock className="text-yellow-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{pendingPayouts.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Pending Payouts</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">₱{completedPayouts.toFixed(2)}</h3>
          <p className="text-sm text-gray-600">Completed Payouts</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{disputesCount}</h3>
          <p className="text-sm text-gray-600">Disputes</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <button
            onClick={fetchTransactions}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
                  <th className="px-4 py-2 text-left font-medium">ID</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b last:border-b-0">
                    <td className="px-4 py-2 font-mono text-xs text-gray-600">{t.id}</td>
                    <td className="px-4 py-2 capitalize">{t.type || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${((t.status || '').toLowerCase() === 'completed') ? 'bg-green-100 text-green-700' : ( (t.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' : ( (t.status || '').toLowerCase() === 'disputed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'))}`}>{t.status || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-2">₱{(t.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-gray-500">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
