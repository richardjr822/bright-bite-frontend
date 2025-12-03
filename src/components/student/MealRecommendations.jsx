import React, { useEffect, useState } from 'react';
import { 
  FaRobot, FaStore, FaFire, FaStar, FaLeaf, FaShoppingCart,
  FaArrowRight, FaSync, FaBolt, FaChartLine
} from 'react-icons/fa';
import { API_BASE } from '../../api';

const MealRecommendations = ({ onAddToCart, onViewMeal }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('algorithmic');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/insights/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'algorithmic', 
      label: 'For You', 
      icon: <FaRobot />,
      color: 'emerald'
    },
    { 
      id: 'vendor_available', 
      label: 'Available', 
      icon: <FaStore />,
      color: 'blue'
    },
    { 
      id: 'vendor_recommended', 
      label: 'Popular', 
      icon: <FaFire />,
      color: 'orange'
    }
  ];

  const formatPrice = (price) => {
    return `₱${parseFloat(price || 0).toFixed(2)}`;
  };

  const MealCard = ({ item, showScore = false }) => {
    const score = item.match_score || 0;
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
        {/* Image */}
        <div className="relative h-32 bg-slate-100">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          
          {/* Score Badge */}
          {showScore && score > 0 && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
              score > 80 ? 'bg-emerald-500 text-white' :
              score > 60 ? 'bg-amber-500 text-white' :
              'bg-slate-500 text-white'
            }`}>
              {Math.round(score)}% match
            </div>
          )}
          
          {/* Vegetarian Badge */}
          {item.is_vegetarian && (
            <div className="absolute top-2 left-2 p-1.5 bg-green-500 text-white rounded-full">
              <FaLeaf className="text-xs" />
            </div>
          )}
          
          {/* Discount Badge */}
          {item.has_discount && item.discount_percentage > 0 && (
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 text-white rounded text-xs font-bold">
              -{item.discount_percentage}%
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-3">
          <h4 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h4>
          <p className="text-slate-500 text-xs truncate mt-0.5">{item.description}</p>
          
          {/* Macros */}
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <FaFire className="text-orange-400" />
              {item.calories || 0} cal
            </span>
            <span>•</span>
            <span>{item.protein || 0}g protein</span>
          </div>
          
          {/* Recommendation Reason */}
          {item.recommendation_reason && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <FaBolt className="text-amber-500" />
              {item.recommendation_reason}
            </p>
          )}
          
          {/* Price & Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="font-bold text-emerald-600">{formatPrice(item.price)}</span>
            <div className="flex gap-2">
              <button
                onClick={() => onViewMeal?.(item)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="View details"
              >
                <FaArrowRight className="text-xs" />
              </button>
              <button
                onClick={() => onAddToCart?.(item)}
                className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                title="Add to cart"
              >
                <FaShoppingCart className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Finding the best meals for you...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="text-sm text-emerald-600 hover:underline flex items-center gap-2 mx-auto"
        >
          <FaSync /> Try again
        </button>
      </div>
    );
  }

  const recommendations = data?.recommendations || {};
  const activeData = recommendations[activeTab] || { items: [] };
  const userContext = data?.user_context || {};

  return (
    <div className="space-y-4">
      {/* Header with User Context */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FaChartLine /> Meal Recommendations
            </h3>
            <p className="text-emerald-100 text-sm mt-1">
              Based on your <span className="font-medium">{userContext.goal || 'maintain'}</span> goal 
              ({userContext.calorie_target || 2000} cal target)
            </p>
          </div>
          <button
            onClick={fetchRecommendations}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh recommendations"
          >
            <FaSync />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? `bg-white text-${tab.color}-600 shadow-sm`
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-slate-900">{activeData.title}</h4>
          <p className="text-slate-500 text-sm">{activeData.description}</p>
        </div>
        <span className="text-xs text-slate-400">
          {activeData.items?.length || 0} meals
        </span>
      </div>

      {/* Meal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeData.items?.map((item, idx) => (
          <MealCard 
            key={item.id || idx} 
            item={item} 
            showScore={activeTab === 'algorithmic'}
          />
        ))}
      </div>

      {activeData.items?.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No meals available in this category</p>
        </div>
      )}
    </div>
  );
};

export default MealRecommendations;
