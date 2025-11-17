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
  FaTag
} from 'react-icons/fa';
import { useOrderLifecycle, OrderTracking } from '../../components/student/order';
import { API_BASE } from '../../api';

// Vendor Switch Alert Modal
const VendorSwitchAlert = ({ currentVendor, newVendor, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <FaExclamationTriangle className="text-yellow-600 text-xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Start a new cart?</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Your cart has items from <span className="font-semibold text-green-600">{currentVendor}</span>. 
          Adding this item will clear your current cart.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Clear Cart & Add
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 lg:px-0 animate-slideUp">
      <button
        onClick={onClick}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-emerald-300/40 transition-all flex items-center justify-between gap-4"
      >
        <div className="flex flex-col text-left">
          <span className="text-xs uppercase tracking-wide opacity-80">{vendorName || 'Current vendor'}</span>
          <span className="font-semibold text-lg">{cart.length} {cart.length === 1 ? 'item' : 'items'} · {formatCurrency(getTotalPrice())}</span>
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <FaShoppingCart className="text-xl" />
          <span>View Cart</span>
        </div>
      </button>
    </div>
  );
};

// Cart View Component
const CartView = ({ cart, updateQuantity, removeFromCart, getTotalPrice, onProceedToCheckout, vendors }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <FaShoppingCart className="text-green-600" />
      Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
    </h3>

    {cart.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        <FaShoppingCart className="text-4xl mx-auto mb-2 opacity-30" />
        <p>Your cart is empty</p>
        <p className="text-sm mt-2">Browse vendors and add items to get started</p>
      </div>
    ) : (
      <>
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {cart.map(item => {
            const itemVendor = vendors.find(vendor => vendor.id === item.vendorId);
            
            return (
              <div key={item.cartItemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>₱{item.price.toFixed(2)} each</span>
                    {itemVendor && (
                      <>
                        <span>•</span>
                        <span className="text-green-600 font-medium">{itemVendor.name}</span>
                      </>
                    )}
                  </div>
                  {item.customizations && (
                    <p className="text-xs text-gray-500 mt-1">{item.customizations}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total:</span>
            <span className="text-green-600">₱{getTotalPrice().toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={onProceedToCheckout}
          disabled={cart.length === 0}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">{vendor.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <FaTimes className="text-gray-600" />
            </button>
          </div>

          <p className="text-gray-600 mb-6">{item.description}</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Customization options coming soon...</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
              >
                -
              </button>
              <span className="w-12 text-center font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-green-600">₱{calculatePrice().toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
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
  // Phone verification removed; ordering allowed if a phone number exists.

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setServiceType(null);
      setDeliveryLocation({ building: '', floor: '', room: '' });
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
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">₱{getTotalPrice().toFixed(2)}</span>
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

              <div className="space-y-4 mb-6">
                <div 
                  onClick={() => onInputChange('paymentMethod', 'cash')}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    orderDetails.paymentMethod === 'cash' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={orderDetails.paymentMethod === 'cash'}
                    onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Cash on {serviceType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                    <p className="text-sm text-gray-600">Pay when you {serviceType === 'pickup' ? 'pick up' : 'receive'} your order</p>
                  </div>
                </div>
                
                <div 
                  onClick={() => onInputChange('paymentMethod', 'gcash')}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    orderDetails.paymentMethod === 'gcash' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="gcash"
                    checked={orderDetails.paymentMethod === 'gcash'}
                    onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">GCash</span>
                    <p className="text-sm text-gray-600">Pay using GCash e-wallet</p>
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
                  {selectedDealId && (
                    <div className="flex justify-between text-green-700">
                      <span>Deal Discount</span>
                      <span>-₱{getDiscountForSelectedDeal().toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">₱{(getTotalPrice() - getDiscountForSelectedDeal()).toFixed(2)}</span>
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <FaStore className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BrightBite</h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <FaUniversity className="text-green-600" />
                  {userCampus.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {!selectedVendor ? (
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vendors or food..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))
                  ) : vendors.filter(v => 
                      searchQuery === '' || 
                      v.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map(vendor => (
                      <div
                        key={vendor.id}
                        onClick={() => handleVendorSelect(vendor)}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-all"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                            {vendor.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{vendor.name}</h3>
                            <p className="text-sm text-gray-600">{vendor.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs">
                              <span className={`px-2 py-0.5 rounded-full ${
                                vendor.type === 'campus_canteen' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {vendor.type === 'campus_canteen' ? 'Campus Canteen' : 'Partner Store'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <FaStar />
                            <span className="font-semibold">{vendor.rating || 4.7}</span>
                            <span className="text-gray-500">({vendor.reviews || 0})</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <FaClock />
                            <span>{vendor.prepTime || '10-15 min'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FaMapMarkerAlt className="text-green-600" />
                          <span>{vendor.location || 'On campus'}</span>
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
                  className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 bg-white rounded-lg border border-gray-200"
                >
                  <FaArrowLeft className="text-green-600" />
                  Back to Vendors
                </button>

                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
                      {selectedVendor.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedVendor.name}</h2>
                      <p className="text-gray-600">{selectedVendor.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1 text-yellow-500">
                          <FaStar />
                          <span className="font-semibold">{selectedVendor.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <FaMapMarkerAlt />
                          <span>{selectedVendor.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                  <div className="flex gap-2 overflow-x-auto">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                          categoryFilter === cat
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMenuItems.map(item => (
                    <div 
                      key={item.id}
                      className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                        item.available ? 'hover:shadow-md cursor-pointer' : 'opacity-60'
                      }`}
                    >
                      <div className="relative h-40 bg-gray-200">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                            <FaStore className="text-6xl text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                        >
                          {favorites.includes(item.id) ? (
                            <FaHeart className="text-red-500" />
                          ) : (
                            <FaRegHeart className="text-gray-400" />
                          )}
                        </button>
                        {!item.available && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">Sold Out</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            <FaStar />
                            <span>{item.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-green-600">₱{item.price.toFixed(2)}</span>
                          <button
                            onClick={() => handleItemClick(item)}
                            disabled={!item.available}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
                          >
                            <FaShoppingCart />
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