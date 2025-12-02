import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE as CANONICAL_API_BASE } from '../../api.js';
import {
  FaHeartbeat,
  FaFire,
  FaDrumstickBite,
  FaBreadSlice,
  FaTint,
  FaPlus,
  FaTrash,
  FaChartLine,
  FaUtensils,
  FaCalendarAlt,
  FaCheckCircle,
  FaBolt,
  FaArrowRight,
  FaSync,
  FaClock,
  FaLeaf,
  FaChartPie,
  FaTrophy,
  FaLightbulb,
  FaEdit,
  FaTimes,
  FaSave
} from 'react-icons/fa';

// Progress Ring Component
const ProgressRing = ({ value, max, size = 100, strokeWidth = 8, color = '#22c55e', label, icon: Icon }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const isOver = value > max;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#e5e7eb"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={isOver ? '#ef4444' : color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {Icon && <Icon className="text-lg mb-0.5" style={{ color: isOver ? '#ef4444' : color }} />}
        <span className="text-lg font-bold text-gray-900">{Math.round(percentage)}%</span>
      </div>
      {label && <span className="mt-2 text-xs font-medium text-gray-600">{label}</span>}
    </div>
  );
};

// Quick Log Card for Planned Meals
const PlannedMealCard = ({ meal, onLog, logging }) => (
  <div className="group bg-white border-2 border-gray-100 rounded-xl p-3 hover:border-green-300 hover:shadow-md transition-all duration-300">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{meal.name}</p>
        <p className="text-xs text-gray-500 capitalize">{meal.type}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
          <span className="flex items-center gap-1"><FaFire className="text-orange-500" />{meal.calories}</span>
          <span>P{meal.macros?.protein || 0}g</span>
        </div>
      </div>
      <button
        onClick={() => onLog(meal)}
        disabled={logging}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-200 group-hover:scale-110"
      >
        {logging ? <FaSync className="animate-spin text-xs" /> : <FaPlus className="text-xs" />}
      </button>
    </div>
  </div>
);

