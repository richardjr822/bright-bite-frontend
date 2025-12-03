import React, { useEffect, useState, Fragment, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tab } from "@headlessui/react";
import Modal from "react-modal";
import { 
  FaFire, FaClock, FaDrumstickBite, FaBreadSlice, FaTint, FaTimes, FaEdit,
  FaHeart, FaRegHeart, FaSync, FaCheckCircle, FaChartPie, FaCalendarAlt,
  FaPrint, FaDownload, FaUtensils, FaBolt, FaLeaf, FaArrowRight, FaPlus
} from "react-icons/fa";
import { API_BASE } from "../../api";

Modal.setAppElement("#root");

const PLAN_CACHE_KEY = "mealPlanCache";
const CACHE_MAX_MS = 12 * 60 * 60 * 1000; // 12h

// Auth header builder
const authHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const h = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  if (user?.id) h["x-user-id"] = user.id;
  return h;
};

const hashPrefs = (p) => {
  if (!p) return "";
  const keys = [
    "goal","macroPreference","calorieTarget","mealsPerDay","dailyBudget",
    "dietaryPreference","avoidFoods","allergies","healthConditions",
    "specialGoals","cookingMethod","mealComplexity","mealPrepStyle",
    "cookingTime","appetite"
  ];
  const obj = {};
  keys.forEach(k => obj[k] = p[k]);
  return btoa(JSON.stringify(obj));
};

const isCacheValid = (cached, prefs) => {
  try {
    if (!cached || !cached.plan || !cached.prefsHash || !cached.ts) return false;
    if (Date.now() - cached.ts > CACHE_MAX_MS) return false;
    return cached.prefsHash === hashPrefs(prefs);
  } catch { return false; }
};

const normalizePlan = (plan) => {
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const out = Object.fromEntries(days.map(d => [d, []]));
  Object.entries(plan || {}).forEach(([day, meals]) => {
    const key = day.toLowerCase();
    if (!out[key]) out[key] = [];
    out[key] = (meals || []).map(m => {
      const rawType = m.type || m.meal_type;
      const typeNorm = (() => {
        const t = (rawType || "").toString().toLowerCase();
        if (t === "breakfast") return "Breakfast";
        if (t === "lunch") return "Lunch";
        if (t === "dinner") return "Dinner";
        if (t === "snack") return "Snack";
        return rawType || "Snack";
      })();
      const macros = m.macros || {
        protein: m.protein || 0,
        carbs: m.carbs || 0,
        fats: m.fats || 0
      };
      return {
        id: m.id || crypto.randomUUID(),
        name: m.name,
        type: typeNorm,
        calories: m.calories,
        prepTime: m.prep_time ?? m.prepTime ?? 20,
        description: m.description || "",
        macros
      };
    });
  });
  return out;
};

const buildMealDescription = (meal, prefs) => {
  const { goal, macroPreference, appetite, calorieTarget, mealsPerDay, dailyBudget } = prefs;
  const prot = meal.macros.protein;
  const carbs = meal.macros.carbs;
  const fats = meal.macros.fats;
  const kcal = meal.calories || 0;
  const targetPerMeal = Math.round((calorieTarget || 2000) / (mealsPerDay || 3));
  const density = kcal > targetPerMeal + 80 ? "higher calorie" :
                  kcal < targetPerMeal - 80 ? "lighter calorie" : "balanced calorie";
  const goalLine = goal === "gain"
    ? "supports gradual weight gain via sufficient energy and protein"
    : goal === "lose"
      ? "aids fat loss with controlled calories and satiating protein"
      : "helps maintain current weight with balanced energy";
  const macroLine = macroPreference === "high-protein"
    ? `emphasizes protein (${prot}g) for muscle repair`
    : macroPreference === "low-carb"
      ? `moderates carbs (${carbs}g) to stabilize energy`
      : `balances macros (P${prot}g C${carbs}g F${fats}g)`;
  const appetiteLine = appetite === "heavy"
    ? "portion sized slightly larger for your appetite"
    : appetite === "light"
      ? "kept lighter to match your appetite"
      : "standard portion sizing";
  const budgetLine = dailyBudget ? `aligned with your ₱${dailyBudget} budget` : "budget conscious";
  return `${meal.name}: ${density} meal that ${goalLine}; ${macroLine}; ${appetiteLine}; ${budgetLine}.`;
};

