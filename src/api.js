// Central API base resolution: keeps localhost for local dev, uses Render prod URL otherwise.
// Order of precedence:
// 1. Explicit Vite env var VITE_API_BASE (without trailing slash)
// 2. If running on localhost in browser -> localhost fallback
// 3. Production Render domain
const PROD_BASE = 'https://bright-bite-backend.onrender.com';
const LOCAL_FALLBACK = 'http://localhost:5000';

// Clean any provided base (remove trailing slash & a trailing /api to avoid duplication)
function cleanBase(raw) {
  if (!raw) return raw;
  let b = raw.trim();
  // remove trailing slash
  b = b.replace(/\/$/, '');
  // if ends exactly with /api remove that segment
  b = b.replace(/\/api$/i, '');
  return b;
}

// Safely read Vite env var
const ENV_BASE_RAW = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : null;
const ENV_BASE = cleanBase(ENV_BASE_RAW);

function resolveBase() {
  if (ENV_BASE) return ENV_BASE; // explicit override (already cleaned)
  if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
    return LOCAL_FALLBACK; // keep localhost during local dev
  }
  return PROD_BASE; // production domain
}

export const API_BASE = `${resolveBase()}/api`;

// Helper for websocket base (auto wss in production)
export function getWsBase() {
  const base = resolveBase().replace(/\/$/, '');
  const proto = base.startsWith('https') ? 'wss' : 'ws';
  return `${proto}://${base.replace(/^https?:\/\//, '')}`;
}

export const apiClient = async (path, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    let detail = 'Request failed';
    try {
      const data = await response.json();
      detail = data?.message || data?.detail || JSON.stringify(data);
    } catch (_) {}
    throw new Error(detail);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

export const login = (email, password) =>
  apiClient('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const googleLogin = (idToken) =>
  apiClient('/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });

export const register = (email, password, full_name) =>
  apiClient('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  });

// Map UI camelCase prefs to backend's snake_case
function toBackendPrefs(p = {}) {
  return {
    age: p.age ? Number(p.age) : null,
    sex: p.sex || null,
    height: p.height ? Number(p.height) : null,
    weight: p.weight ? Number(p.weight) : null,
    goal: p.goal || "maintain",
    activity_level: p.activityLevel || "sedentary",
    dietary_preference: Array.isArray(p.dietaryPreference) ? p.dietaryPreference : [],
    avoid_foods: p.avoidFoods || "",
    allergies: Array.isArray(p.allergies) ? p.allergies : [],
    health_conditions: Array.isArray(p.healthConditions) ? p.healthConditions : [],
    calorie_target: p.calorieTarget ? Number(p.calorieTarget) : null,
    macro_preference: p.macroPreference || "balanced",
    meals_per_day: p.mealsPerDay ? Number(p.mealsPerDay) : 3,
    meal_complexity: p.mealComplexity || "simple",
    meal_prep_style: p.mealPrepStyle || "daily",
    daily_budget: p.dailyBudget ? Number(p.dailyBudget) : null,
    cooking_time: p.cookingTime ? Number(p.cookingTime) : null,
    cooking_methods: Array.isArray(p.cookingMethod) ? p.cookingMethod : [],
    special_goals: Array.isArray(p.specialGoals) ? p.specialGoals : [],
    appetite: p.appetite || "normal",
  };
}

// Unified meal plan helpers using apiClient (token auto-added from localStorage)
export async function getMealPreferences(userId) {
  // header x-user-id required by backend
  return apiClient(`/meal-plans/preferences`, {
    headers: { 'x-user-id': userId },
  });
}

export function saveMealPreferences(userId, prefs) {
  // PATCH upsert body: { userId, ...snake_case prefs }
  const body = { userId, ...toBackendPrefs(prefs) };
  return apiClient(`/meal-plans/preferences`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function generateMealPlan(userId, payload = {}) {
  const body = { userId, ...payload };
  return apiClient(`/meal-plans/generate`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ==== OTP & Email Helpers (Resend backend integration) ====
export function sendRegistrationOtp(name, email) {
  return apiClient(`/auth/send-otp`, {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export function resendRegistrationOtp(name, email) {
  return apiClient(`/auth/resend-otp`, {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export function verifyRegistrationOtp(email, otp) {
  return apiClient(`/auth/verify-otp`, {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

export function completeRegistration(data) {
  return apiClient(`/auth/complete-registration`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function sendResetOtp(email) {
  return apiClient(`/auth/send-reset-otp`, {
    method: 'POST',
    body: JSON.stringify({ email, name: 'User' }),
  });
}

export function verifyResetOtp(email, otp) {
  return apiClient(`/auth/verify-reset-otp`, {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

export function resetPassword(email, otp, newPassword) {
  return apiClient(`/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ email, otp, new_password: newPassword }),
  });
}


