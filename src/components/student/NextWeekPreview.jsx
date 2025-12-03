import React, { useEffect, useState } from 'react';
import { 
  FaCalendarAlt, FaFire, FaUtensils, FaArrowRight, 
  FaSync, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import { API_BASE } from '../../api';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

const MEAL_TYPE_COLORS = {
  Breakfast: 'bg-amber-100 text-amber-700',
  Lunch: 'bg-emerald-100 text-emerald-700',
  Dinner: 'bg-blue-100 text-blue-700',
  Snack: 'bg-purple-100 text-purple-700'
};

const NextWeekPreview = ({ onGeneratePlan }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedDay, setSelectedDay] = useState('monday');

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/insights/next-week-preview`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch preview');
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateDay = (direction) => {
    const currentIndex = DAYS.indexOf(selectedDay);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDay(DAYS[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < DAYS.length - 1) {
      setSelectedDay(DAYS[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading meal plan...</span>
        </div>
      </div>
    );
  }

  if (!data?.has_plan) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border border-blue-100 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-blue-600 text-2xl" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No Meal Plan Yet</h3>
          <p className="text-slate-600 text-sm mb-4">
            Generate your personalized weekly meal plan based on your preferences.
          </p>
          <button
            onClick={onGeneratePlan}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
          >
            Generate Plan <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>
    );
  }

  const plan = data.plan || {};
  const summary = data.daily_summary || {};
  const dayMeals = plan[selectedDay] || [];
  const daySummary = summary[selectedDay] || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-xl" />
            <div>
              <h3 className="font-bold">{data.week_label || 'Weekly Meal Plan'}</h3>
              <p className="text-emerald-100 text-sm">Your personalized meals for the week</p>
            </div>
          </div>
          <button
            onClick={fetchPreview}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Refresh"
          >
            <FaSync className="text-sm" />
          </button>
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <button
          onClick={() => navigateDay('prev')}
          disabled={selectedDay === 'monday'}
          className={`p-2 rounded-lg transition-colors ${
            selectedDay === 'monday' 
              ? 'text-slate-300 cursor-not-allowed' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FaChevronLeft />
        </button>
        
        <div className="flex gap-1 overflow-x-auto">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedDay === day
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => navigateDay('next')}
          disabled={selectedDay === 'sunday'}
          className={`p-2 rounded-lg transition-colors ${
            selectedDay === 'sunday' 
              ? 'text-slate-300 cursor-not-allowed' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Day Summary */}
      <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 capitalize font-medium">
            {selectedDay}
          </span>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-slate-600">
              <FaUtensils className="text-emerald-500" />
              {daySummary.meal_count || 0} meals
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <FaFire className="text-orange-500" />
              {daySummary.total_calories || 0} cal
            </span>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
        {dayMeals.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <FaUtensils className="text-2xl mx-auto mb-2 opacity-40" />
            <p className="text-sm">No meals planned for this day</p>
          </div>
        ) : (
          dayMeals.map((meal, idx) => (
            <div 
              key={meal.id || idx}
              className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                MEAL_TYPE_COLORS[meal.type] || 'bg-slate-100 text-slate-600'
              }`}>
                {meal.type}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 text-sm">{meal.name}</h4>
                <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{meal.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FaFire className="text-orange-400" />
                    {meal.calories} cal
                  </span>
                  {meal.macros && (
                    <>
                      <span>P: {meal.macros.protein}g</span>
                      <span>C: {meal.macros.carbs}g</span>
                      <span>F: {meal.macros.fats}g</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
        <button
          onClick={onGeneratePlan}
          className="w-full py-2 text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Regenerate Plan →
        </button>
      </div>
    </div>
  );
};

export default NextWeekPreview;