const enrichDescriptions = (plan, prefs) => {
  if (!plan) return plan;
  const out = {};
  Object.keys(plan).forEach(day => {
    out[day] = plan[day].map(m => {
      const desc = m.description && m.description.trim().length > 0
        ? m.description
        : buildMealDescription(m, prefs).slice(0, 200);
      return { ...m, description: desc };
    });
  });
  return out;
};

// Backend calls (updated to canonical endpoints)
const generatePlan = async (preferences, { force = false } = {}) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const res = await fetch(`${API_BASE}/meal-plans/generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ...preferences, userId: user?.id || null, force_regenerate: force })
  });
  if (!res.ok) throw new Error("GEN_FAIL");
  const data = await res.json();

  const DAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  const extractPlan = (root) => {
    if (!root || typeof root !== "object") return {};
    if (root.plan && typeof root.plan === "object") return root.plan;
    // If Gemini alias shape: { success, data: { monday: [...] } }
    if (root.data && typeof root.data === "object") {
      const inner = root.data;
      if (inner.plan && typeof inner.plan === "object") return inner.plan;
      if (inner.meals_by_day && typeof inner.meals_by_day === "object") return inner.meals_by_day;
      if (DAY_KEYS.some(k => Array.isArray(inner[k]))) return inner;
    }
    // Direct days at top-level (legacy)
    if (DAY_KEYS.some(k => Array.isArray(root[k]))) return root;
    return {};
  };

  const rawPlan = extractPlan(data);
  return normalizePlan(rawPlan);
};

const fetchSavedPlan = async (userId) => {
  const res = await fetch(`${API_BASE}/meal-plans/plan`, {
    headers: { ...authHeaders(), "x-user-id": userId }
  });
  if (!res.ok) return null;
  const data = await res.json();
  const rawPlan = data.plan || data?.data?.plan || {};
  const normalized = normalizePlan(rawPlan);
  if (Object.values(normalized).every(arr => arr.length === 0)) return null;
  return normalized;
};

const fetchBackendPreferences = async (userId) => {
  // Updated endpoint path
  const r = await fetch(`${API_BASE}/meal-preferences/${userId}`, {
    headers: authHeaders()
  });
  if (!r.ok) return null;
  const json = await r.json();
  // Tolerate both shapes
  const prefsRaw = json?.preferences || json?.data?.preferences || json?.data || null;
  // Gate: if backend returned no row (empty or null), force setup first
  if (!prefsRaw || (typeof prefsRaw === "object" && Object.keys(prefsRaw).length === 0)) return null;
  return normalizeDbPrefs(prefsRaw);
};

const normalizeDbPrefs = (db = {}) => {
  // Debug: log what we receive from backend
  console.log("[normalizeDbPrefs] Raw db:", db);
  
  const normalized = {
    goal: db.goal || "maintain",
    macroPreference: db.macro_preference || db.macroPreference || "balanced",
    calorieTarget: db.calorie_target || db.calorieTarget || 2000,
    mealsPerDay: db.meals_per_day || db.mealsPerDay || 3,
    dailyBudget: db.daily_budget || db.dailyBudget || "",
    dietaryPreference: db.dietary_preference || db.dietaryPreference || [],
    avoidFoods: db.avoid_foods || db.avoidFoods || "",
    allergies: db.allergies || [],
    healthConditions: db.health_conditions || db.healthConditions || [],
    specialGoals: db.special_goals || db.specialGoals || [],
    cookingMethod: db.cooking_methods || db.cookingMethod || [],
    mealComplexity: db.meal_complexity || db.mealComplexity || "simple",
    mealPrepStyle: db.meal_prep_style || db.mealPrepStyle || "daily",
    cookingTime: db.cooking_time || db.cookingTime || "",
    appetite: db.appetite || "average"
  };
  
  console.log("[normalizeDbPrefs] Normalized:", normalized);
  return normalized;
};

// ============== SUB-COMPONENTS ==============

// Enhanced Calorie Progress Ring
const CalorieRing = ({ current, target, size = 120 }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage > 100 ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#22c55e';
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
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
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
        <span className="text-xs text-gray-500">of goal</span>
      </div>
    </div>
  );
};

// Daily Stats Card - Synced with Nutrition Tracker
const DailyStatsCard = ({ dayMeals, preferences }) => {
  const [loggedStats, setLoggedStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch actual logged meals from nutrition tracker
  useEffect(() => {
    const fetchLoggedMeals = async () => {
      try {
        const res = await fetch(`${API_BASE}/meal-plans/meals/summary`, {
          headers: authHeaders()
        });
        if (res.ok) {
          const data = await res.json();
          const totals = data.summary?.totals || {};
          setLoggedStats({
            calories: Math.round(totals.calories || 0),
            protein: Math.round(totals.protein || 0),
            carbs: Math.round(totals.carbs || 0),
            fats: Math.round(totals.fats || 0),
            count: data.summary?.count || 0
          });
        }
      } catch (e) {
        console.error("Failed to fetch logged stats:", e);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchLoggedMeals();
  }, []);

  // Planned meals stats (for reference)
  const plannedStats = useMemo(() => {
    const totals = dayMeals.reduce((acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.macros?.protein || 0),
      carbs: acc.carbs + (m.macros?.carbs || 0),
      fats: acc.fats + (m.macros?.fats || 0),
      prepTime: acc.prepTime + (m.prepTime || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, prepTime: 0 });
    return totals;
  }, [dayMeals]);

  const stats = loggedStats || { calories: 0, protein: 0, carbs: 0, fats: 0, count: 0 };
  const calorieTarget = preferences?.calorieTarget || 2000;
  const remaining = calorieTarget - stats.calories;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <CalorieRing current={stats.calories} target={calorieTarget} />
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Progress</h3>
              <p className="text-xs text-gray-500">
                {loadingStats ? 'Loading...' : `${stats.count} meal${stats.count !== 1 ? 's' : ''} logged`}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              remaining > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {remaining > 0 ? `${remaining} kcal remaining` : `${Math.abs(remaining)} kcal over`}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
              <FaFire className="mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-orange-600 font-medium">Logged</p>
              <p className="text-lg font-bold text-orange-700">{stats.calories}</p>
              <p className="text-[10px] text-orange-500">/ {plannedStats.calories} planned</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <FaDrumstickBite className="mx-auto text-red-500 mb-1" />
              <p className="text-xs text-red-600 font-medium">Protein</p>
              <p className="text-lg font-bold text-red-700">{stats.protein}g</p>
              <p className="text-[10px] text-red-500">/ {plannedStats.protein}g planned</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
              <FaBreadSlice className="mx-auto text-yellow-500 mb-1" />
              <p className="text-xs text-yellow-600 font-medium">Carbs</p>
              <p className="text-lg font-bold text-yellow-700">{stats.carbs}g</p>
              <p className="text-[10px] text-yellow-500">/ {plannedStats.carbs}g planned</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <FaTint className="mx-auto text-blue-500 mb-1" />
              <p className="text-xs text-blue-600 font-medium">Fats</p>
              <p className="text-lg font-bold text-blue-700">{stats.fats}g</p>
              <p className="text-[10px] text-blue-500">/ {plannedStats.fats}g planned</p>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FaClock className="text-gray-400" />
              <span>Prep time: <strong>{plannedStats.prepTime} min</strong></span>
            </div>
            <a href="/nutrition" className="text-green-600 hover:text-green-700 text-xs font-medium flex items-center gap-1">
              View Tracker <FaArrowRight className="text-[10px]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Planner Header Component
const PlannerHeader = ({ preferences, onEditPreferences, onRegenerate, regenerating }) => {
  const goalIcons = { gain: '💪', lose: '🔥', maintain: '⚖️' };
  const goalColors = { gain: 'from-blue-500 to-indigo-600', lose: 'from-orange-500 to-red-500', maintain: 'from-green-500 to-emerald-600' };
  
  return (
    <header className="bg-gradient-to-br from-white via-white to-green-50/50 border-2 border-gray-200 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goalColors[preferences.goal] || goalColors.maintain} flex items-center justify-center text-2xl shadow-lg`}>
              {goalIcons[preferences.goal] || '🍽️'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Your Meal Plan
              </h1>
              <p className="text-sm text-gray-500">Personalized for your {preferences.goal} goal</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {[
              { label: 'Goal', value: preferences.goal, color: 'green', icon: FaLeaf },
              { label: 'Meals', value: `${preferences.mealsPerDay}/day`, color: 'blue', icon: FaUtensils },
              { label: 'Target', value: `${preferences.calorieTarget} kcal`, color: 'orange', icon: FaFire },
              { label: 'Macro', value: preferences.macroPreference, color: 'purple', icon: FaChartPie },
              { label: 'Budget', value: preferences.dailyBudget ? `₱${preferences.dailyBudget}` : '—', color: 'pink', icon: FaBolt }
            ].map((item, i) => (
              <div 
                key={i}
                className={`group flex items-center gap-2 bg-${item.color}-50 border border-${item.color}-200 px-3 py-2 rounded-xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
              >
                <item.icon className={`text-${item.color}-500 text-sm`} />
                <span className="text-xs text-gray-500 hidden sm:inline">{item.label}:</span>
                <span className={`text-sm font-bold text-${item.color}-700 capitalize`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
              regenerating
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600 hover:-translate-y-0.5'
            }`}
          >
            <FaSync className={regenerating ? 'animate-spin' : ''} />
            {regenerating ? 'Generating...' : 'New Plan'}
          </button>
          <button
            onClick={onEditPreferences}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <FaEdit /> Preferences
          </button>
        </div>
      </div>
    </header>
  );
};

// Enhanced Meal Card Component (Image Removed)
const MealCard = ({ meal, onClick }) => {
  const colors = {
    Breakfast: "from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300",
    Lunch: "from-blue-100 to-blue-200 text-blue-800 border-blue-300",
    Dinner: "from-purple-100 to-purple-200 text-purple-800 border-purple-300",
    Snack: "from-green-100 to-green-200 text-green-800 border-green-300",
  };
  const emojis = { Breakfast: "🌅", Lunch: "🍱", Dinner: "🍽️", Snack: "🍎" };
  const typeColor = colors[meal.type] || "from-gray-100 to-gray-200 text-gray-800 border-gray-300";
  const emoji = emojis[meal.type] || "🍴";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="bg-white border-2 border-gray-200 rounded-xl hover:shadow-xl hover:border-green-400 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      <div className={`relative h-36 sm:h-44 md:h-48 overflow-hidden bg-gradient-to-br ${typeColor} flex flex-col items-center justify-center p-4`}>
        <div className="text-4xl sm:text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">
          {emoji}
        </div>
        <p className="text-[10px] sm:text-xs uppercase tracking-wide font-semibold opacity-70 mb-1">{meal.type}</p>
        <h3 className="font-bold text-base sm:text-lg md:text-xl text-center line-clamp-2 px-2">
          {meal.name}
        </h3>
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/95 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 shadow-md">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <FaClock className="text-gray-500 text-xs" />
            <span className="text-xs font-semibold text-gray-700">{meal.prepTime} min</span>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
            <FaFire className="text-orange-500 text-sm" />
            <span className="font-bold text-orange-700 text-sm sm:text-base">{meal.calories}</span>
            <span className="text-xs text-orange-600">kcal</span>
          </div>
          <button className="text-xs font-semibold text-green-600 group-hover:text-green-700 flex items-center gap-1">
            <span className="hidden sm:inline">Details</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Meal Details Modal Component (Image Removed)
const MealDetailsModal = ({ isOpen, onClose, meal }) => {
  if (!meal) return null;
  const colors = { Breakfast: "bg-yellow-500", Lunch: "bg-blue-500", Dinner: "bg-purple-500", Snack: "bg-green-500" };
  const emojis = { Breakfast: "🌅", Lunch: "🍱", Dinner: "🍽️", Snack: "🍎" };
  const color = colors[meal.type] || "bg-gray-500";
  const emoji = emojis[meal.type] || "🍴";

  const [logging, setLogging] = React.useState(false);
  const [logged, setLogged] = React.useState(false);

  // Optional: log to intake meals table
  const addToIntake = async () => {
    try {
      setLogging(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) return;
      const payload = {
        user_id: user.id,
        name: meal.name,
        meal_type: meal.type.toLowerCase(),
        calories: meal.calories,
        protein: meal.macros.protein,
        carbs: meal.macros.carbs,
        fats: meal.macros.fats,
        meal_time: new Date().toISOString()
      };
      const res = await fetch(`${API_BASE}/meal-plans/meals`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setLogged(true);
        setTimeout(() => {
          onClose();
          setLogged(false);
        }, 1000);
      }
    } catch (e) {
      console.error("Failed to log meal:", e);
    } finally {
      setLogging(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={`Meal details for ${meal.name}`}
      className="w-[95%] sm:max-w-3xl mx-auto mt-6 sm:mt-12 bg-white rounded-2xl shadow-2xl outline-none"
      overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 z-50 overflow-y-auto"
    >
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm hover:bg-gray-100 rounded-full flex items-center justify-center shadow-lg"
        >
          <FaTimes className="text-gray-700 text-sm sm:text-base" />
        </button>
        <div className={`min-h-[6rem] sm:min-h-[8rem] rounded-t-2xl flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-4 ${color} text-white`}>
          <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-0">
            <span className="text-3xl sm:text-4xl">{emoji}</span>
            <h2 className="text-xl sm:text-2xl font-bold">{meal.name}</h2>
          </div>
          <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-white/20 rounded-full">
            {meal.type}
          </span>
        </div>
        <div className="p-4 sm:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <FaClock className="text-gray-600 text-sm sm:text-base" />
            <span className="font-semibold text-gray-700 text-sm sm:text-base">{meal.prepTime} min prep</span>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">{meal.description}</p>
          <div className="border-t-2 border-gray-100 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Nutrition</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <InfoBox icon={<FaFire />} label="Calories" val={meal.calories} unit="kcal" color="orange" />
              <InfoBox icon={<FaDrumstickBite />} label="Protein" val={meal.macros.protein} unit="g" color="red" />
              <InfoBox icon={<FaBreadSlice />} label="Carbs" val={meal.macros.carbs} unit="g" color="yellow" />
              <InfoBox icon={<FaTint />} label="Fats" val={meal.macros.fats} unit="g" color="blue" />
            </div>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={addToIntake}
              disabled={logging || logged}
              className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm font-semibold shadow flex items-center justify-center gap-2 transition-all ${
                logged 
                  ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
              }`}
            >
              {logged ? (
                <><FaCheckCircle /> Logged to Tracker!</>
              ) : logging ? (
                <><FaSync className="animate-spin" /> Logging...</>
              ) : (
                <><FaPlus /> Log This Meal</>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const InfoBox = ({ icon, label, val, unit, color }) => (
  <div className={`bg-${color}-50 border-2 border-${color}-200 rounded-xl p-3 sm:p-4 text-center`}>
    <div className={`text-2xl sm:text-3xl text-${color}-500 mx-auto mb-1 sm:mb-2`}>{icon}</div>
    <p className={`text-xs text-${color}-700 font-semibold mb-1`}>{label}</p>
    <p className={`text-xl sm:text-2xl font-bold text-${color}-900`}>{val}</p>
    <p className={`text-xs text-${color}-600`}>{unit}</p>
  </div>
);

// Loading Skeleton Component
const PlannerSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="h-6 sm:h-8 bg-gray-200 rounded w-2/3 sm:w-1/3 mb-4"></div>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 sm:h-10 bg-gray-200 rounded-lg w-24 sm:w-32"></div>
        ))}
      </div>
    </div>
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 sm:p-6 animate-pulse">
      <div className="flex gap-1 sm:gap-2 mb-6 overflow-x-auto">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-8 sm:h-10 bg-gray-200 rounded-lg flex-1 min-w-[80px]"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="h-36 sm:h-48 bg-gray-200"></div>
            <div className="p-3 sm:p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============== MAIN COMPONENT ==============

const MealPlannerPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(state?.preferences || null);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [planReused, setPlanReused] = useState(false);
  const initRef = useRef(false);
  const prefsRef = useRef(preferences);

  const handleOpenModal = (meal) => { setSelectedMeal(meal); setIsModalOpen(true); };
  const handleCloseModal = () => { setSelectedMeal(null); setIsModalOpen(false); };

  const loadInitial = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user?.id) {
        navigate("/meal-preferences", { replace: true });
        return;
      }

      const backendPrefs = await fetchBackendPreferences(user.id);
      if (!backendPrefs) {
        navigate("/meal-preferences", { replace: true });
        return;
      }
      if (JSON.stringify(prefsRef.current) !== JSON.stringify(backendPrefs)) {
        setPreferences(backendPrefs);
        prefsRef.current = backendPrefs;
        localStorage.setItem("mealPreferences", JSON.stringify(backendPrefs));
      }

      // Cache
      const rawCache = localStorage.getItem(PLAN_CACHE_KEY);
      if (rawCache) {
        try {
          const parsed = JSON.parse(rawCache);
          if (isCacheValid(parsed, backendPrefs)) {
            const normalized = normalizePlan(parsed.plan);
            setMealPlan(normalized);
            setPlanReused(true);
            setLoading(false);
            return;
          }
        } catch {}
      }

      // Saved
      const saved = await fetchSavedPlan(user.id);
      if (saved) {
        const enriched = enrichDescriptions(saved, backendPrefs);
        localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({
          plan: enriched,
          prefsHash: hashPrefs(backendPrefs),
          ts: Date.now()
        }));
        setMealPlan(enriched);
        setPlanReused(true);
        setLoading(false);
        return;
      }

      // Generate
      const gen = await generatePlan(backendPrefs, { force: true });
      const enriched = enrichDescriptions(gen, backendPrefs);
      localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({
        plan: enriched,
        prefsHash: hashPrefs(backendPrefs),
        ts: Date.now()
      }));
      setMealPlan(enriched);
      setPlanReused(false);
    } catch {
      setError("Could not load meal plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    loadInitial();
  }, [navigate]);

  const regenerate = async () => {
    if (!prefsRef.current) return;
    setRegenerating(true);
    try {
      const gen = await generatePlan(prefsRef.current, { force: true });
      const enriched = enrichDescriptions(gen, prefsRef.current);
      localStorage.setItem(PLAN_CACHE_KEY, JSON.stringify({
        plan: enriched,
        prefsHash: hashPrefs(prefsRef.current),
        ts: Date.now()
      }));
      setMealPlan(enriched);
      setError(null);
      setPlanReused(false);
    } catch {
      setError("AI regeneration failed.");
    } finally {
      setRegenerating(false);
    }
  };

  if (!preferences && !loading) {
    return (
      <div className="p-6">
        <div className="bg-white border-2 border-yellow-200 rounded-xl p-6 text-center">
          <p className="font-semibold mb-2">Preferences Required</p>
          <button
            onClick={() => navigate("/meal-preferences")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Set Preferences
          </button>
        </div>
      </div>
    );
  }

  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
  const labels = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  const weeklyMacros = mealPlan
    ? Object.values(mealPlan).flat().reduce(
        (acc, m) => {
          acc.calories += m.calories || 0;
          acc.protein += m.macros.protein || 0;
          acc.carbs += m.macros.carbs || 0;
          acc.fats += m.macros.fats || 0;
          return acc;
        },
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      )
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {loading && (
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold">
              <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
              {planReused ? "Loading plan…" : "Preparing meal plan…"}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white border-2 border-red-200 rounded-xl p-6 text-center">
            <p className="font-semibold mb-2">Error loading plan</p>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={loadInitial}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && mealPlan && preferences && (
          <>
            <PlannerHeader
              preferences={preferences}
              onEditPreferences={() => {
                localStorage.removeItem(PLAN_CACHE_KEY);
                navigate("/meal-preferences");
              }}
              onRegenerate={regenerate}
              regenerating={regenerating}
            />

            <Tab.Group>
              {({ selectedIndex }) => (
              <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                <Tab.List className="flex border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white overflow-x-auto">
                  {labels.map((d, i) => (
                    <Tab key={d} as={Fragment}>
                      {({ selected }) => (
                        <button
                          className={`relative flex-1 min-w-[80px] px-2 py-4 text-xs font-bold transition-all duration-300 ${
                            selected
                              ? "text-green-700 bg-white"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              selected 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {d.slice(0,1)}
                            </span>
                            <span className="hidden sm:block">{d}</span>
                            <span className="sm:hidden text-[10px]">{d.slice(0,3)}</span>
                          </div>
                          {selected && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
                          )}
                        </button>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
                <Tab.Panels className="p-3 sm:p-6">
                  {days.map((day, idx) => (
                    <Tab.Panel key={day}>
                      {/* Daily Stats Card */}
                      <DailyStatsCard dayMeals={mealPlan[day] || []} preferences={preferences} />
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaCalendarAlt className="text-green-500" />
                            {labels[idx]}'s Meals
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            {(mealPlan[day]?.length || 0)} meals planned · Click any meal for details
                          </p>
                        </div>
                      </div>
                      
                      {mealPlan[day]?.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                          <FaUtensils className="mx-auto text-4xl text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium">No meals planned for {labels[idx]}</p>
                          <button 
                            onClick={regenerate}
                            className="mt-3 text-sm text-green-600 font-semibold hover:text-green-700"
                          >
                            Generate new plan →
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {mealPlan[day]?.map((meal, mealIdx) => (
                            <div 
                              key={meal.id} 
                              className="animate-fadeIn"
                              style={{ animationDelay: `${mealIdx * 0.05}s` }}
                            >
                              <MealCard meal={meal} onClick={() => handleOpenModal(meal)} />
                            </div>
                          ))}
                        </div>
                      )}
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </div>
              )}
            </Tab.Group>

            <div className="mt-6 bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Weekly Summary</h2>
                <button
                  onClick={regenerate}
                  disabled={regenerating}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold ${
                    regenerating
                      ? "bg-gray-200 text-gray-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow"
                  }`}
                >
                  {regenerating ? "Regenerating…" : "Regenerate Plan"}
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <SummaryBox label="Total Meals" value={Object.values(mealPlan).reduce((s,a)=>s+(a?.length||0),0)} color="blue" />
                <SummaryBox label="Avg Cal/Day" value={Math.round(weeklyMacros.calories/7)} color="green" />
                <SummaryBox label="Protein (g)" value={weeklyMacros.protein} color="orange" />
                <SummaryBox label="Carbs (g)" value={weeklyMacros.carbs} color="yellow" />
                <SummaryBox label="Fats (g)" value={weeklyMacros.fats} color="purple" />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {planReused
                  ? "Loaded existing saved plan."
                  : "Freshly generated with current preferences."} Goal: {preferences.goal}; Macro: {preferences.macroPreference}; Appetite: {preferences.appetite}.
              </p>
            </div>
          </>
        )}

        <MealDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          meal={selectedMeal}
        />
      </div>
    </div>
  );
};

const SummaryBox = ({ label, value, color }) => (
  <div className={`bg-${color}-50 border-2 border-${color}-200 rounded-xl p-3 text-center`}>
    <p className={`text-xs text-${color}-700 font-bold mb-1`}>{label}</p>
    <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
  </div>
);

export default MealPlannerPage;