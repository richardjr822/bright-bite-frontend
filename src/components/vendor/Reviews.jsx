import React, { useState, useEffect } from 'react';
import { 
  FaStar,
  FaRegStar,
  FaReply,
  FaSearch,
  FaFilter,
  FaSpinner,
  FaCheckCircle,
  FaUserCircle
} from 'react-icons/fa';
import { API_BASE } from '../../api';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [responseFilter, setResponseFilter] = useState('all'); // all, responded, pending
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !user?.id) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/vendor/reviews/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (reviewId) => {
    setReplyingTo(reviewId);
    const review = reviews.find(r => r.id === reviewId);
    setReplyText(review?.vendor_response || '');
  };

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');

      if (!token || !user?.id) return;

      const response = await fetch(`${API_BASE}/vendor/reviews/${reviewId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: replyText })
      });

      if (response.ok) {
        // Backend currently doesn't persist responses; update locally for UX
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId
              ? {
                  ...review,
                  vendor_response: replyText,
                  responded_at: new Date().toISOString()
                }
              : review
          )
        );
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      // Best effort local update
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? {
                ...review,
                vendor_response: replyText,
                responded_at: new Date().toISOString()
              }
            : review
        )
      );
      setReplyingTo(null);
      setReplyText('');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-gray-300" />
            )}
          </span>
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
    const matchesResponse = responseFilter === 'all' ||
                           (responseFilter === 'responded' && review.vendor_response) ||
                           (responseFilter === 'pending' && !review.vendor_response);
    return matchesSearch && matchesRating && matchesResponse;
  });

  const calculateStats = () => {
    const total = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total || 0;
    const responded = reviews.filter(r => r.vendor_response).length;
    const responseRate = (responded / total) * 100 || 0;
    
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: reviews.filter(r => r.rating === rating).length,
      percentage: (reviews.filter(r => r.rating === rating).length / total) * 100 || 0
    }));

    return { total, avgRating, responded, responseRate, ratingDistribution };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="text-4xl text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Total Reviews</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Average Rating</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-yellow-500">{stats.avgRating.toFixed(1)}</p>
            <FaStar className="text-yellow-400 text-2xl" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Responded</p>
          <p className="text-3xl font-bold text-green-600">{stats.responded}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Response Rate</p>
          <p className="text-3xl font-bold text-blue-600">{stats.responseRate.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {stats.ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <FaStar className="text-yellow-400 text-sm" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            {/* Response Filter */}
            <select
              value={responseFilter}
              onChange={(e) => setResponseFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Reviews</option>
              <option value="responded">Responded</option>
              <option value="pending">Pending Response</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FaStar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.customer_name}</h3>
                    <p className="text-sm text-gray-500">{review.customer_email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.created_at).toLocaleDateString()} • Order #{review.order_id}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {renderStars(review.rating)}
                  {review.vendor_response && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <FaCheckCircle /> Responded
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Vendor Response */}
              {review.vendor_response && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FaUserCircle className="text-green-600 text-2xl mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 mb-1">Your Response</p>
                      <p className="text-sm text-gray-700">{review.vendor_response}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Responded on {new Date(review.responded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.id ? (
                <div className="border-t border-gray-200 pt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      disabled={submitting || !replyText.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleReply(review.id)}
                  className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  <FaReply /> {review.vendor_response ? 'Edit Response' : 'Reply to Review'}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