export default function NutritionTracker() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [loggingMealId, setLoggingMealId] = useState(null);
  const [deletingMealId, setDeletingMealId] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [newMeal, setNewMeal] = useState({
    name: '',
    mealType: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });

  // Planned meals from meal planner
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Preferences and goals (personalized)
  const DEFAULT_GOALS = useMemo(() => ({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65
  }), []);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [preferences, setPreferences] = useState(null);
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(0);

  const API_BASE = `${CANONICAL_API_BASE}`;

  const getUser = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const buildHeaders = () => {
    const user = getUser();
    const token = user?.token || localStorage.getItem('token');
    const userId = user?.id || user?._id || user?.userId || user?.user_id || localStorage.getItem('userId');
    const h = {
      'Content-Type': 'application/json'
    };
    if (userId) h['x-user-id'] = userId;
    if (token) h['Authorization'] = `Bearer ${token}`;
    return { headers: h, userId };
  };

  const normalizePrefs = (raw) => {
    if (!raw) return null;
    return {
      goal: raw.goal,
      macroPreference: raw.macro_preference || raw.macroPreference,
      calorieTarget: raw.calorie_target || raw.calorieTarget,
      mealsPerDay: raw.meals_per_day || raw.mealsPerDay,
      appetite: raw.appetite,
    };
  };

  const fetchPreferences = async () => {
    const { headers, userId } = buildHeaders();
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/meal-preferences/${userId}`, { headers });
      if (!res.ok) throw new Error(`Preferences fetch failed ${res.status}`);
      const data = await res.json();
      const prefs = normalizePrefs(data.data || data.preferences);
      if (prefs) {
        setPreferences(prefs);
        localStorage.setItem('mealPreferences', JSON.stringify(prefs));
        setGoals(computeGoalsFromPreferences(prefs));
      }
    } catch (e) {
      // fallback to localStorage already handled elsewhere
    }
  };

  const mapMealRow = (row) => {
    return {
      id: row.id || row.ID || row.meal_id || Date.now() + Math.random(),
      name: row.name,
      mealType: (row.meal_type || row.mealType || 'snack').toLowerCase(),
      calories: Number(row.calories) || 0,
      protein: Number(row.protein) || 0,
      carbs: Number(row.carbs) || 0,
      fats: Number(row.fats) || 0,
      time: (row.meal_time || row.mealTime) ? new Date(row.meal_time || row.mealTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
    };
  };

  const fetchMeals = async () => {
    const { headers, userId } = buildHeaders();
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/meal-plans/meals?today=true`, { headers });
      if (!res.ok) throw new Error(`Meals fetch failed ${res.status}`);
      const data = await res.json();
      const rows = data.data || data.meals || [];
      setMeals(rows.map(mapMealRow));
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchSummary = async () => {
    const { headers, userId } = buildHeaders();
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/meal-plans/meals/summary`, { headers });
      if (!res.ok) throw new Error(`Summary fetch failed ${res.status}`);
      const data = await res.json();
      setSummary(data.data || data.summary || null);
    } catch (e) {
      // non-critical
    }
  };

  // Fetch today's planned meals from meal planner
  const fetchPlannedMeals = async () => {
    const { headers, userId } = buildHeaders();
    if (!userId) return;
    setLoadingPlan(true);
    try {
      const res = await fetch(`${API_BASE}/meal-plans/plan`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      const plan = data.plan || {};
      
      // Get today's day name
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      const todayMeals = plan[today] || [];
      
      setPlannedMeals(todayMeals);
    } catch (e) {
      console.error('Failed to fetch planned meals:', e);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Quick log a planned meal
  const logPlannedMeal = async (meal) => {
    const { headers, userId } = buildHeaders();
    if (!userId) return;
    
    setLoggingMealId(meal.id);
    const payload = {
      user_id: userId,
      name: meal.name,
      meal_type: (meal.type || 'snack').toLowerCase(),
      calories: meal.calories || 0,
      protein: meal.macros?.protein || 0,
      carbs: meal.macros?.carbs || 0,
      fats: meal.macros?.fats || 0,
      meal_time: new Date().toISOString()
    };
    
    try {
      const res = await fetch(`${API_BASE}/meal-plans/meals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to log meal');
      await fetchMeals();
      await fetchSummary();
    } catch (e) {
      alert(e.message);
    } finally {
      setLoggingMealId(null);
    }
  };

  // Calculate streak (mock - would need backend support for real implementation)
  const calculateStreak = useCallback(() => {
    // For now, set streak based on if user has logged meals today
    if (meals.length > 0) {
      setStreak(prev => Math.max(prev, 1));
    }
  }, [meals]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // localStorage preferences first
      try {
        const raw = localStorage.getItem('mealPreferences');
        if (raw) {
          const prefs = JSON.parse(raw);
          setPreferences(prefs);
          setGoals(computeGoalsFromPreferences(prefs));
        }
      } catch {
        setPreferences(null);
        setGoals(DEFAULT_GOALS);
      }
      await Promise.all([
        fetchPreferences(),
        fetchMeals(),
        fetchSummary(),
        fetchPlannedMeals()
      ]);
      setLoading(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    calculateStreak();
  }, [meals, calculateStreak]);

  const computeGoalsFromPreferences = (prefs) => {
    // Base calories
    const rawCalories = parseInt(prefs?.calorieTarget, 10);
    let calories = Number.isFinite(rawCalories) && rawCalories > 800 ? rawCalories : DEFAULT_GOALS.calories;

    // Adjust by goal
    if (prefs?.goal === 'lose') calories = Math.round(calories * 0.85);
    if (prefs?.goal === 'gain') calories = Math.round(calories * 1.15);

    // Adjust by appetite
    if (prefs?.appetite === 'light') calories = Math.round(calories * 0.9);
    if (prefs?.appetite === 'heavy') calories = Math.round(calories * 1.1);

    // Macro split
    const splits = {
      balanced: { carbs: 40, protein: 30, fats: 30 },       // 40/30/30
      'high-protein': { carbs: 30, protein: 40, fats: 30 }, // 30/40/30
      'low-carb': { carbs: 20, protein: 40, fats: 40 }      // 20/40/40
    };
    const macroPref = splits[prefs?.macroPreference] || splits.balanced;

    // Grams: protein/carbs=4 kcal/g, fats=9 kcal/g
    const protein = Math.round((calories * (macroPref.protein / 100)) / 4);
    const carbs = Math.round((calories * (macroPref.carbs / 100)) / 4);
    const fats = Math.round((calories * (macroPref.fats / 100)) / 9);

    return { calories, protein, carbs, fats };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mealPreferences');
      if (raw) {
        const prefs = JSON.parse(raw);
        setPreferences(prefs);
        setGoals(computeGoalsFromPreferences(prefs));
      } else {
        setPreferences(null);
        setGoals(DEFAULT_GOALS);
      }
    } catch {
      setPreferences(null);
      setGoals(DEFAULT_GOALS);
    }
  }, [DEFAULT_GOALS]);

  // Calculate totals
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fats: acc.fats + meal.fats
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const getPercentage = (value, goal) => Math.min((value / goal) * 100, 100);

  const addMeal = async () => {
    if (!newMeal.name || !newMeal.calories) {
      alert('Please fill in meal name and calories');
      return;
    }
    const { headers, userId } = buildHeaders();
    if (!userId) {
      alert('Missing user session');
      return;
    }
    const payload = {
      user_id: userId,
      name: newMeal.name,
      meal_type: newMeal.mealType,
      calories: parseFloat(newMeal.calories) || 0,
      protein: parseFloat(newMeal.protein) || 0,
      carbs: parseFloat(newMeal.carbs) || 0,
      fats: parseFloat(newMeal.fats) || 0,
      meal_time: new Date().toISOString()
    };
    try {
      const res = await fetch(`${API_BASE}/meal-plans/meals`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to log meal');
      await fetchMeals();
      await fetchSummary();
      setNewMeal({ name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fats: '' });
      setShowAddMeal(false);
    } catch (e) {
      alert(e.message);
    }
  };

  const deleteMeal = async (id) => {
    const { headers, userId } = buildHeaders();
    if (!userId) return;
    
    setDeletingMealId(id);
    try {
      const res = await fetch(`${API_BASE}/meal-plans/meals/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete meal');
      setMeals(meals.filter(meal => meal.id !== id));
      await fetchSummary();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingMealId(null);
    }
  };

  const startEditMeal = (meal) => {
    setEditingMeal({
      id: meal.id,
      name: meal.name,
      mealType: meal.mealType,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString()
    });
  };

  const saveEditMeal = async () => {
    if (!editingMeal) return;
    const { headers, userId } = buildHeaders();
    if (!userId) return;

    try {
      const res = await fetch(`${API_BASE}/meal-plans/meals/${editingMeal.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          name: editingMeal.name,
          meal_type: editingMeal.mealType,
          calories: parseFloat(editingMeal.calories) || 0,
          protein: parseFloat(editingMeal.protein) || 0,
          carbs: parseFloat(editingMeal.carbs) || 0,
          fats: parseFloat(editingMeal.fats) || 0
        })
      });
      if (!res.ok) throw new Error('Failed to update meal');
      await fetchMeals();
      await fetchSummary();
      setEditingMeal(null);
    } catch (e) {
      alert(e.message);
    }
  };

  const cancelEditMeal = () => {
    setEditingMeal(null);
  };

  const getMealTypeColor = (type) => {
    const colors = {
      breakfast: 'bg-yellow-100 text-yellow-700',
      lunch: 'bg-green-100 text-green-700',
      dinner: 'bg-blue-100 text-blue-700',
      snack: 'bg-purple-100 text-purple-700'
    };
    return colors[type] || colors.snack;
  };

  const mealsByType = {
    breakfast: meals.filter(m => m.mealType === 'breakfast'),
    lunch: meals.filter(m => m.mealType === 'lunch'),
    dinner: meals.filter(m => m.mealType === 'dinner'),
    snack: meals.filter(m => m.mealType === 'snack')
  };

  // Calculate remaining macros
  const remaining = {
    calories: Math.max(0, goals.calories - totals.calories),
    protein: Math.max(0, goals.protein - totals.protein),
    carbs: Math.max(0, goals.carbs - totals.carbs),
    fats: Math.max(0, goals.fats - totals.fats)
  };

  // Get today's day name for display
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease-out forwards; }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .pulse-ring { animation: pulse-ring 2s infinite; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Enhanced Header */}
        <header className="bg-gradient-to-br from-white via-white to-green-50/50 border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaHeartbeat className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nutrition Tracker</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FaCalendarAlt className="text-green-500" />
                  {todayLabel}
                  {streak > 0 && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      <FaTrophy className="text-amber-500" /> {streak} day streak
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {preferences && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                  <FaLeaf className="text-green-500" />
                  <span className="text-sm font-medium text-green-700 capitalize">{preferences.goal || 'maintain'}</span>
                </div>
              )}
              <button
                onClick={() => { fetchPreferences(); fetchMeals(); fetchSummary(); fetchPlannedMeals(); }}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:border-green-400 hover:text-green-600 transition-all"
              >
                <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => navigate('/meal-planner')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <FaUtensils /> Meal Plan
              </button>
            </div>
          </div>
        </header>

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaHeartbeat className="text-red-500" />
            </div>
            <div>
              <p className="font-medium text-red-800">Error loading data</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Rings Section */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Main Calorie Ring */}
            <div className="flex items-center gap-6">
              <ProgressRing 
                value={totals.calories} 
                max={goals.calories} 
                size={120} 
                strokeWidth={10} 
                color="#f97316"
                icon={FaFire}
              />
              <div>
                <p className="text-3xl font-bold text-gray-900">{totals.calories}</p>
                <p className="text-sm text-gray-500">of {goals.calories} kcal</p>
                <p className={`mt-1 text-sm font-medium ${remaining.calories > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remaining.calories > 0 ? `${remaining.calories} remaining` : `${Math.abs(goals.calories - totals.calories)} over`}
                </p>
              </div>
            </div>

            {/* Macro Rings */}
            <div className="flex items-center gap-6 sm:gap-8">
              <div className="text-center">
                <ProgressRing value={totals.protein} max={goals.protein} size={80} strokeWidth={6} color="#ef4444" icon={FaDrumstickBite} />
                <p className="mt-2 text-sm font-bold text-gray-700">{totals.protein}g</p>
                <p className="text-xs text-gray-500">Protein</p>
              </div>
              <div className="text-center">
                <ProgressRing value={totals.carbs} max={goals.carbs} size={80} strokeWidth={6} color="#eab308" icon={FaBreadSlice} />
                <p className="mt-2 text-sm font-bold text-gray-700">{totals.carbs}g</p>
                <p className="text-xs text-gray-500">Carbs</p>
              </div>
              <div className="text-center">
                <ProgressRing value={totals.fats} max={goals.fats} size={80} strokeWidth={6} color="#3b82f6" icon={FaTint} />
                <p className="mt-2 text-sm font-bold text-gray-700">{totals.fats}g</p>
                <p className="text-xs text-gray-500">Fats</p>
              </div>
            </div>
          </div>

          {/* Remaining Macros Bar */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FaLightbulb className="text-amber-500" /> Remaining to reach your goals
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-orange-700">{remaining.calories}</p>
                <p className="text-xs text-orange-600">kcal</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-red-700">{remaining.protein}g</p>
                <p className="text-xs text-red-600">Protein</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-yellow-700">{remaining.carbs}g</p>
                <p className="text-xs text-yellow-600">Carbs</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-blue-700">{remaining.fats}g</p>
                <p className="text-xs text-blue-600">Fats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Log from Meal Plan */}
        {plannedMeals.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <FaBolt className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Quick Log from Today's Plan</h3>
                  <p className="text-sm text-gray-600">Tap to instantly log planned meals</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/meal-planner')}
                className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-1"
              >
                View Full Plan <FaArrowRight />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {plannedMeals.slice(0, 4).map((meal, idx) => (
                <div key={meal.id || idx} className="animate-fadeInUp" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <PlannedMealCard 
                    meal={meal} 
                    onLog={logPlannedMeal} 
                    logging={loggingMealId === meal.id} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meals List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Meal Button */}
            <button
              onClick={() => setShowAddMeal(!showAddMeal)}
              className={`w-full px-4 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                showAddMeal 
                  ? 'bg-gray-200 text-gray-600' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              <FaPlus className={`transition-transform ${showAddMeal ? 'rotate-45' : ''}`} />
              {showAddMeal ? 'Cancel' : 'Log a Meal'}
            </button>

            {/* Add Meal Form */}
            {showAddMeal && (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6 animate-fadeInUp">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUtensils className="text-green-500" />
                  Log New Meal
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name</label>
                    <input
                      type="text"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      placeholder="e.g., Chicken Adobo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewMeal({ ...newMeal, mealType: type })}
                          className={`px-3 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                            newMeal.mealType === type
                              ? 'bg-green-500 text-white shadow'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaFire className="inline text-orange-500 mr-1" /> Calories
                      </label>
                      <input
                        type="number"
                        value={newMeal.calories}
                        onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="kcal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaDrumstickBite className="inline text-red-500 mr-1" /> Protein
                      </label>
                      <input
                        type="number"
                        value={newMeal.protein}
                        onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="grams"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaBreadSlice className="inline text-yellow-500 mr-1" /> Carbs
                      </label>
                      <input
                        type="number"
                        value={newMeal.carbs}
                        onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="grams"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FaTint className="inline text-blue-500 mr-1" /> Fats
                      </label>
                      <input
                        type="number"
                        value={newMeal.fats}
                        onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="grams"
                      />
                    </div>
                  </div>

                  <button
                    onClick={addMeal}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle /> Log Meal
                  </button>
                </div>
              </div>
            )}

            {/* Meals by Type */}
            {Object.entries(mealsByType).map(([type, typeMeals]) => (
              typeMeals.length > 0 && (
                <div key={type} className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 overflow-hidden">
                  <div className={`px-4 py-3 ${getMealTypeColor(type)} bg-opacity-50`}>
                    <h3 className="text-base font-bold capitalize flex items-center gap-2">
                      {type === 'breakfast' && '🌅'}
                      {type === 'lunch' && '☀️'}
                      {type === 'dinner' && '🌙'}
                      {type === 'snack' && '🍎'}
                      {type}
                      <span className="text-xs font-normal opacity-75">({typeMeals.length})</span>
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {typeMeals.map((meal, idx) => (
                      <div 
                        key={meal.id} 
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors animate-fadeInUp"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        {editingMeal?.id === meal.id ? (
                          // Edit Mode
                          <div className="flex-1 space-y-3">
                            <input
                              type="text"
                              value={editingMeal.name}
                              onChange={(e) => setEditingMeal({...editingMeal, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                              placeholder="Meal name"
                            />
                            <div className="grid grid-cols-4 gap-2">
                              <input
                                type="number"
                                value={editingMeal.calories}
                                onChange={(e) => setEditingMeal({...editingMeal, calories: e.target.value})}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-xs text-center"
                                placeholder="Calories"
                              />
                              <input
                                type="number"
                                value={editingMeal.protein}
                                onChange={(e) => setEditingMeal({...editingMeal, protein: e.target.value})}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-xs text-center"
                                placeholder="Protein"
                              />
                              <input
                                type="number"
                                value={editingMeal.carbs}
                                onChange={(e) => setEditingMeal({...editingMeal, carbs: e.target.value})}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-xs text-center"
                                placeholder="Carbs"
                              />
                              <input
                                type="number"
                                value={editingMeal.fats}
                                onChange={(e) => setEditingMeal({...editingMeal, fats: e.target.value})}
                                className="px-2 py-1 border border-gray-300 rounded-lg text-xs text-center"
                                placeholder="Fats"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditMeal}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600"
                              >
                                <FaSave /> Save
                              </button>
                              <button
                                onClick={cancelEditMeal}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
                              >
                                <FaTimes /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View Mode
                          <>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
                                  <FaClock className="inline mr-1 text-gray-400" />{meal.time}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-3 text-xs">
                                <span className="flex items-center gap-1 text-orange-600">
                                  <FaFire /> <strong>{meal.calories}</strong> kcal
                                </span>
                                <span className="flex items-center gap-1 text-red-600">
                                  <FaDrumstickBite /> <strong>{meal.protein}g</strong>
                                </span>
                                <span className="flex items-center gap-1 text-yellow-600">
                                  <FaBreadSlice /> <strong>{meal.carbs}g</strong>
                                </span>
                                <span className="flex items-center gap-1 text-blue-600">
                                  <FaTint /> <strong>{meal.fats}g</strong>
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <button
                                onClick={() => startEditMeal(meal)}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                title="Edit meal"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteMeal(meal.id)}
                                disabled={deletingMealId === meal.id}
                                className={`p-2 rounded-lg transition-all ${
                                  deletingMealId === meal.id 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                                title="Delete meal"
                              >
                                {deletingMealId === meal.id ? <FaSync className="animate-spin" /> : <FaTrash />}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {meals.length === 0 && !loading && (
              <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaUtensils className="text-3xl text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-700">No meals logged today</p>
                <p className="text-sm text-gray-500 mt-1 mb-4">Start tracking your nutrition by adding meals</p>
                {plannedMeals.length > 0 ? (
                  <p className="text-sm text-green-600 font-medium">
                    👆 Use the Quick Log section above to log from your meal plan!
                  </p>
                ) : (
                  <button
                    onClick={() => navigate('/meal-planner')}
                    className="text-sm text-green-600 font-medium hover:text-green-700"
                  >
                    Create a meal plan first →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Summary */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-5 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartPie className="text-green-600" />
                Today's Summary
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Calories', value: totals.calories, goal: goals.calories, unit: 'kcal', color: 'orange' },
                  { label: 'Protein', value: totals.protein, goal: goals.protein, unit: 'g', color: 'red' },
                  { label: 'Carbs', value: totals.carbs, goal: goals.carbs, unit: 'g', color: 'yellow' },
                  { label: 'Fats', value: totals.fats, goal: goals.fats, unit: 'g', color: 'blue' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.value} / {item.goal} {item.unit}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          item.value > item.goal ? 'bg-red-500' : `bg-${item.color}-500`
                        }`} 
                        style={{ width: `${Math.min((item.value / item.goal) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {summary && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Meals logged</span>
                  <span className="font-bold text-gray-900">{summary.count || meals.length}</span>
                </div>
              )}

              {/* Motivation Banner */}
              <div className={`mt-4 p-4 rounded-xl border ${
                getPercentage(totals.calories, goals.calories) >= 80 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <p className={`text-sm font-medium ${
                  getPercentage(totals.calories, goals.calories) >= 80 
                    ? 'text-green-800' 
                    : 'text-amber-800'
                }`}>
                  {getPercentage(totals.calories, goals.calories) >= 100 
                    ? '🎉 You\'ve reached your calorie goal!' 
                    : getPercentage(totals.calories, goals.calories) >= 80 
                      ? '💪 Almost there! Great progress today!' 
                      : '🍽️ Keep logging to reach your daily goals'}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <FaUtensils /> Meal Planner
              </h3>
              <p className="text-sm text-green-100 mb-4">
                Generate a personalized weekly meal plan based on your preferences and goals.
              </p>
              <button
                onClick={() => navigate('/meal-planner')}
                className="w-full px-4 py-2.5 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
              >
                View Meal Plan <FaArrowRight />
              </button>
            </div>

            {/* Preferences Link */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FaLeaf className="text-green-500" /> Your Goals
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {preferences 
                  ? `${preferences.goal || 'maintain'} weight · ${preferences.macroPreference || 'balanced'} macros`
                  : 'Set your nutrition preferences'}
              </p>
              <button
                onClick={() => navigate('/meal-preferences')}
                className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-1"
              >
                Update Preferences <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
