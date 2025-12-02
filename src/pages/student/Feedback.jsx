import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE } from '../../api';
import {
  FaComments,
  FaStar,
  FaPaperPlane,
  FaCheckCircle,
  FaUtensils,
  FaLightbulb,
  FaThumbsUp,
  FaThumbsDown,
  FaHeart
} from 'react-icons/fa';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mealPreferences, setMealPreferences] = useState([]);
  const [feedbackTags, setFeedbackTags] = useState([]);
  const maxChars = 500;

  const categories = [
    { id: 'general', label: 'General Feedback' },
    { id: 'food', label: 'Food Quality' },
    { id: 'service', label: 'Service' },
    { id: 'app', label: 'App Experience' },
    { id: 'suggestion', label: 'Suggestion' },
    { id: 'meal_recommendation', label: 'Meal Recommendations' }
  ];

  // Tags for AI learning
  const availableTags = [
    { id: 'too_spicy', label: 'Too Spicy' },
    { id: 'not_enough_portion', label: 'Small Portion' },
    { id: 'great_taste', label: 'Great Taste' },
    { id: 'healthy_option', label: 'Healthy Option' },
    { id: 'good_value', label: 'Good Value' },
    { id: 'fast_delivery', label: 'Fast Delivery' },
    { id: 'recommend_more', label: 'Want More Like This' },
    { id: 'not_as_expected', label: 'Not As Expected' }
  ];

  // Fetch recent orders for feedback
  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/student/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Get last 5 orders
        setRecentOrders((data.orders || []).slice(0, 5));
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  const toggleTag = (tagId) => {
    setFeedbackTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !message) {
      alert('Please provide a rating and message');
      return;
    }
    if (message.length > maxChars) {
      alert(`Message exceeds ${maxChars} characters`);
      return;
    }
    setLoading(true);
    try {
      // Build feedback payload with AI learning data
      const feedbackPayload = {
        rating,
        category,
        message,
        // Feedback loop data for AI recommendations
        ai_feedback: {
          order_id: selectedOrder?.id || null,
          vendor_id: selectedOrder?.vendor_id || null,
          tags: feedbackTags,
          meal_items: selectedOrder?.items?.map(i => i.name) || [],
          preference_signals: {
            would_order_again: rating >= 4,
            recommend_similar: feedbackTags.includes('recommend_more'),
            avoid_similar: feedbackTags.includes('not_as_expected'),
            taste_preference: feedbackTags.filter(t => ['too_spicy', 'great_taste'].includes(t)),
            portion_preference: feedbackTags.filter(t => ['not_enough_portion', 'good_value'].includes(t)),
            health_conscious: feedbackTags.includes('healthy_option')
          }
        }
      };

      const res = await apiClient('/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackPayload),
      });
      if (res?.success) {
        setSubmitted(true);
        setRating(0);
        setCategory('general');
        setMessage('');
        setSelectedOrder(null);
        setFeedbackTags([]);
      }
    } catch (err) {
      alert(err?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  // Format order number
  const formatOrderNumber = (orderId) => {
    if (!orderId) return '#0000';
    const idStr = String(orderId);
    const numericPart = idStr.replace(/[^0-9]/g, '');
    if (numericPart.length >= 3) {
      return `#${numericPart.slice(-4).padStart(4, '0')}`;
    }
    return `#${idStr.slice(-4).toUpperCase()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-xl flex items-center justify-center shadow-sm">
              <FaComments className="text-lg text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Feedback</h1>
              <p className="text-slate-500 text-sm">We'd love to hear from you!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

        {submitted ? (
          /* Success Message */
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-3xl text-[#0d3d23]" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Thank You!</h2>
            <p className="text-slate-600 text-sm">Your feedback has been submitted successfully.</p>
            <p className="text-xs text-slate-500 mt-2">Your input helps us personalize meal recommendations for you!</p>
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-center gap-2 text-[#0d3d23]">
                <FaLightbulb />
                <span className="text-sm font-medium">AI Learning Activated</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">Your preferences will improve future recommendations</p>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-4 py-2 text-sm font-medium text-[#0d3d23] hover:bg-green-50 rounded-lg transition-colors"
            >
              Submit Another Feedback
            </button>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recent Orders Section - For Order-Specific Feedback */}
            {recentOrders.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FaUtensils className="text-[#0d3d23]" />
                  Rate a Recent Order (Optional)
                </h3>
                <div className="space-y-2">
                  {recentOrders.map(order => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        selectedOrder?.id === order.id
                          ? 'border-[#0d3d23] bg-green-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-[#0d3d23] text-sm">{formatOrderNumber(order.id)}</span>
                          <span className="text-slate-500 text-xs ml-2">{order.vendor_name || 'Vendor'}</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {order.items.map(i => i.name || i.item_name).join(', ')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Feedback Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              {/* Rating */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <FaStar
                        className={`text-3xl ${
                          star <= (hoverRating || rating)
                            ? 'text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-sm font-medium text-slate-700">
                      {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very Poor'}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  What is this about?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-2.5 rounded-lg border transition-all font-medium text-sm ${
                        category === cat.id
                          ? 'border-[#0d3d23] bg-green-50 text-[#0d3d23]'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Tags for AI Learning */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Quick Tags <span className="text-xs text-slate-500 font-normal">(helps improve recommendations)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                        feedbackTags.includes(tag.id)
                          ? 'bg-[#0d3d23] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag.id === 'recommend_more' && <FaHeart className="text-[10px]" />}
                      {tag.id === 'great_taste' && <FaThumbsUp className="text-[10px]" />}
                      {tag.id === 'not_as_expected' && <FaThumbsDown className="text-[10px]" />}
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Tell us more
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0d3d23]/20 focus:border-[#0d3d23] resize-none text-sm"
                  placeholder="Share your thoughts, suggestions, or concerns..."
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  {message.length}/{maxChars} characters
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-5 py-3 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 ${loading ? 'bg-[#1a5d3a] cursor-not-allowed text-white' : 'bg-[#0d3d23] hover:bg-[#1a5d3a] text-white'}`}
              >
                <FaPaperPlane className="text-sm" />
                {loading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}

        {/* Info Card */}
        <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <h3 className="font-medium text-slate-900 text-sm mb-1">Your Voice Matters</h3>
          <p className="text-xs text-slate-600">
            We read every piece of feedback and use it to make BrightBite better. 
            Thank you for helping us improve your campus dining experience!
          </p>
        </div>
      </div>
    </div>
  );
}
