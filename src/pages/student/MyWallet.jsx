import React, { useState, Fragment, useEffect } from 'react';
import { API_BASE as CANONICAL_API_BASE } from '../../api.js';
import { Dialog, Transition } from '@headlessui/react';
import toast, { Toaster } from 'react-hot-toast';
import { FaWallet, FaPlus, FaMinus, FaHistory, FaTimes, FaSpinner, FaFlask, FaShieldAlt, FaCheckCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';

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
    <div className="bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl shadow-lg p-6 mb-5 text-white relative overflow-hidden border border-[#1a5d3a]">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <FaWallet className="text-green-200/80 text-sm" />
          <p className="text-green-100/80 text-xs font-medium">Available Balance</p>
        </div>
        <h2 className="text-4xl font-bold mb-6 tracking-tight">₱{balance.toFixed(2)}</h2>
        <button
          onClick={onTopUpClick}
          disabled={isLoading}
          className="w-full px-5 py-3 bg-white text-[#0d3d23] rounded-lg hover:bg-green-50 transition-all font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin text-sm" />
              Processing...
            </>
          ) : (
            <>
              <FaPlus className="text-sm" />
              Top Up Wallet
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- components/TransactionItem.jsx ---
const TransactionItem = ({ transaction }) => {
  const isCredit = transaction.type === 'credit';
  
  // Parse description to extract meaningful info
  const parseDescription = (desc) => {
    if (!desc) return { title: isCredit ? 'Top Up' : 'Payment', subtitle: '' };
    
    // Check for order payment
    if (desc.toLowerCase().includes('order from')) {
      const vendorMatch = desc.match(/order from (.+)/i);
      return {
        title: vendorMatch ? vendorMatch[1] : 'Food Order',
        subtitle: 'Order Payment',
        icon: '🍽️'
      };
    }
    
    // Check for top-up
    if (desc.toLowerCase().includes('top-up') || desc.toLowerCase().includes('topup')) {
      return {
        title: 'Wallet Top Up',
        subtitle: desc.includes('Demo') || desc.includes('Sandbox') ? 'Demo Mode' : 'Balance Added',
        icon: '💳'
      };
    }
    
    // Check for refund
    if (desc.toLowerCase().includes('refund')) {
      return {
        title: 'Order Refund',
        subtitle: desc,
        icon: '↩️'
      };
    }
    
    return { title: desc, subtitle: '', icon: isCredit ? '📥' : '📤' };
  };
  
  const { title, subtitle, icon } = parseDescription(transaction.description);
  
  // Format date more readably
  const formatTxDate = (dateStr) => {
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
  
  return (
    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all border border-slate-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          isCredit 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-rose-50 border border-rose-200'
        }`}>
          {isCredit ? (
            <FaArrowDown className="text-green-600 text-sm" />
          ) : (
            <FaArrowUp className="text-rose-600 text-sm" />
          )}
        </div>
        <div>
          <p className="font-medium text-slate-900 text-sm flex items-center gap-1.5">
            {icon && <span className="text-xs">{icon}</span>}
            {title}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {subtitle && <span>{subtitle}</span>}
            {subtitle && <span>•</span>}
            <span>{formatTxDate(transaction.date || transaction.created_at)}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-base font-semibold ${
          isCredit ? 'text-green-600' : 'text-rose-600'
        }`}>
          {isCredit ? '+' : '-'}₱{transaction.amount.toFixed(2)}
        </p>
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
          transaction.status === 'completed' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : transaction.status === 'pending'
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

// --- components/TransactionHistory.jsx ---
const TransactionHistory = ({ transactions }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
          <FaHistory className="text-slate-600 text-sm" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Transaction History</h3>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FaHistory className="text-slate-400 text-xl" />
          </div>
          <p className="text-slate-500 font-medium text-sm">No transactions yet</p>
          <p className="text-slate-400 text-xs mt-1">Top up your wallet to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- components/TopUpModal.jsx ---
const TopUpModal = ({ isOpen, onClose, onSandboxTopUp }) => {
  const [topUpAmount, setTopUpAmount] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sandboxPin, setSandboxPin] = useState('');
  const [step, setStep] = useState(1); // 1 = amount, 2 = confirm

  const quickAmounts = [100, 200, 500, 1000];

  const handleClose = () => {
    if (!isSubmitting) {
      setTopUpAmount('');
      setError('');
      setSandboxPin('');
      setStep(1);
      onClose();
    }
  };

  const handleContinue = () => {
    const amount = parseFloat(topUpAmount);
    if (!topUpAmount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }
    if (amount < 1) {
      setError('Minimum amount is ₱1');
      return;
    }
    if (amount > 100000) {
      setError('Maximum amount is ₱100,000');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleConfirmTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!sandboxPin || sandboxPin.length < 4) {
      setError('Please enter the 4-digit demo PIN');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSandboxTopUp(amount, sandboxPin);
      setTopUpAmount('');
      setSandboxPin('');
      setStep(1);
    } catch (err) {
      setError(err.message || 'Failed to process top-up');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        </Transition.Child>

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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] px-5 py-4 relative">
                  <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                    <FaWallet className="text-green-200" />
                    Top Up Wallet
                  </Dialog.Title>
                  <p className="text-green-100/80 text-xs mt-0.5">Demo Mode - For demonstration only</p>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <FaTimes className="text-white text-sm" />
                  </button>
                </div>

                <div className="p-5">
                  {step === 1 ? (
                    /* Step 1: Enter Amount */
                    <div className="space-y-4">
                      {/* Demo Banner */}
                      <div className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <FaFlask className="text-amber-600 text-sm flex-shrink-0" />
                        <p className="text-xs text-amber-700">
                          <span className="font-semibold">Demo Mode:</span> This simulates a wallet top-up for testing purposes. No real payment is processed.
                        </p>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Enter Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">
                            ₱
                          </span>
                          <input
                            type="number"
                            value={topUpAmount}
                            onChange={(e) => {
                              setTopUpAmount(e.target.value);
                              setError('');
                            }}
                            className={`w-full pl-9 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0d3d23]/20 focus:border-[#0d3d23] text-lg font-semibold transition-all ${
                              error ? 'border-rose-300 bg-rose-50' : 'border-slate-200'
                            }`}
                            placeholder="0.00"
                            min="1"
                            max="100000"
                            disabled={isSubmitting}
                          />
                        </div>
                        {error ? (
                          <p className="text-xs text-rose-600 mt-1.5 font-medium">{error}</p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-1.5">Min: ₱1 | Max: ₱100,000</p>
                        )}
                      </div>

                      {/* Quick Amounts */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                              className={`py-2.5 rounded-lg font-medium text-sm transition-all border ${
                                topUpAmount === amount.toString()
                                  ? 'bg-[#0d3d23] text-white border-[#0d3d23]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                              } disabled:opacity-50`}
                            >
                              ₱{amount}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleClose}
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleContinue}
                          disabled={!topUpAmount || isSubmitting}
                          className="flex-1 px-4 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Step 2: Confirm with PIN */
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-slate-500">Top-up Amount</span>
                          <span className="text-2xl font-bold text-slate-900">₱{parseFloat(topUpAmount).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <FaShieldAlt className="text-[#0d3d23]" />
                          <span>Secure demo transaction</span>
                        </div>
                      </div>

                      {/* PIN Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Enter Demo PIN to Confirm
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={sandboxPin}
                          onChange={(e) => {
                            setSandboxPin(e.target.value.replace(/\D/g, ''));
                            setError('');
                          }}
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d3d23]/20 focus:border-[#0d3d23] text-center text-xl font-bold tracking-[0.5em]"
                          placeholder="••••"
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-slate-500 mt-1.5 text-center">Demo PIN: <span className="font-mono font-semibold">1234</span></p>
                        {error && (
                          <p className="text-xs text-rose-600 mt-1.5 font-medium text-center">{error}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => { setStep(1); setError(''); setSandboxPin(''); }}
                          disabled={isSubmitting}
                          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleConfirmTopUp}
                          disabled={!sandboxPin || sandboxPin.length < 4 || isSubmitting}
                          className="flex-1 px-4 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="animate-spin text-sm" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle className="text-sm" />
                              Confirm Top Up
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
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
  const [sandboxMode, setSandboxMode] = useState(false);
  
  const topUpModal = useModal();

  const authHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const h = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    if (user?.id) h['x-user-id'] = user.id;
    return h;
  };

  // Check if sandbox mode is enabled
  const checkSandboxStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/wallet/sandbox/status`);
      if (res.ok) {
        const data = await res.json();
        setSandboxMode(data.sandbox_mode === true);
      }
    } catch (e) {
      // Sandbox endpoint might not exist, default to false
      setSandboxMode(false);
    }
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

  useEffect(() => { 
    fetchWallet(); 
    checkSandboxStatus();
  }, []);

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
          try { window.dispatchEvent(new CustomEvent('wallet:balance-updated')); } catch (_) {}
          setTimeout(poll, 5000);
        };
        setTimeout(poll, 5000);
      } else {
        // Fallback: no gateway returned, just refresh wallet
        await fetchWallet();
        try { window.dispatchEvent(new CustomEvent('wallet:balance-updated')); } catch (_) {}
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

  // Sandbox top-up handler (instant, for testing)
  const handleSandboxTopUp = async (amount, pin) => {
    setIsToppingUp(true);
    topUpModal.closeModal();

    const loadingToast = toast.loading('Processing sandbox top-up...');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user?.id) throw new Error('No user id');
      
      const payload = {
        amount,
        pin,
        description: `Sandbox test top-up`,
        userId: user.id,
      };
      
      const res = await fetch(`${API_BASE}/wallet/sandbox/top-up`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Sandbox top-up failed' }));
        throw new Error(errData.detail || 'Sandbox top-up failed');
      }
      
      const data = await res.json();
      toast.dismiss(loadingToast);
      
      // Update balance immediately
      if (data.wallet?.balance !== undefined) {
        setBalance(data.wallet.balance);
      }
      
      // Refresh transactions
      await fetchWallet();
      try { window.dispatchEvent(new CustomEvent('wallet:balance-updated')); } catch (_) {}
      
      toast.success(`🧪 Test top-up of ₱${amount.toFixed(2)} completed!`, { duration: 4000 });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message || 'Failed to process sandbox top-up.');
      throw error;
    } finally {
      setIsToppingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            fontWeight: '500',
            padding: '14px 16px',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#0d3d23',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl flex items-center justify-center shadow-sm">
              <FaWallet className="text-lg text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Wallet</h1>
              <p className="text-slate-500 text-sm">Manage your balance and transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Demo Mode Info */}
        <div className="mb-5 flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <FaFlask className="text-amber-600 text-sm flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Demo Mode:</span> This wallet uses simulated transactions for demonstration purposes. PIN: <span className="font-mono font-semibold">1234</span>
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-white border border-rose-200 rounded-lg p-4 text-center text-sm text-rose-600 font-medium">{error}</div>
        )}
        
        {/* Balance Card */}
        <BalanceCard
          balance={balance}
          onTopUpClick={topUpModal.openModal}
          isLoading={isToppingUp || loading}
        />

        {/* Top Up Modal */}
        <TopUpModal
          isOpen={topUpModal.isOpen}
          onClose={topUpModal.closeModal}
          onSandboxTopUp={handleSandboxTopUp}
        />

        {/* Transaction History */}
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
}
