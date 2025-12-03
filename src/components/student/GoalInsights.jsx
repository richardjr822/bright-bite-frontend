import React, { useEffect, useState } from 'react';
import { 
  FaFire, FaBullseye, FaDumbbell, FaHeartbeat, FaLeaf, 
  FaChartLine, FaLightbulb, FaArrowRight, FaSync 
} from 'react-icons/fa';
import { API_BASE } from '../../api';

const GoalInsights = ({ onNavigateToPreferences }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/insights/goals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch goals');
      
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
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading your goals...</span>
        </div>
      </div>
    );
  }

  if (!data?.has_preferences) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-100 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBullseye className="text-emerald-600 text-2xl" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Set Your Goals</h3>
          <p className="text-slate-600 text-sm mb-4">
            Complete your meal preferences to get personalized dietary goals and insights.
          </p>
          <button
            onClick={onNavigateToPreferences}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            Set Preferences <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    );
  }

  const { user_metrics, goal_summary, insights, weekly_targets } = data;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-amber-200 bg-amber-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'goal': return <FaBullseye className="text-emerald-600" />;
      case 'calorie': return <FaFire className="text-orange-500" />;
      case 'dietary': return <FaLeaf className="text-green-500" />;
      case 'health': return <FaHeartbeat className="text-red-500" />;
      default: return <FaLightbulb className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Goal Summary Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FaBullseye className="text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{goal_summary?.description}</h3>
              <p className="text-emerald-100 text-sm">{goal_summary?.primary_focus}</p>
            </div>
          </div>
          <button
            onClick={fetchGoals}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <FaSync className="text-sm" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-emerald-100 text-xs mb-1">BMR</p>
            <p className="font-bold text-lg">{user_metrics?.bmr}</p>
            <p className="text-emerald-200 text-xs">cal/day</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-emerald-100 text-xs mb-1">TDEE</p>
            <p className="font-bold text-lg">{user_metrics?.tdee}</p>
            <p className="text-emerald-200 text-xs">cal/day</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-emerald-100 text-xs mb-1">Target</p>
            <p className="font-bold text-lg">{user_metrics?.recommended_calories}</p>
            <p className="text-emerald-200 text-xs">cal/day</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-emerald-100 text-xs mb-1">Protein</p>
            <p className="font-bold text-lg">{user_metrics?.protein_target}g</p>
            <p className="text-emerald-200 text-xs">daily</p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaLightbulb className="text-amber-500" />
          Personalized Insights
        </h4>
        <div className="space-y-3">
          {insights?.map((insight, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getPriorityColor(insight.priority)}`}
            >
              <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
              <div>
                <h5 className="font-medium text-slate-900 text-sm">{insight.title}</h5>
                <p className="text-slate-600 text-xs mt-0.5">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Targets */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FaChartLine className="text-blue-500" />
          Weekly Targets
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <FaFire className="text-orange-500 mx-auto mb-1" />
            <p className="font-bold text-slate-900">{weekly_targets?.calories?.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Calories</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <FaDumbbell className="text-red-500 mx-auto mb-1" />
            <p className="font-bold text-slate-900">{weekly_targets?.protein}g</p>
            <p className="text-xs text-slate-500">Protein</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-500 text-lg">💧</span>
            <p className="font-bold text-slate-900">{weekly_targets?.water_liters}L</p>
            <p className="text-xs text-slate-500">Water</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <span className="text-emerald-500 text-lg">🍽️</span>
            <p className="font-bold text-slate-900">{weekly_targets?.meals}</p>
            <p className="text-xs text-slate-500">Meals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalInsights;
