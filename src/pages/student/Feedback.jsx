import React, { useState } from 'react';
import { apiClient } from '../../api';
import {
  FaComments,
  FaStar,
  FaPaperPlane,
  FaCheckCircle
} from 'react-icons/fa';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const maxChars = 500;

  const categories = [
    { id: 'general', label: 'General Feedback' },
    { id: 'food', label: 'Food Quality' },
    { id: 'service', label: 'Service' },
    { id: 'app', label: 'App Experience' },
    { id: 'suggestion', label: 'Suggestion' },
    { id: 'complaint', label: 'Complaint' }
  ];

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
      const res = await apiClient('/feedback', {
        method: 'POST',
        body: JSON.stringify({ rating, category, message }),
      });
      if (res?.success) {
        setSubmitted(true);
        setRating(0);
        setCategory('general');
        setMessage('');
      }
    } catch (err) {
      alert(err?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaComments className="text-pink-600" />
            Feedback
          </h1>
          <p className="text-gray-600 mt-2">We'd love to hear from you!</p>
        </div>

        {submitted ? (
          /* Success Message */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-5xl text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your feedback has been submitted successfully.</p>
            <p className="text-sm text-gray-500 mt-2">We appreciate your input and will use it to improve our service.</p>
          </div>
        ) : (
          /* Feedback Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
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
                      className={`text-4xl ${
                        star <= (hoverRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-lg font-medium text-gray-700">
                    {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very Poor'}
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                What is this about?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                      category === cat.id
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Tell us more
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts, suggestions, or concerns..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {message.length}/{maxChars} characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-6 py-4 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center gap-2 ${loading ? 'bg-pink-400 cursor-not-allowed text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
            >
              <FaPaperPlane />
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Your Voice Matters</h3>
          <p className="text-sm text-blue-800">
            We read every piece of feedback and use it to make BrightBite better. 
            Thank you for helping us improve your campus dining experience!
          </p>
        </div>
      </div>
    </div>
  );
}
