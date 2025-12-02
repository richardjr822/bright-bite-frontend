import React, { useState, useEffect, useCallback } from 'react';
import {
  FaStore,
  FaSearch,
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaCreditCard,
  FaArrowLeft,
  FaTimes,
  FaWalking,
  FaMotorcycle,
  FaUniversity,
  FaExclamationTriangle,
  FaBolt,
  FaTag,
  FaWallet
} from 'react-icons/fa';
import { useOrderLifecycle, OrderTracking } from '../../components/student/order';
import { API_BASE } from '../../api';

// Vendor Switch Alert Modal
const VendorSwitchAlert = ({ currentVendor, newVendor, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <FaExclamationTriangle className="text-amber-500 text-base" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Start a new cart?</h3>
        </div>
        <p className="text-slate-600 text-sm mb-5">
          Your cart has items from <span className="font-medium text-slate-900">{currentVendor}</span>. 
          Adding this item will clear your current cart.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-colors font-medium text-sm"
          >
            Clear & Add
          </button>
        </div>
      </div>
    </div>
  );
};

// Floating Cart Bar
const FloatingCartBar = ({ cart, getTotalPrice, onClick, vendorName }) => {
  if (cart.length === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 lg:px-0">
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] text-white px-5 py-3.5 rounded-xl shadow-lg hover:from-[#1a5d3a] hover:to-[#0d3d23] transition-all flex items-center justify-between gap-4"
      >
        <div className="flex flex-col text-left">
          <span className="text-xs text-green-100/80">{vendorName || 'Current vendor'}</span>
          <span className="font-medium">{cart.length} {cart.length === 1 ? 'item' : 'items'} · {formatCurrency(getTotalPrice())}</span>
        </div>
        <div className="flex items-center gap-2 font-medium text-sm bg-white/10 px-3 py-1.5 rounded-lg">
          <FaShoppingCart className="text-sm" />
          <span>View Cart</span>
        </div>
      </button>
    </div>
  );
};

