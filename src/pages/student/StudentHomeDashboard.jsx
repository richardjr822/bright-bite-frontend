import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUtensils,
  FaFire,
  FaLeaf,
  FaHeart,
  FaStar,
  FaStore,
  FaChartLine,
  FaArrowRight,
  FaSpinner,
  FaBullseye,
  FaAppleAlt,
  FaDumbbell,
  FaTrophy,
  FaLightbulb,
  FaThumbsUp,
  FaHistory
} from 'react-icons/fa';
import { API_BASE } from '../../api';

// Health Goals Progress Component
const HealthGoalsProgress = ({ nutritionData, goals }) => {
  const calculateProgress = (current, target) => {
    if (!target) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  };

  const goalItems = [
    {
      label: 'Calories',
      current: nutritionData?.calories || 0,
      target: goals?.calories || 2000,
      color: 'from-orange-500 to-amber-500',
      icon: FaFire,
      unit: 'kcal'
    },
    {
      label: 'Protein',
      current: nutritionData?.protein || 0,
      target: goals?.protein || 50,
      color: 'from-red-500 to-rose-500',
      icon: FaDumbbell,
      unit: 'g'
    },
    {
      label: 'Carbs',
      current: nutritionData?.carbs || 0,
      target: goals?.carbs || 250,
      color: 'from-blue-500 to-cyan-500',
      icon: FaAppleAlt,
      unit: 'g'
    },
    {
      label: 'Fiber',
      current: nutritionData?.fiber || 0,
      target: goals?.fiber || 25,
      color: 'from-green-500 to-emerald-500',
      icon: FaLeaf,
      unit: 'g'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-lg flex items-center justify-center">
            <FaBullseye className="text-white text-sm" />
          </div>
          Today's Progress
        </h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      <div className="space-y-4">
        {goalItems.map((item, idx) => {
          const progress = calculateProgress(item.current, item.target);
          const Icon = item.icon;
          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon className="text-slate-400 text-xs" />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {item.current} / {item.target} {item.unit}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Overall Goal Progress</span>
          <span className="text-lg font-bold text-[#0d3d23]">
            {Math.round(goalItems.reduce((sum, g) => sum + calculateProgress(g.current, g.target), 0) / goalItems.length)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// 3-Way Meal Comparison Component
const MealComparison = ({ aiRecommended, vendorAvailable, vendorPromoted, onSelectMeal }) => {
  const MealCard = ({ meal, type, badge, badgeColor, icon: Icon }) => (
    <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-all cursor-pointer group"
         onClick={() => onSelectMeal(meal)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 ${badgeColor} rounded-lg flex items-center justify-center`}>
            <Icon className="text-white text-sm" />
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColor.replace('bg-', 'bg-opacity-20 text-').replace('-600', '-700')}`}>
            {badge}
          </span>
        </div>
        {meal.rating && (
          <div className="flex items-center gap-1 text-amber-500">
            <FaStar className="text-xs" />
            <span className="text-xs font-medium">{meal.rating}</span>
          </div>
        )}
      </div>
      
      <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-[#0d3d23] transition-colors">
        {meal.name}
      </h4>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{meal.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <FaFire className="text-orange-400" />
            {meal.calories || 0} kcal
          </span>
          {meal.vendor && (
            <span className="flex items-center gap-1">
              <FaStore className="text-slate-400" />
              {meal.vendor}
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-[#0d3d23]">₱{meal.price?.toFixed(2)}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-lg flex items-center justify-center">
            <FaUtensils className="text-white text-sm" />
          </div>
          Meal Recommendations
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Recommended */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <FaLightbulb className="text-purple-500" />
            For Your Goals
          </p>
          {aiRecommended ? (
            <MealCard 
              meal={aiRecommended} 
              type="ai" 
              badge="AI Pick" 
              badgeColor="bg-purple-600"
              icon={FaLightbulb}
            />
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-400 text-sm">
              <FaLightbulb className="text-2xl mx-auto mb-2 opacity-30" />
              Set health goals to get personalized recommendations
            </div>
          )}
        </div>
        
        {/* Vendor Available */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <FaStore className="text-blue-500" />
            Available Now
          </p>
          {vendorAvailable ? (
            <MealCard 
              meal={vendorAvailable} 
              type="available" 
              badge="In Stock" 
              badgeColor="bg-blue-600"
              icon={FaStore}
            />
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-400 text-sm">
              <FaStore className="text-2xl mx-auto mb-2 opacity-30" />
              No meals available right now
            </div>
          )}
        </div>
        
        {/* Vendor Promoted */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <FaThumbsUp className="text-amber-500" />
            Popular Choice
          </p>
          {vendorPromoted ? (
            <MealCard 
              meal={vendorPromoted} 
              type="promoted" 
              badge="Hot" 
              badgeColor="bg-amber-600"
              icon={FaTrophy}
            />
          ) : (
            <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-400 text-sm">
              <FaTrophy className="text-2xl mx-auto mb-2 opacity-30" />
              No promoted meals today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick Stats Component
const QuickStats = ({ stats }) => {
  const statItems = [
    { label: 'Orders This Week', value: stats?.weeklyOrders || 0, icon: FaUtensils, color: 'bg-blue-500' },
    { label: 'Calories Today', value: stats?.todayCalories || 0, icon: FaFire, color: 'bg-orange-500', unit: 'kcal' },
    { label: 'Reward Points', value: stats?.rewardPoints || 0, icon: FaTrophy, color: 'bg-amber-500' },
    { label: 'Streak Days', value: stats?.streakDays || 0, icon: FaHeart, color: 'bg-rose-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {stat.value.toLocaleString()}{stat.unit && <span className="text-sm font-normal text-slate-500 ml-1">{stat.unit}</span>}
            </p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

// Recent Activity Component
const RecentActivity = ({ activities }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[#0d3d23] to-[#1a5d3a] rounded-lg flex items-center justify-center">
          <FaHistory className="text-white text-sm" />
        </div>
        Recent Activity
      </h3>
      
      {activities && activities.length > 0 ? (
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'reward' ? 'bg-amber-100 text-amber-600' :
                'bg-green-100 text-green-600'
              }`}>
                {activity.type === 'order' ? <FaUtensils className="text-sm" /> :
                 activity.type === 'reward' ? <FaTrophy className="text-sm" /> :
                 <FaHeart className="text-sm" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{activity.title}</p>
                <p className="text-xs text-slate-500">{activity.description}</p>
              </div>
              <span className="text-xs text-slate-400">{formatTime(activity.time)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <FaHistory className="text-3xl mx-auto mb-2 opacity-30" />
          <p className="text-sm">No recent activity</p>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
export default function StudentHomeDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState(null);
  const [healthGoals, setHealthGoals] = useState(null);
  const [mealRecommendations, setMealRecommendations] = useState({
    aiRecommended: null,
    vendorAvailable: null,
    vendorPromoted: null
  });
  const [stats, setStats] = useState({
    weeklyOrders: 0,
    todayCalories: 0,
    rewardPoints: 0,
    streakDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(user?.id ? { 'x-user-id': user.id } : {})
      };

      // Fetch multiple data sources in parallel
      const [vendorsRes, ordersRes, walletRes, profileRes, trackerSummaryRes, prefsRes] = await Promise.all([
        fetch(`${API_BASE}/vendor/list`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/student/orders`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/wallet`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/student/profile`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/meal-plans/meals/summary`, { headers }).catch(() => ({ ok: false })),
        fetch(`${API_BASE}/meal-preferences/${user?.id || ''}`, { headers }).catch(() => ({ ok: false }))
      ]);

      // Process vendors for meal recommendations
      let aiMeal = null, availableMeal = null, promotedMeal = null;
      let vendors = [];
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        vendors = vendorsData.vendors || [];
        
        // Fetch menu items from first available vendor
        if (vendors.length > 0) {
          const menuRes = await fetch(`${API_BASE}/vendor/menu/${vendors[0].id}`, { headers }).catch(() => ({ ok: false }));
          if (menuRes.ok) {
            const menuData = await menuRes.json();
            const items = menuData.menu_items || [];
            
            // AI Recommended: lowest calorie healthy option (only when calories exist)
            const healthyItems = items.filter(i => i.is_available && typeof i.calories === 'number' && i.calories < 500);
            aiMeal = healthyItems[0] ? {
              ...healthyItems[0],
              vendor: vendors[0].name,
              description: healthyItems[0].description || ''
            } : null;
            
            // Available: first available item
            const firstAvailable = items.find(i => i.is_available);
            availableMeal = firstAvailable ? {
              ...firstAvailable,
              vendor: vendors[0].name,
              description: firstAvailable.description || ''
            } : null;
            
            // Promoted: highest rated (only when rating exists)
            const availableRated = items.filter(i => i.is_available && typeof i.rating === 'number');
            availableRated.sort((a, b) => b.rating - a.rating);
            const top = availableRated[0];
            promotedMeal = top ? {
              ...top,
              vendor: vendors[0].name
            } : null;
          }
        }
      }
      
      setMealRecommendations({
        aiRecommended: aiMeal,
        vendorAvailable: availableMeal,
        vendorPromoted: promotedMeal
      });

      // Process orders for stats and activity (truthful values only)
      let weeklyOrders = 0, todayCalories = 0, streakDays = 0;
      let rewardPoints = 0;
      const activities = [];
      let vendorsMap = {};
      try {
        (vendors || []).forEach(vd => { vendorsMap[vd.id] = vd.name; });
      } catch (_) {}
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orders = ordersData.orders || [];

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weeklyOrders = orders.filter(o => new Date(o.created_at) > weekAgo).length;

        orders.slice(0, 3).forEach(o => {
          activities.push({
            type: 'order',
            title: `Order from ${vendorsMap[o.restaurant_id] || 'Vendor'}`,
            description: `₱${Number(o.total || 0).toFixed(2)} • ${o.status}`,
            time: o.created_at
          });
        });

        // Streak days: count consecutive days with at least one order up to today
        const toDateKey = (d) => {
          const dt = new Date(d);
          const y = dt.getFullYear();
          const m = String(dt.getMonth() + 1).padStart(2, '0');
          const da = String(dt.getDate()).padStart(2, '0');
          return `${y}-${m}-${da}`;
        };
        const datesSet = new Set(orders.map(o => toDateKey(o.created_at)));
        let cursor = new Date();
        while (true) {
          const key = toDateKey(cursor);
          if (datesSet.has(key)) {
            streakDays += 1;
            cursor.setDate(cursor.getDate() - 1);
          } else {
            break;
          }
        }

        // Today calories: sum from today's orders using menu calories when available
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaysOrders = orders.filter(o => new Date(o.created_at) >= todayStart);
        const todaysVendorIds = Array.from(new Set(todaysOrders.map(o => o.restaurant_id).filter(Boolean)));
        if (todaysVendorIds.length > 0) {
          try {
            const menus = await Promise.all(
              todaysVendorIds.map(id =>
                fetch(`${API_BASE}/vendor/menu/${id}`, { headers })
                  .then(r => r.ok ? r.json() : { menu_items: [] })
                  .catch(() => ({ menu_items: [] }))
              )
            );
            const calMap = new Map();
            menus.forEach(m => {
              (m.menu_items || []).forEach(mi => {
                const mid = mi.id || mi.item_id;
                if (mid != null) calMap.set(mid, Number(mi.calories || 0));
              });
            });
            todaysOrders.forEach(o => {
              (o.items || []).forEach(it => {
                const iid = it.item_id || it.id;
                const qty = Number(it.quantity || 1);
                const cal = calMap.get(iid) || 0;
                todayCalories += qty * cal;
              });
            });
          } catch (_) {
            todayCalories = 0;
          }
        }
      }

      // Reward points from profile (truth source)
      if (profileRes.ok) {
        try {
          const prof = await profileRes.json();
          rewardPoints = Number(prof?.profile?.points || 0);
        } catch (_) {}
      }

      // Prefer Nutrition Tracker summary for today's nutrition when available
      let trackerCalories = null, trackerProtein = null, trackerCarbs = null, trackerFats = null;
      try {
        if (trackerSummaryRes.ok) {
          const t = await trackerSummaryRes.json();
          const s = t.data || t.summary || {};
          const totals = s.totals || s;
          trackerCalories = Number(totals?.calories ?? NaN);
          trackerProtein = Number(totals?.protein ?? NaN);
          trackerCarbs = Number(totals?.carbs ?? NaN);
          trackerFats = Number(totals?.fats ?? NaN);
        }
      } catch (_) {}

      const effectiveTodayCalories = Number.isFinite(trackerCalories) ? trackerCalories : todayCalories;

      // Goals from Meal Preferences when available
      const computeGoalsFromPreferences = (prefs) => {
        if (!prefs) return null;
        let calories = Number(prefs.calorie_target || prefs.calorieTarget || 2000) || 2000;
        const goal = (prefs.goal || '').toLowerCase();
        if (goal === 'lose') calories = Math.round(calories * 0.85);
        if (goal === 'gain') calories = Math.round(calories * 1.15);
        const mp = (prefs.macro_preference || prefs.macroPreference || 'balanced').toLowerCase();
        const splits = { balanced: { c: 40, p: 30, f: 30 }, 'high-protein': { c: 30, p: 40, f: 30 }, 'low-carb': { c: 20, p: 40, f: 40 } };
        const s = splits[mp] || splits.balanced;
        const protein = Math.round((calories * (s.p / 100)) / 4);
        const carbs = Math.round((calories * (s.c / 100)) / 4);
        const fats = Math.round((calories * (s.f / 100)) / 9);
        return { calories, protein, carbs, fats };
      };

      let goalsFromPrefs = null;
      try {
        if (prefsRes.ok) {
          const prefJson = await prefsRes.json();
          const pref = prefJson?.data || prefJson?.preferences || prefJson || null;
          goalsFromPrefs = computeGoalsFromPreferences(pref);
        }
      } catch (_) {}

      setStats({
        weeklyOrders,
        todayCalories: effectiveTodayCalories,
        rewardPoints,
        streakDays
      });

      setRecentActivity(activities);

      // Nutrition data from tracker summary when available; goals from preferences when available
      const nd = {
        calories: Number.isFinite(trackerCalories) ? trackerCalories : effectiveTodayCalories,
        protein: Number.isFinite(trackerProtein) ? trackerProtein : 0,
        carbs: Number.isFinite(trackerCarbs) ? trackerCarbs : 0,
        fiber: 0
      };
      setNutritionData(nd);

      const hg = goalsFromPrefs || { calories: 2000, protein: 50, carbs: 250, fiber: 25 };
      setHealthGoals(hg);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMeal = (meal) => {
    navigate('/canteen');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="text-4xl text-[#0d3d23] animate-spin mx-auto mb-3" />
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">Track your nutrition goals and discover meals</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6">
        <QuickStats stats={stats} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 3-Way Meal Comparison - Takes 2 columns */}
        <div className="lg:col-span-2">
          <MealComparison
            aiRecommended={mealRecommendations.aiRecommended}
            vendorAvailable={mealRecommendations.vendorAvailable}
            vendorPromoted={mealRecommendations.vendorPromoted}
            onSelectMeal={handleSelectMeal}
          />
        </div>

        {/* Health Goals Progress */}
        <div>
          <HealthGoalsProgress
            nutritionData={nutritionData}
            goals={healthGoals}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <RecentActivity activities={recentActivity} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/canteen')}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0d3d23] to-[#1a5d3a] text-white rounded-xl hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <FaStore className="text-xl" />
            <span className="font-medium">Order Food</span>
          </div>
          <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={() => navigate('/nutrition')}
          className="flex items-center justify-between p-4 bg-white border border-slate-200 text-slate-900 rounded-xl hover:border-[#0d3d23] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <FaChartLine className="text-xl text-[#0d3d23]" />
            <span className="font-medium">Track Nutrition</span>
          </div>
          <FaArrowRight className="text-slate-400 group-hover:text-[#0d3d23] group-hover:translate-x-1 transition-all" />
        </button>
        
        <button
          onClick={() => navigate('/meal-planner')}
          className="flex items-center justify-between p-4 bg-white border border-slate-200 text-slate-900 rounded-xl hover:border-[#0d3d23] hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3">
            <FaUtensils className="text-xl text-[#0d3d23]" />
            <span className="font-medium">Plan Meals</span>
          </div>
          <FaArrowRight className="text-slate-400 group-hover:text-[#0d3d23] group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
}
