import React, { useState, Fragment, useEffect } from 'react';
import { API_BASE as CANONICAL_API_BASE } from '../../api.js';
import { Dialog, Transition } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import { FaWallet, FaPlus, FaMinus, FaHistory, FaTimes, FaSpinner } from 'react-icons/fa';

// ============== CUSTOM HOOK ==============
// filepath: d:\BrightBite\frontend\src\hooks\useModal.js
const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  return { isOpen, openModal, closeModal };
};

// ============== PRESENTATIONAL COMPONENTS ==============

// --- components/BalanceCard.jsx ---
const BalanceCard = ({ balance, onTopUpClick, isLoading }) => {
  return (
    <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl shadow-xl p-8 mb-6 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <FaWallet className="text-green-100" />
          <p className="text-green-100 text-sm font-medium">Available Balance</p>
        </div>
        <h2 className="text-6xl font-bold mb-8 tracking-tight">₱{balance.toFixed(2)}</h2>
        <div className="flex gap-3">
          <button
            onClick={onTopUpClick}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaPlus />
                Top Up Wallet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- components/TransactionItem.jsx ---
const TransactionItem = ({ transaction }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
          transaction.type === 'credit' 
            ? 'bg-gradient-to-br from-green-100 to-green-200' 
            : 'bg-gradient-to-br from-red-100 to-red-200'
        }`}>
          {transaction.type === 'credit' ? (
            <FaPlus className="text-green-600 text-lg" />
          ) : (
            <FaMinus className="text-red-600 text-lg" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500 mt-0.5">{transaction.date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-xl font-bold ${
          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}₱{transaction.amount.toFixed(2)}
        </p>
        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mt-1">
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

// --- components/TransactionHistory.jsx ---
const TransactionHistory = ({ transactions }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          <FaHistory className="text-gray-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Transaction History</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHistory className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-500 font-medium">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- components/TopUpModal.jsx ---
const TopUpModal = ({ isOpen, onClose, onSubmit }) => {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('gcash');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentMethods = [
    { id: 'gcash', name: 'GCash', logo: '/assets/gcashlogo.png' },
    { id: 'maya', name: 'Maya', logo: '/assets/mayalogo.png' }
  ];

  const quickAmounts = [100, 200, 500, 1000];

  const validateAndSubmit = async () => {
    const amount = parseFloat(topUpAmount);
    
    // Client-side validation
    if (!topUpAmount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amount < 50) {
      setError('Minimum top-up amount is ₱50');
      return;
    }
    
    if (amount > 10000) {
      setError('Maximum top-up amount is ₱10,000');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(amount, selectedMethod);
      // Reset form on success
      setTopUpAmount('');
      setSelectedMethod('gcash');
    } catch (err) {
      setError(err.message || 'Failed to process top-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTopUpAmount('');
      setSelectedMethod('gcash');
      setError('');
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 relative">
                  <Dialog.Title className="text-2xl font-bold text-white">
                    Top Up Wallet
                  </Dialog.Title>
                  <p className="text-green-100 text-sm mt-1">Add funds to your wallet securely</p>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute top-5 right-5 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <FaTimes className="text-white" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                        ₱
                      </span>
                      <input
                        type="number"
                        value={topUpAmount}
                        onChange={(e) => {
                          setTopUpAmount(e.target.value);
                          setError('');
                        }}
                        className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-xl font-bold transition-all ${
                          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                        min="50"
                        max="10000"
                        step="50"
                        disabled={isSubmitting}
                      />
                    </div>
                    {error ? (
                      <p className="text-xs text-red-600 mt-2 font-semibold flex items-center gap-1">
                        <span>⚠️</span>
                        {error}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-2">
                        Min: ₱50 | Max: ₱10,000
                      </p>
                    )}
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {quickAmounts.map(amount => (
                        <button
                          key={amount}
                          onClick={() => {
                            setTopUpAmount(amount.toString());
                            setError('');
                          }}
                          disabled={isSubmitting}
                          className="px-4 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-green-100 hover:to-green-200 hover:text-green-700 transition-all font-bold text-sm shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                          ₱{amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      {paymentMethods.map(method => {
                        const isSelected = selectedMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method.id)}
                            disabled={isSubmitting}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                              isSelected
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            } disabled:opacity-50`}
                          >
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden">
                              <img src={method.logo} alt={`${method.name} logo`} className="max-w-10 max-h-10 object-contain" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-semibold text-gray-900 block">
                                {method.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                Redirects to {method.name} app
                              </span>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={validateAndSubmit}
                      disabled={!topUpAmount || isSubmitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaPlus />
                          Confirm Top Up
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// ============== MAIN CONTAINER COMPONENT ==============

export default function MyWallet() {
  const API_BASE = `${CANONICAL_API_BASE}`;
  const [balance, setBalance] = useState(0);
  const [walletId, setWalletId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [error, setError] = useState(null);
  
  const topUpModal = useModal();

  const authHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    if (user?.id) h['x-user-id'] = user.id;
    return h;
  };

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/wallet`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch wallet');
      const data = await res.json();
      setBalance(data.wallet.balance || 0);
      setWalletId(data.wallet.id);
      const txRes = await fetch(`${API_BASE}/wallet/transactions`, { headers: authHeaders() });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch (e) {
      setError(e.message || 'Error loading wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleTopUp = async (amount, method) => {
    setIsToppingUp(true);
    topUpModal.closeModal();

    // Show loading toast
    const loadingToast = toast.loading('Processing your top-up...');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) throw new Error('No user id');
      const idemKey = (crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
      const payload = {
        amount,
        payment_method: method,
        description: `Top-up via ${method === 'gcash' ? 'GCash' : 'Maya'}`,
        userId: user.id,
        idempotency_key: idemKey,
        useGateway: true
      };
      const res = await fetch(`${API_BASE}/wallet/top-up`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Idempotency-Key': idemKey },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(()=>({detail:'Top-up failed'}));
        throw new Error(errData.detail || 'Top-up failed');
      }
      const data = await res.json();
      toast.dismiss(loadingToast);
      if (data.gateway && data.gateway.redirect_url) {
        const providerName = method === 'gcash' ? 'GCash' : 'Maya';
        toast(`Redirecting to ${providerName}…`, { icon: '➡️' });
        // Try deep link, then fallback to web URL
        const deepLink = data.gateway.redirect_url;
        const fallback = data.gateway.fallback_url;
        const openFallback = () => {
          if (fallback) window.location.href = fallback;
        };
        setTimeout(openFallback, 1200);
        window.location.href = deepLink;
        // Start a light poll in background to pick up completion when user returns
        const start = Date.now();
        const poll = async () => {
          if (Date.now() - start > 90_000) return; // stop after 90s
          try { await fetchWallet(); } catch (_) {}
          setTimeout(poll, 5000);
        };
        setTimeout(poll, 5000);
      } else {
        // Fallback: no gateway returned, just refresh wallet
        await fetchWallet();
        toast.success(`Top-up request created.`, { duration: 3000 });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to process top-up.');
      throw error;
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <FaWallet className="text-white text-xl" />
            </div>
            My Wallet
          </h1>
          <p className="text-gray-600 ml-15">Manage your wallet balance and transactions</p>
        </div>

        {/* Balance Card */}
        {error && (
          <div className="mb-4 bg-white border-2 border-red-200 rounded-xl p-4 text-center text-sm text-red-600 font-semibold">{error}</div>
        )}
        <BalanceCard
          balance={balance}
          onTopUpClick={topUpModal.openModal}
          isLoading={isToppingUp || loading}
        />

        {/* Top Up Modal */}
        <TopUpModal
          isOpen={topUpModal.isOpen}
          onClose={topUpModal.closeModal}
          onSubmit={handleTopUp}
        />

        {/* Transaction History */}
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}
