import React, { useState, useEffect, useMemo } from 'react';
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
  FaChartLine
} from 'react-icons/fa';

export default function NutritionTracker() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    mealType: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });

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
      const res = await fetch(`${API_BASE}/meals/${userId}?today=true`, { headers });
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
      const res = await fetch(`${API_BASE}/meals/${userId}/summary`, { headers });
      if (!res.ok) throw new Error(`Summary fetch failed ${res.status}`);
      const data = await res.json();
      setSummary(data.data || data.summary || null);
    } catch (e) {
      // non-critical
    }
  };

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
      await fetchPreferences();
      await fetchMeals();
      await fetchSummary();
      setLoading(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      const res = await fetch(`${API_BASE}/meals`, {
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

  const deleteMeal = (id) => {
    // No backend delete endpoint yet; local removal only
    setMeals(meals.filter(meal => meal.id !== id));
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaHeartbeat className="text-red-600" />
            Nutrition Tracker
          </h1>
          <p className="text-gray-600 mt-2">Track your daily nutrition intake</p>
        </div>

        {/* Preferences banner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
          <div>
            {loading && (
              <p className="text-sm text-gray-600">Loading data...</p>
            )}
            {!loading && error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            {!loading && !error && preferences ? (
              <>
                <p className="text-sm text-gray-700">
                  Personalized goals applied from your Meal Preferences.
                </p>
                <p className="text-xs text-gray-500">
                  Goal: {preferences.goal || 'maintain'} · Macro: {preferences.macroPreference || 'balanced'} · Target: {goals.calories} kcal
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-700">
                No preferences found. Using default goals.
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchPreferences();
                fetchMeals();
                fetchSummary();
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh
            </button>
            <button
              onClick={() => navigate('/meal-preferences')}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Update Preferences
            </button>
          </div>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Calories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaFire className="text-orange-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Calories</p>
                <p className="text-xl font-bold text-gray-900">{totals.calories}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${getPercentage(totals.calories, goals.calories)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Goal: {goals.calories} kcal</p>
          </div>

          {/* Protein */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <FaDrumstickBite className="text-red-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-xl font-bold text-gray-900">{totals.protein}g</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${getPercentage(totals.protein, goals.protein)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Goal: {goals.protein}g</p>
          </div>

          {/* Carbs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FaBreadSlice className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Carbs</p>
                <p className="text-xl font-bold text-gray-900">{totals.carbs}g</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${getPercentage(totals.carbs, goals.carbs)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Goal: {goals.carbs}g</p>
          </div>

          {/* Fats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaTint className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fats</p>
                <p className="text-xl font-bold text-gray-900">{totals.fats}g</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${getPercentage(totals.fats, goals.fats)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Goal: {goals.fats}g</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meals List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Meal Button */}
            <button
              onClick={() => setShowAddMeal(!showAddMeal)}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FaPlus />
              Add Meal
            </button>

            {/* Add Meal Form */}
            {showAddMeal && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Meal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name</label>
                    <input
                      type="text"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Chicken Salad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
                    <select
                      value={newMeal.mealType}
                      onChange={(e) => setNewMeal({ ...newMeal, mealType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                      <input
                        type="number"
                        value={newMeal.calories}
                        onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="kcal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Protein (g)</label>
                      <input
                        type="number"
                        value={newMeal.protein}
                        onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="grams"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (g)</label>
                      <input
                        type="number"
                        value={newMeal.carbs}
                        onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="grams"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fats (g)</label>
                      <input
                        type="number"
                        value={newMeal.fats}
                        onChange={(e) => setNewMeal({ ...newMeal, fats: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="grams"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={addMeal}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Add Meal
                    </button>
                    <button
                      onClick={() => setShowAddMeal(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Meals by Type */}
            {Object.entries(mealsByType).map(([type, typeMeals]) => (
              typeMeals.length > 0 && (
                <div key={type} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">{type}</h3>
                  <div className="space-y-3">
                    {typeMeals.map(meal => (
                      <div key={meal.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{meal.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMealTypeColor(meal.mealType)}`}>
                              {meal.time}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">{meal.calories}</span> kcal
                            </div>
                            <div>
                              <span className="font-medium">{meal.protein}g</span> protein
                            </div>
                            <div>
                              <span className="font-medium">{meal.carbs}g</span> carbs
                            </div>
                            <div>
                              <span className="font-medium">{meal.fats}g</span> fats
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteMeal(meal.id)}
                          className="ml-4 text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            {meals.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FaHeartbeat className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No meals logged today</p>
                <p className="text-sm text-gray-500 mt-1">Start tracking your nutrition by adding meals</p>
              </div>
            )}
          </div>

          {/* Weekly Progress */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaChartLine className="text-green-600" />
                Today Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-medium">{totals.calories} / {goals.calories} kcal</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${getPercentage(totals.calories, goals.calories)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Protein</span>
                    <span className="font-medium">{totals.protein}g / {goals.protein}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${getPercentage(totals.protein, goals.protein)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Carbs</span>
                    <span className="font-medium">{totals.carbs}g / {goals.carbs}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${getPercentage(totals.carbs, goals.carbs)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Fats</span>
                    <span className="font-medium">{totals.fats}g / {goals.fats}g</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${getPercentage(totals.fats, goals.fats)}%` }}></div>
                  </div>
                </div>
              </div>
              {summary && (
                <div className="mt-4 text-xs text-gray-500">Logged meals: {summary.count}</div>
              )}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  {getPercentage(totals.calories, goals.calories) > 90 ? 'Close to calorie goal – great consistency!' : 'Keep logging meals to reach today\'s targets.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
