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

// Unified meal plan helpers using apiClient (token auto-added from localStorage)
export function saveMealPreferences(userId, prefs) {
  return apiClient(`/meal-plans/preferences/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(prefs),
  });
}

export function getMealPreferences(userId) {
  return apiClient(`/meal-plans/preferences/${userId}`, {});
}

export function generateMealPlan(userId, payload) {
  return apiClient(`/meal-plans/generate/${userId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}