// Cart View Component
const CartView = ({ cart, updateQuantity, removeFromCart, getTotalPrice, onProceedToCheckout, vendors }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
    <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
      <FaShoppingCart className="text-slate-600" />
      Your Cart ({cart.length})
    </h3>

    {cart.length === 0 ? (
      <div className="text-center py-6 text-slate-400">
        <FaShoppingCart className="text-3xl mx-auto mb-2 opacity-40" />
        <p className="text-sm">Your cart is empty</p>
        <p className="text-xs mt-1">Browse vendors and add items</p>
      </div>
    ) : (
      <>
        <div className="space-y-2 mb-4 max-h-80 overflow-y-auto">
          {cart.map(item => {
            const itemVendor = vendors.find(vendor => vendor.id === item.vendorId);
            
            return (
              <div key={item.cartItemId} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 text-sm truncate">{item.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>₱{item.price.toFixed(2)}</span>
                    {itemVendor && (
                      <>
                        <span>·</span>
                        <span className="text-slate-600 truncate">{itemVendor.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-6 h-6 bg-slate-200 rounded text-slate-600 flex items-center justify-center hover:bg-slate-300 text-sm"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-6 h-6 bg-slate-200 rounded text-slate-600 flex items-center justify-center hover:bg-slate-300 text-sm"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="text-slate-400 hover:text-rose-500 text-lg"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 pt-3 mb-3">
          <div className="flex justify-between text-base font-semibold text-slate-900">
            <span>Total:</span>
            <span>₱{getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={onProceedToCheckout}
          disabled={cart.length === 0}
          className="w-full py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-colors font-medium text-sm disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>
      </>
    )}
  </div>
);

// Item Customization Modal
const ItemCustomizationModal = ({ item, vendor, isOpen, onClose, onAddToCart }) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setSelectedOptions({});
      setQuantity(1);
    }
  }, [isOpen, item?.id]);

  const handleOptionChange = (group, option) => {
    setSelectedOptions(prev => {
      if (group.type === 'single') {
        return { ...prev, [group.id]: option };
      }
      const current = prev[group.id] || [];
      const exists = current.find(opt => opt.id === option.id);
      const next = exists ? current.filter(opt => opt.id !== option.id) : [...current, option];
      return { ...prev, [group.id]: next };
    });
  };

  const calculatePrice = () => {
    let unitPrice = item.price;
    Object.values(selectedOptions).forEach(selection => {
      if (Array.isArray(selection)) {
        selection.forEach(opt => { unitPrice += opt.extraPrice || 0; });
      } else if (selection?.extraPrice) {
        unitPrice += selection.extraPrice;
      }
    });
    return unitPrice * quantity;
  };

  const requiredComplete = (item.customizationGroups || []).every(group => {
    const selection = selectedOptions[group.id];
    if (!group.required) return true;
    return group.type === 'single' ? !!selection : Array.isArray(selection) && selection.length > 0;
  });

  const handleAdd = () => {
    const selections = Object.values(selectedOptions)
      .flatMap(value => Array.isArray(value) ? value : value ? [value] : [])
      .map(opt => opt.label)
      .join(', ');
    const unitPrice = calculatePrice() / quantity;
    onAddToCart({
      ...item,
      quantity,
      customizations: selections,
      finalPrice: unitPrice
    });
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{item.name}</h3>
              <p className="text-sm text-slate-500">{vendor.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
              <FaTimes className="text-slate-500" />
            </button>
          </div>

          <p className="text-slate-600 text-sm mb-5">{item.description}</p>

          <div className="bg-slate-50 rounded-lg p-3 mb-5">
            <p className="text-xs text-slate-500">Customization options coming soon...</p>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300 text-slate-700"
              >
                -
              </button>
              <span className="w-10 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-300 text-slate-700"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-semibold text-slate-900">₱{calculatePrice().toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-2.5 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] transition-colors font-medium text-sm"
          >
            Add {quantity} to Cart - ₱{calculatePrice().toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
};

// Checkout Modal with Service Type Selection
const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cart, 
  orderDetails, 
  onInputChange, 
  onPlaceOrder,
  getTotalPrice,
  updateQuantity,
  removeFromCart,
  vendors,
  userCampus,
  vendorDeals,
  selectedDealId,
  setSelectedDealId,
  getDiscountForSelectedDeal
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceType, setServiceType] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState({
    building: '',
    floor: '',
    room: ''
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(false);
  
  // Delivery fee constant
  const DELIVERY_FEE = 25.00;
  // Phone verification removed; ordering allowed if a phone number exists.

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    setLoadingWallet(true);
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (user?.id) headers['x-user-id'] = user.id;
      
      const res = await fetch(`${API_BASE}/wallet`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.wallet?.balance || 0);
      }
    } catch (e) {
      setWalletBalance(0);
    } finally {
      setLoadingWallet(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setServiceType(null);
      setDeliveryLocation({ building: '', floor: '', room: '' });
      fetchWalletBalance();
      (async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/student/profile`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          });
          if (res.ok) {
            const data = await res.json();
            const u = data?.user || {};
            onInputChange('name', u.full_name || '');
            onInputChange('phone', u.phone || '');
          }
        } catch (e) {
          // ignore profile load errors
        }
      })();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onWalletUpdated = () => fetchWalletBalance();
    window.addEventListener('wallet:balance-updated', onWalletUpdated);
    return () => window.removeEventListener('wallet:balance-updated', onWalletUpdated);
  }, [isOpen]);

  const handleProceedToDetails = () => {
    if (cart.length > 0 && serviceType && 
        (serviceType === 'pickup' || (deliveryLocation.building && deliveryLocation.floor))) {
      setCurrentStep(2);
    }
  };

  const handleProceedToPayment = () => {
    if (!orderDetails.name || !orderDetails.phone) return;
    setCurrentStep(3);
  };

  const handlePlaceOrder = () => {
    onPlaceOrder({
      serviceType,
      deliveryLocation: serviceType === 'delivery' ? deliveryLocation : null,
      appliedDealId: selectedDealId,
    });
  };

  const handleStepBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (!isOpen) return null;

  const canProceedToDetails = serviceType && 
    (serviceType === 'pickup' || (deliveryLocation.building && deliveryLocation.floor));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={handleStepBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
              )}
              <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex justify-between mb-6">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className="text-xs mt-1 text-gray-600">
                  {step === 1 && 'Service'}
                  {step === 2 && 'Details'}
                  {step === 3 && 'Payment'}
                </span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Service Type</h3>

              {/* Campus Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FaUniversity className="text-blue-600" />
                  {userCampus.name}
                </p>
              </div>

              {/* Service Type Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setServiceType('pickup')}
                  className={`p-6 border-2 rounded-xl transition-all ${
                    serviceType === 'pickup'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaWalking className={`text-3xl mx-auto mb-3 ${
                    serviceType === 'pickup' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <h3 className="font-bold text-gray-900 text-center mb-1">Pickup</h3>
                  <p className="text-xs text-gray-600 text-center">
                    Get it from the vendor
                  </p>
                </button>

                <button
                  onClick={() => setServiceType('delivery')}
                  className={`p-6 border-2 rounded-xl transition-all ${
                    serviceType === 'delivery'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaUser className={`text-3xl mx-auto mb-3 ${
                    serviceType === 'delivery' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <h3 className="font-bold text-gray-900 text-center mb-1">Delivery</h3>
                  <p className="text-xs text-gray-600 text-center">
                    We'll bring it to you
                  </p>
                </button>
              </div>

              {/* Delivery Location Form */}
              {serviceType === 'delivery' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 animate-fadeIn">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-600" />
                    Delivery Location
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Building/Area *
                      </label>
                      <input
                        type="text"
                        value={deliveryLocation.building}
                        onChange={(e) => setDeliveryLocation(prev => ({ ...prev, building: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g., Main Building, Library"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor *
                        </label>
                        <input
                          type="text"
                          value={deliveryLocation.floor}
                          onChange={(e) => setDeliveryLocation(prev => ({ ...prev, floor: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., 2nd Floor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room
                        </label>
                        <input
                          type="text"
                          value={deliveryLocation.room}
                          onChange={(e) => setDeliveryLocation(prev => ({ ...prev, room: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="e.g., Room 201"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Summary */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">Order Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {cart.slice(0, 2).map(item => (
                    <div key={item.cartItemId} className="flex justify-between">
                      <span className="truncate">{item.name} × {item.quantity}</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {cart.length > 2 && (
                    <p className="text-xs text-gray-500">+ {cart.length - 2} more items</p>
                  )}
                </div>
                <div className="space-y-1 text-sm mt-2 pt-2 border-t">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₱{getTotalPrice().toFixed(2)}</span>
                  </div>
                  {serviceType === 'delivery' && (
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>₱{DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">₱{(getTotalPrice() + (serviceType === 'delivery' ? DELIVERY_FEE : 0)).toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleProceedToDetails}
                disabled={!canProceedToDetails}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {canProceedToDetails ? 'Continue' : 'Please select service type'}
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-green-600" />
                Contact Details
              </h3>
              
              <div className="space-y-4">
                {/* Phone Number Warning Banner */}
                {!orderDetails.phone && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 mb-1">Phone Number Required</p>
                        <p className="text-xs text-amber-800 mb-2">
                          A phone number is required to place orders so vendors and delivery staff can contact you. 
                          Please add your phone number in Settings to continue.
                        </p>
                        <a
                          href="/settings"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 underline"
                        >
                          <FaUser className="w-3 h-3" />
                          Go to Settings to add phone number
                        </a>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={orderDetails.name}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={orderDetails.phone}
                      disabled
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed ${
                        !orderDetails.phone ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-300'
                      }`}
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                  {!orderDetails.phone && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <FaExclamationTriangle className="w-3 h-3" />
                      Phone number is missing. Add it in Settings to place orders.
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                  <textarea
                    value={orderDetails.specialInstructions}
                    onChange={(e) => onInputChange('specialInstructions', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Any special requests..."
                    rows="2"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleStepBack}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={!orderDetails.name || !orderDetails.phone}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${(!orderDetails.name || !orderDetails.phone) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  title={!orderDetails.phone ? 'Phone number required to continue' : ''}
                >
                  {!orderDetails.phone ? 'Phone Number Required' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaCreditCard className="text-green-600" />
                Payment Method
              </h3>
              
              {/* Deals selection */}
              {vendorDeals && vendorDeals.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FaTag className="text-green-600" />
                    Available Deals
                  </h4>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${selectedDealId === null ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                      <input
                        type="radio"
                        name="deal"
                        checked={selectedDealId === null}
                        onChange={() => setSelectedDealId(null)}
                      />
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">No deal</p>
                        <p className="text-xs text-gray-500">Pay regular total</p>
                      </div>
                    </label>
                    {vendorDeals.map(deal => {
                      const subtotal = getTotalPrice();
                      const minSpend = Number(deal.min_spend ?? deal.minSpend ?? 0);
                      const eligible = subtotal >= minSpend;
                      return (
                        <label key={deal.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${selectedDealId === deal.id ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                          <input
                            type="radio"
                            name="deal"
                            checked={selectedDealId === deal.id}
                            onChange={() => setSelectedDealId(deal.id)}
                            disabled={!eligible}
                          />
                          <div className="text-sm">
                            <p className="font-medium text-gray-800">{deal.title || 'Deal'}</p>
                            <p className="text-xs text-gray-600">{deal.discount} • Min spend ₱{minSpend}</p>
                            {!eligible && (
                              <p className="text-xs text-red-600 mt-1">Add ₱{(minSpend - subtotal).toFixed(2)} more to use this deal</p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                {/* Cash Option */}
                <div 
                  onClick={() => onInputChange('paymentMethod', 'cash')}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    orderDetails.paymentMethod === 'cash' 
                      ? 'border-[#0d3d23] bg-green-50' 
                      : 'border-gray-200 hover:border-[#0d3d23]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={orderDetails.paymentMethod === 'cash'}
                    onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                    className="text-[#0d3d23] focus:ring-[#0d3d23]"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">Cash on {serviceType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                    <p className="text-xs text-gray-500">Pay when you {serviceType === 'pickup' ? 'pick up' : 'receive'} your order</p>
                  </div>
                </div>
                
                {/* Wallet Option */}
                <div 
                  onClick={() => {
                    const finalTotal = getTotalPrice() - getDiscountForSelectedDeal();
                    if (walletBalance >= finalTotal) {
                      onInputChange('paymentMethod', 'wallet');
                    }
                  }}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                    walletBalance >= (getTotalPrice() - getDiscountForSelectedDeal())
                      ? orderDetails.paymentMethod === 'wallet' 
                        ? 'border-[#0d3d23] bg-green-50 cursor-pointer' 
                        : 'border-gray-200 hover:border-[#0d3d23]/50 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={orderDetails.paymentMethod === 'wallet'}
                    onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                    disabled={walletBalance < (getTotalPrice() - getDiscountForSelectedDeal())}
                    className="text-[#0d3d23] focus:ring-[#0d3d23]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 flex items-center gap-2">
                        <FaWallet className="text-[#0d3d23]" />
                        BrightBite Wallet
                      </span>
                      <span className={`text-sm font-semibold ${walletBalance >= (getTotalPrice() - getDiscountForSelectedDeal()) ? 'text-[#0d3d23]' : 'text-rose-500'}`}>
                        ₱{walletBalance.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {loadingWallet ? 'Loading balance...' : 
                       walletBalance >= (getTotalPrice() - getDiscountForSelectedDeal()) 
                        ? 'Pay instantly with your wallet balance' 
                        : `Insufficient balance. Need ₱${((getTotalPrice() - getDiscountForSelectedDeal()) - walletBalance).toFixed(2)} more`}
                    </p>
                    {walletBalance < (getTotalPrice() - getDiscountForSelectedDeal()) && (
                      <a href="/wallet" className="text-xs text-[#0d3d23] font-medium hover:underline mt-1 inline-block">
                        Top up wallet →
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Final Summary */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Service:</span>
                    <span className="font-medium">{serviceType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                  </div>
                  {serviceType === 'delivery' && (
                    <div className="flex justify-between text-gray-600 text-xs">
                      <span>Location:</span>
                      <span>{deliveryLocation.building}, {deliveryLocation.floor}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₱{getTotalPrice().toFixed(2)}</span>
                  </div>
                  {serviceType === 'delivery' && (
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>₱{DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedDealId && (
                    <div className="flex justify-between text-green-700">
                      <span>Deal Discount</span>
                      <span>-₱{getDiscountForSelectedDeal().toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">₱{(getTotalPrice() + (serviceType === 'delivery' ? DELIVERY_FEE : 0) - getDiscountForSelectedDeal()).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleStepBack}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors font-semibold bg-green-600 text-white hover:bg-green-700"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CampusCanteen() {
  // User's campus (from auth context or localStorage)
  const [userCampus] = useState({
    id: 1,
    name: 'Gordon College',
    code: 'GC-OLONGAPO'
  });
  
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [vendorSwitchAlert, setVendorSwitchAlert] = useState(null);
  const [customizationModal, setCustomizationModal] = useState(null);
  const [allDeals, setAllDeals] = useState([]);
  const [vendorDeals, setVendorDeals] = useState([]);
  const [selectedDealId, setSelectedDealId] = useState(null);
  
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    phone: '',
    email: '',
    specialInstructions: '',
    paymentMethod: 'cash'
  });

  const { order, status, etaMinutes, startOrder, dismissOrder } = useOrderLifecycle();

  // Backend-powered vendors

  useEffect(() => {
    fetchVendors();
    fetchDeals();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/vendor/list`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        const list = (data.vendors || []).map(v => ({
          ...v,
          // normalize logo URL to absolute
          logoUrlResolved: v.logoUrl
            ? (String(v.logoUrl).startsWith('/')
                ? `${API_BASE.replace('/api','')}${v.logoUrl}`
                : v.logoUrl)
            : null,
          supportsPickup: true,
          supportsDelivery: true,
          pickupEta: v.prepTime || '10-15 min',
          deliveryEta: '20-25 min'
        }));
        setVendors(list);
      } else {
        setVendors([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setVendors([]);
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const data = await (await fetch(`${API_BASE}/deals`)).json();
      setAllDeals(data?.deals || []);
    } catch (e) {
      setAllDeals([]);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    // Load menu from backend
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/vendor/menu/${vendor.id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          const items = (data.menu_items || []).map(m => ({
            id: m.id,
            name: m.name,
            description: m.description || '',
            price: Number(m.price || 0),
            category: m.category || 'Menu',
            available: !!m.is_available,
            imageUrl: m.image_url ? (m.image_url.startsWith('/') ? `${API_BASE.replace('/api','')}${m.image_url}` : m.image_url) : null,
            rating: 4.6,
            hasCustomization: false
          }));
          setMenuItems(items);
        } else {
          setMenuItems([]);
        }
      } catch (e) {
        console.error('Failed to load menu', e);
        setMenuItems([]);
      }
    })();
    setSearchQuery('');
    setCategoryFilter('all');
    // Filter deals for this vendor
    const vDeals = (allDeals || []).filter(d => (d.vendor_id || d.vendorId) === vendor.id);
    setVendorDeals(vDeals);
    setSelectedDealId(null);
  };

  const getCurrentVendor = () => {
    if (cart.length === 0) return null;
    return vendors.find(v => v.id === cart[0].vendorId) || null;
  };

  const addToCart = (item, quantityArg = 1, customizationsArg = null) => {
    const currentVendor = getCurrentVendor();
    const itemVendorId = selectedVendor?.id;
    if (currentVendor && itemVendorId && currentVendor.id !== itemVendorId) {
      setVendorSwitchAlert({
        currentVendor: currentVendor.name,
        newVendor: selectedVendor?.name || 'Vendor',
        itemToAdd: { ...item, quantity: quantityArg, customizations: customizationsArg }
      });
      return;
    }

    const quantity = quantityArg ?? item.quantity ?? 1;
    const customizations = customizationsArg ?? item.customizations ?? null;
    const unitPrice = item.finalPrice ?? item.price;
    const cartItemId = Date.now() + Math.random();

    setCart(prev => ([
      ...prev,
      {
        ...item,
        vendorId: selectedVendor?.id,
        price: unitPrice,
        unitPrice,
        customizations,
        cartItemId,
        quantity
      }
    ]));
  };

  const handleVendorSwitchConfirm = () => {
    const { itemToAdd } = vendorSwitchAlert;
    setCart([]);
    addToCart(itemToAdd, itemToAdd.quantity, itemToAdd.customizations);
    setVendorSwitchAlert(null);
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, change) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const toggleFavorite = (itemId) => {
    setFavorites(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const getTotalPrice = () =>
    cart.reduce((total, item) => total + (item.unitPrice ?? item.price) * item.quantity, 0);

  const parseDiscountAmount = (discountText, subtotal) => {
    if (!discountText) return 0;
    const txt = String(discountText).trim();
    // Percent like "20%"
    const percentMatch = txt.match(/(\d+(?:\.\d+)?)%/);
    if (percentMatch) {
      const pct = parseFloat(percentMatch[1]);
      return Math.max(0, (subtotal * pct) / 100);
    }
    // Peso like "₱50" or "50"
    const amountMatch = txt.replace(/[^0-9.]/g, '');
    const amt = parseFloat(amountMatch || '0') || 0;
    return Math.min(amt, subtotal);
  };

  const getDiscountForSelectedDeal = () => {
    if (!selectedDealId) return 0;
    const deal = vendorDeals.find(d => d.id === selectedDealId);
    if (!deal) return 0;
    const subtotal = getTotalPrice();
    const minSpend = Number(deal.min_spend ?? deal.minSpend ?? 0);
    if (subtotal < minSpend) return 0;
    return parseDiscountAmount(deal.discount, subtotal);
  };

  const handleProceedToCheckout = () => {
    if (cart.length > 0) {
      setIsCheckoutOpen(true);
    }
  };

  const handlePlaceOrder = async (checkoutData) => {
    const vendor = getCurrentVendor();
    
    const discount = getDiscountForSelectedDeal();
    const finalTotal = Math.max(0, getTotalPrice() - discount);

    // Wallet debit occurs AFTER order creation in order lifecycle (order.jsx)

    const orderPayload = {
      restaurantId: vendor.id,
      restaurantName: vendor.name,
      paymentMethod: orderDetails.paymentMethod,
      items: cart.map(c => ({
        id: c.id,
        name: c.name,
        quantity: c.quantity,
        price: c.price,
        customizations: c.customizations
      })),
      total: finalTotal,
      campus: userCampus,
      serviceType: checkoutData.serviceType,
      deliveryLocation: checkoutData.deliveryLocation,
      customerDetails: orderDetails,
      appliedDealId: checkoutData.appliedDealId || selectedDealId,
      discountAmount: discount
    };

    console.log('Creating order with payload:', orderPayload);

    // Close checkout modal FIRST
    setIsCheckoutOpen(false);
    
    // Then start the order (this triggers OrderTracking modal)
    await startOrder(orderPayload);
  };

  const handleOrderClose = () => {
    // Dismiss the tracking modal
    dismissOrder();
    // Clear cart and reset form after order completion
    setCart([]);
    setOrderDetails({
      name: '',
      phone: '',
      email: '',
      specialInstructions: '',
      paymentMethod: 'cash'
    });
  };

  const handleInputChange = useCallback((field, value) => {
    setOrderDetails(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBackToVendors = () => {
    setSelectedVendor(null);
  };

  const handleItemClick = (item) => {
    if (item.hasCustomization) {
      setCustomizationModal({ item, vendor: selectedVendor });
    } else {
      addToCart(item);
    }
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const currentVendor = getCurrentVendor(); // add this
  return (
    <div className="min-h-screen bg-slate-50/80 pb-24">
      {/* Refined Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl flex items-center justify-center shadow-sm">
                <FaStore className="text-lg text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Campus Canteen</h1>
                <p className="text-slate-500 flex items-center gap-2 text-sm">
                  <FaUniversity className="text-slate-400" />
                  {userCampus.name}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-slate-50 rounded-xl px-5 py-3 text-center border border-slate-200">
                <p className="text-xl font-semibold text-slate-900">{vendors.length}</p>
                <p className="text-xs text-slate-500 font-medium">Vendors</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-5 py-3 text-center border border-slate-200">
                <p className="text-xl font-semibold text-slate-900">{vendors.filter(v => v.isOpen !== false).length}</p>
                <p className="text-xs text-slate-500 font-medium">Open Now</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {!selectedVendor ? (
              <div>
                {/* Search Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                  <div className="relative">
                    <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search vendors or food..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 focus:bg-white transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold text-slate-900">Available Vendors</h2>
                  <span className="text-sm text-slate-500">{vendors.length} vendors</span>
                </div>

                {/* Vendor Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    [1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white rounded-xl p-5 animate-pulse border border-slate-200">
                        <div className="flex gap-3 mb-4">
                          <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="h-12 bg-slate-100 rounded-lg"></div>
                      </div>
                    ))
                  ) : vendors.filter(v => 
                      searchQuery === '' || 
                      v.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((vendor, idx) => (
                      <div
                        key={vendor.id}
                        onClick={() => handleVendorSelect(vendor)}
                        className="group bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all duration-200"
                      >
                        <div className={`h-1 ${vendor.type === 'campus_canteen' ? 'bg-[#0d3d23]' : 'bg-[#1a5d3a]'}`} />
                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            {vendor.logoUrlResolved ? (
                              <img
                                src={vendor.logoUrlResolved}
                                alt={`${vendor.name} logo`}
                                loading="lazy"
                                className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-11 h-11 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-lg flex items-center justify-center text-white text-base font-semibold">
                                {vendor.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900 truncate">{vendor.name}</h3>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{vendor.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5 text-xs">
                            <div className="flex items-center gap-1">
                              <FaStar className="text-amber-500 text-[10px]" />
                              <span className="font-medium text-slate-900">{vendor.rating || 4.7}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                              <FaClock className="text-[10px]" />
                              <span>{vendor.prepTime || '10-15 min'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                              <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                              <span className="truncate max-w-[70px]">{vendor.location || 'Campus'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleBackToVendors}
                  className="mb-4 px-3.5 py-2 text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-sm"
                >
                  <FaArrowLeft className="text-slate-500 text-xs" />
                  Back to Vendors
                </button>

                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
                  <div className="flex items-center gap-4">
                    {selectedVendor.logoUrlResolved ? (
                      <img
                        src={selectedVendor.logoUrlResolved}
                        alt={`${selectedVendor.name} logo`}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl flex items-center justify-center text-white text-xl font-semibold">
                        {selectedVendor.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-slate-900">{selectedVendor.name}</h2>
                      <p className="text-slate-500 text-sm">{selectedVendor.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1 text-amber-600">
                          <FaStar className="text-[10px]" />
                          <span className="font-medium">{selectedVendor.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                          <span>{selectedVendor.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-3 mb-5">
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3.5 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                          categoryFilter === cat
                            ? 'bg-[#0d3d23] text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredMenuItems.map(item => (
                    <div 
                      key={item.id}
                      className={`bg-white rounded-xl border border-slate-200 overflow-hidden transition-all ${
                        item.available ? 'hover:border-slate-300 hover:shadow-sm cursor-pointer' : 'opacity-60'
                      }`}
                    >
                      <div className="relative h-36 bg-slate-100">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <FaStore className="text-4xl text-slate-300" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow hover:shadow-md transition-all"
                        >
                          {favorites.includes(item.id) ? (
                            <FaHeart className="text-rose-500 text-sm" />
                          ) : (
                            <FaRegHeart className="text-slate-400 text-sm" />
                          )}
                        </button>
                        {!item.available && (
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                            <span className="bg-rose-500 text-white px-3 py-1.5 rounded-lg font-medium text-xs">Sold Out</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3.5">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <h3 className="font-medium text-slate-900 text-sm">{item.name}</h3>
                            <p className="text-xs text-slate-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-600 text-xs">
                            <FaStar className="text-[10px]" />
                            <span>{item.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-slate-900">₱{item.price.toFixed(2)}</span>
                          <button
                            onClick={() => handleItemClick(item)}
                            disabled={!item.available}
                            className="px-3 py-2 bg-[#0d3d23] text-white rounded-lg hover:bg-[#1a5d3a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium transition-all"
                          >
                            <FaShoppingCart className="text-[10px]" />
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <CartView
              cart={cart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              getTotalPrice={getTotalPrice}
              onProceedToCheckout={handleProceedToCheckout}
              vendors={vendors}
            />
          </div>
        </div>

        <FloatingCartBar
          cart={cart}
          vendorName={currentVendor?.name}
          getTotalPrice={getTotalPrice}
          onClick={handleProceedToCheckout}
        />

        {/* Modals */}
        {vendorSwitchAlert && (
          <VendorSwitchAlert
            currentVendor={vendorSwitchAlert.currentVendor}
            newVendor={vendorSwitchAlert.newVendor}
            onCancel={() => setVendorSwitchAlert(null)}
            onConfirm={handleVendorSwitchConfirm}
          />
        )}

        {customizationModal && (
          <ItemCustomizationModal
            item={customizationModal.item}
            vendor={customizationModal.vendor}
            isOpen={!!customizationModal}
            onClose={() => setCustomizationModal(null)}
            onAddToCart={(customizedItem) => {
              addToCart(customizedItem, customizedItem.quantity, customizedItem.customizations);
              setCustomizationModal(null);
            }}
          />
        )}

        {/* Checkout Modal - Show ONLY when checkout is open AND no active order */}
        {isCheckoutOpen && !order && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            orderDetails={orderDetails}
            onInputChange={handleInputChange}
            onPlaceOrder={handlePlaceOrder}
            getTotalPrice={getTotalPrice}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            vendors={vendors}
            userCampus={userCampus}
            vendorDeals={vendorDeals}
            selectedDealId={selectedDealId}
            setSelectedDealId={setSelectedDealId}
            getDiscountForSelectedDeal={getDiscountForSelectedDeal}
          />
        )}

        {/* Order Tracking Modal - Show ONLY when order exists (replaces checkout) */}
        {order && (
          <OrderTracking
            order={order}
            status={status}
            etaMinutes={etaMinutes}
            onClose={handleOrderClose}
            onRate={async (rating) => {
              try {
                const token = localStorage.getItem('token');
                await fetch(`${API_BASE}/student/orders/${order.id}/rate`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({ rating })
                });
              } catch (e) {
                console.error('Failed to submit rating', e);
              } finally {
                handleOrderClose();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

const formatCurrency = (value = 0) => `₱${Number(value || 0).toFixed(2)}`;
const getVendorServiceCopy = (vendor, type) => {
  if (type === 'pickup') {
    return vendor.supportsPickup ? vendor.pickupEta || vendor.prepTime : 'Pickup unavailable';
  }
  return vendor.supportsDelivery ? vendor.deliveryEta || '20-25 min' : 'Delivery unavailable';
};