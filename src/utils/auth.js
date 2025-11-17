import { API_BASE } from '../api';

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get authentication token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Validate JWT token format and expiration
 * @param {string} token - JWT token to validate
 * @returns {boolean}
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Parse JWT token (format: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload (base64url)
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      return expirationDate > now;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken'); // Legacy token key
  
  // Clear any other auth-related data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('session'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

/**
 * Perform logout - clear local data and call API
 * @param {function} navigate - React Router navigate function
 * @returns {Promise<void>}
 */
export const logout = async (navigate) => {
  try {
    const token = getToken();
    
    // Call logout API if token exists
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
        // Continue with logout even if API call fails
        console.error('Logout API error:', apiError);
      }
    }
    
    // Clear all authentication data
    clearAuthData();
    
    // Redirect to login page
    if (navigate) {
      navigate('/login', { replace: true });
    } else {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Ensure cleanup happens even on error
    clearAuthData();
    if (navigate) {
      navigate('/login', { replace: true });
    } else {
      window.location.href = '/login';
    }
  }
};

/**
 * Check if user has required role
 * @param {string} requiredRole - Role to check
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  return user && user.role === requiredRole;
};

/**
 * Validate authentication state and redirect if invalid
 * @param {function} navigate - React Router navigate function
 * @returns {boolean} - true if authenticated, false otherwise
 */
export const validateAuth = (navigate) => {
  const token = getToken();
  const user = getCurrentUser();
  
  // Check if token and user exist
  if (!token || !user) {
    clearAuthData();
    if (navigate) {
      navigate('/login', { replace: true });
    }
    return false;
  }
  
  // Check if token is valid
  if (!isTokenValid(token)) {
    clearAuthData();
    if (navigate) {
      navigate('/login', { replace: true });
    }
    return false;
  }
  
  return true;
};

/**
 * Save user authentication data
 * @param {string} token - JWT token
 * @param {Object} user - User object
 */
export const saveAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Refresh user data from API
 * @returns {Promise<Object|null>}
 */
export const refreshUserData = async () => {
  try {
    const token = getToken();
    const user = getCurrentUser();
    
    if (!token || !user) return null;
    
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return null;
  }
};
