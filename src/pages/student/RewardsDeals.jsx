import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../api';
import {
  FaGift,
  FaStar,
  FaFire,
  FaTrophy,
  FaTicketAlt,
  FaClock,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa';

export default function RewardsDeals() {
  const [points, setPoints] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [activeTab, setActiveTab] = useState('rewards'); // 'rewards', 'vouchers', 'deals'
  const [rewards, setRewards] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [pointsRes, rewardsRes, vouchersRes, dealsRes] = await Promise.all([
        apiClient('/rewards/points'),
        apiClient('/rewards'),
        apiClient('/vouchers'),
        apiClient('/deals'),
      ]);
      setPoints(pointsRes?.points ?? 0);
      const mappedRewards = (rewardsRes?.rewards || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        points: r.points_required,
        type: r.type,
        expiry: `${r.expiry_days} days`,
        available: r.available,
      }));
      setRewards(mappedRewards);
      setMyVouchers(vouchersRes?.vouchers || []);
      setDeals(dealsRes?.deals || []);
    } catch (e) {
      setError(e?.message || 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRedeem = async (reward) => {
    if (!reward?.id) return;
    if (points < reward.points) {
      alert(`You need ${reward.points - points} more points to redeem this reward.`);
      return;
    }
    try {
      const key = uuidv4();
      const res = await apiClient('/rewards/redeem', {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
        body: JSON.stringify({ reward_id: reward.id, idempotency_key: key }),
      });
      if (res?.success) {
        setPoints(res.points ?? points - reward.points);
        if (res.voucher) {
          setMyVouchers(prev => [{
            id: res.voucher.id,
            code: res.voucher.code,
            title: res.voucher.title,
            description: res.voucher.description,
            expiry: res.voucher.expiry,
            used: !!res.voucher.used,
          }, ...prev]);
        }
        alert(`Successfully redeemed ${reward.title}!`);
        setSelectedReward(null);
      }
    } catch (e) {
      alert(e?.message || 'Failed to redeem reward');
    }
  };

  const handleUseVoucher = async (voucherId) => {
    try {
      const res = await apiClient(`/vouchers/${voucherId}/use`, { method: 'POST' });
      if (res?.success) {
        setMyVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, used: true } : v));
        alert('Voucher marked as used!');
      }
    } catch (e) {
      alert(e?.message || 'Failed to use voucher');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isVoucherExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'rewards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {rewards.map(reward => (
              <div
                key={reward.id}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all ${
                  reward.available ? 'border-gray-200 hover:border-purple-300 hover:shadow-md cursor-pointer' : 'border-gray-200 opacity-60'
                }`}
                onClick={() => reward.available && setSelectedReward(reward)}
              >
                <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center relative">
                  <FaGift className="text-6xl text-purple-400" />
                  {!reward.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold">Not Enough Points</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{reward.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-600">
                      <FaStar className="text-yellow-500" />
                      <span className="font-bold text-lg">{reward.points}</span>
                      <span className="text-sm">points</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FaClock />
                      <span>{reward.expiry}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'vouchers':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaTicketAlt className="text-green-500" />
              My Vouchers
            </h3>
            
            {myVouchers.length === 0 ? (
              <div className="text-center py-12">
                <FaTicketAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No vouchers yet</p>
                <p className="text-gray-400 text-sm mt-2">Redeem rewards to get vouchers!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myVouchers.map(voucher => {
                  const isExpired = isVoucherExpired(voucher.expiry);
                  return (
                    <div
                      key={voucher.id}
                      className={`border-2 rounded-xl p-5 transition-all ${
                        voucher.used
                          ? 'border-gray-300 bg-gray-100 opacity-60'
                          : isExpired
                          ? 'border-red-200 bg-red-50'
                          : 'border-green-200 bg-green-50 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{voucher.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{voucher.description}</p>
                        </div>
                        {voucher.used ? (
                          <FaCheckCircle className="text-green-500 text-xl mt-1" />
                        ) : isExpired ? (
                          <FaTimes className="text-red-500 text-xl mt-1" />
                        ) : (
                          <FaTicketAlt className="text-green-500 text-xl mt-1" />
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 mb-4 border">
                        <p className="text-sm text-gray-500 mb-1">Voucher Code</p>
                        <p className="font-mono font-bold text-lg text-gray-900">{voucher.code}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${
                          voucher.used ? 'text-green-600' : 
                          isExpired ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {voucher.used ? 'Used' : isExpired ? 'Expired' : 'Valid'}
                        </span>
                        <span className="text-gray-500">
                          Expires: {formatDate(voucher.expiry)}
                        </span>
                      </div>
                      
                      {!voucher.used && !isExpired && (
                        <button
                          onClick={() => handleUseVoucher(voucher.id)}
                          className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Use Voucher
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'deals':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaFire className="text-orange-500" />
              Hot Deals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map(deal => (
                <div key={deal.id} className="border-2 border-orange-200 rounded-xl p-5 bg-gradient-to-br from-orange-50 to-white hover:border-orange-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">{deal.vendor || 'Partner Vendor'}</p>
                      <h4 className="font-bold text-gray-900">{deal.title}</h4>
                    </div>
                    <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                      {deal.discount}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{deal.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Min: ₱{deal.minSpend}</span>
                    <span>Until {deal.expiry}</span>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                    View Deal
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl flex items-center justify-center shadow-sm">
              <FaGift className="text-lg text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Rewards & Deals</h1>
              <p className="text-slate-500 text-sm">Earn points and redeem exciting rewards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl shadow-lg p-6 mb-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-green-100/80 text-xs font-medium mb-1">Your Reward Points</p>
              <h2 className="text-4xl font-bold mb-1">{points}</h2>
              <p className="text-green-100/80 text-xs">Keep ordering to earn more points!</p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
              <FaTrophy className="text-3xl text-white" />
            </div>
          </div>
          {error && (
            <div className="mt-3 text-xs bg-white/10 rounded-lg px-3 py-2">{error}</div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 mb-5">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'rewards'
                  ? 'text-[#0d3d23] border-b-2 border-[#0d3d23]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Rewards Catalog
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'vouchers'
                  ? 'text-[#0d3d23] border-b-2 border-[#0d3d23]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              My Vouchers
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`flex-1 px-4 py-3 font-medium text-sm transition-colors ${
                activeTab === 'deals'
                  ? 'text-[#0d3d23] border-b-2 border-[#0d3d23]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Hot Deals
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-5">
            {getTabContent()}
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] px-5 py-4 rounded-t-xl">
              <h2 className="text-lg font-semibold text-white">Redeem Reward</h2>
            </div>

            <div className="p-5">
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaGift className="text-3xl text-[#0d3d23]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{selectedReward.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{selectedReward.description}</p>
                <div className="flex items-center justify-center gap-2 text-[#0d3d23] mb-1">
                  <FaStar className="text-amber-500 text-sm" />
                  <span className="font-bold text-xl">{selectedReward.points}</span>
                  <span className="text-sm">points</span>
                </div>
                <p className="text-xs text-slate-500">Your balance: {points} points</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-5 border border-slate-200">
                <p className="text-xs text-slate-600">
                  <strong>Validity:</strong> {selectedReward.expiry} from redemption date
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedReward(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRedeem(selectedReward)}
                  disabled={points < selectedReward.points}
                  className="flex-1 px-4 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Redeem Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}