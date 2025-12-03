import React, { useEffect, useState } from 'react';
import { 
  FaUsers, FaChartPie, FaLeaf, FaAllergies, FaFire, 
  FaTrophy, FaSync, FaChartBar, FaBullseye
} from 'react-icons/fa';
import { API_BASE } from '../../api';

const StudentAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/insights/vendor/student-analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch analytics');
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading student analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
        <p className="text-red-500 mb-3">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="text-sm text-emerald-600 hover:underline flex items-center gap-2 mx-auto"
        >
          <FaSync /> Try again
        </button>
      </div>
    );
  }

  const analytics = data?.analytics || {};
  const insights = data?.insights || [];

  const goalLabels = {
    lose: 'Weight Loss',
    maintain: 'Maintain',
    gain: 'Weight Gain'
  };

  const goalColors = {
    lose: 'bg-blue-500',
    maintain: 'bg-emerald-500',
    gain: 'bg-orange-500'
  };

  const totalGoals = Object.values(analytics.goal_distribution || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Insights</h2>
          <p className="text-slate-500 text-sm">Understand what your customers want</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm font-medium transition-colors"
        >
          <FaSync className="text-xs" /> Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaUsers className="text-xl" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Students Profiled</p>
              <p className="text-2xl font-bold">{analytics.total_students_profiled || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaFire className="text-xl" />
            </div>
            <div>
              <p className="text-orange-100 text-sm">Avg Calorie Target</p>
              <p className="text-2xl font-bold">{analytics.average_calorie_target || 0}</p>
            </div>
          </div>
        </div>

        {insights.map((insight, idx) => (
          <div key={idx} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                {insight.type === 'demand' ? <FaBullseye className="text-xl" /> : <FaLeaf className="text-xl" />}
              </div>
              <div>
                <p className="text-blue-100 text-sm">{insight.title}</p>
                <p className="text-xl font-bold capitalize">{insight.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goal Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaChartPie className="text-emerald-500" />
          Student Goal Distribution
        </h3>
        <div className="space-y-3">
          {Object.entries(analytics.goal_distribution || {}).map(([goal, count]) => {
            const percentage = totalGoals > 0 ? Math.round((count / totalGoals) * 100) : 0;
            return (
              <div key={goal}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700">{goalLabels[goal] || goal}</span>
                  <span className="text-sm font-medium text-slate-900">{count} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${goalColors[goal] || 'bg-slate-400'} rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dietary Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FaLeaf className="text-green-500" />
            Dietary Preferences
          </h3>
          <div className="space-y-2">
            {Object.entries(analytics.dietary_preferences || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([pref, count]) => (
                <div key={pref} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700 capitalize">{pref}</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">
                    {count} students
                  </span>
                </div>
              ))}
          </div>
          {Object.keys(analytics.dietary_preferences || {}).length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">No data available</p>
          )}
        </div>

        {/* Common Allergies */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FaAllergies className="text-red-500" />
            Common Allergies
          </h3>
          <div className="space-y-2">
            {Object.entries(analytics.common_allergies || {})
              .filter(([key]) => key !== 'none')
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([allergy, count]) => (
                <div key={allergy} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700 capitalize">{allergy}</span>
                  <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">
                    {count} students
                  </span>
                </div>
              ))}
          </div>
          {Object.keys(analytics.common_allergies || {}).filter(k => k !== 'none').length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">No allergies reported</p>
          )}
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaTrophy className="text-amber-500" />
          Top Ordered Items
        </h3>
        {analytics.popular_items?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {analytics.popular_items.map((item, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-lg border ${
                  idx === 0 ? 'bg-amber-50 border-amber-200' :
                  idx === 1 ? 'bg-slate-50 border-slate-200' :
                  idx === 2 ? 'bg-orange-50 border-orange-200' :
                  'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {idx < 3 && (
                    <span className="text-lg">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                  <span className="font-medium text-slate-900 text-sm truncate">{item.name}</span>
                </div>
                <p className="text-xs text-slate-500">{item.order_count} orders</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-4">No order data available</p>
        )}
      </div>

      {/* Recommendations for Vendor */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100 p-5">
        <h3 className="font-semibold text-slate-900 mb-3">💡 Recommendations for Your Menu</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          {analytics.average_calorie_target && analytics.average_calorie_target < 1800 && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              Consider adding more low-calorie, high-protein options for weight-conscious students.
            </li>
          )}
          {Object.keys(analytics.dietary_preferences || {}).includes('vegetarian') && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              Vegetarian options are in demand - ensure variety in plant-based meals.
            </li>
          )}
          {Object.keys(analytics.common_allergies || {}).filter(k => k !== 'none').length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">•</span>
              Clearly label allergens on your menu items to build trust with students.
            </li>
          )}
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">•</span>
            Students respond well to items with visible calorie and protein information.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StudentAnalytics;
