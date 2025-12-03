import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Role-based route mappings
export const ROLE_ROUTES = {
  admin: '/admin',
  vendor: '/vendor',
  staff: '/delivery-staff',
  delivery_staff: '/delivery-staff',
  student: '/dashboard',
};

export const PUBLIC_ROUTES = ['/', '/login', '/register', '/privacy-policy', '/terms-of-service'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Validate token expiry if present
          const tokenExpiry = localStorage.getItem('tokenExpiry');
          if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
            logout();
            return;
          }
          
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback((userData, authToken, expiresIn = 86400000) => {
    try {
      localStorage.setItem('token', authToken);
      localStorage.setItem('accessToken', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('tokenExpiry', (Date.now() + expiresIn).toString());
      
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('mealPreferences');
    localStorage.removeItem('mealPlanCache');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  }, [user]);

  const getRedirectPath = useCallback(() => {
    if (!user?.role) return '/login';
    return ROLE_ROUTES[user.role] || '/dashboard';
  }, [user]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    hasRole,
    getRedirectPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
