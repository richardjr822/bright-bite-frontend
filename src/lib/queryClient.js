import { QueryClient } from '@tanstack/react-query';
import { handleApiError } from '../utils/notifications';

/**
 * React Query Client Configuration
 * Optimized for production with caching, retries, and error handling
 */

// Default options for all queries
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
  gcTime: 30 * 60 * 1000, // 30 minutes - garbage collection time (was cacheTime)
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus: false, // Disable auto-refetch on window focus for better UX
  refetchOnReconnect: true,
};

// Default options for mutations
const defaultMutationOptions = {
  retry: false, // Don't retry mutations by default
  onError: (error) => {
    handleApiError(error);
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
});

/**
 * Query Keys Factory
 * Centralized query key management for cache invalidation
 */
export const queryKeys = {
  // User & Auth
  user: ['user'],
  userProfile: (userId) => ['user', 'profile', userId],
  
  // Meal Plans & Preferences
  mealPreferences: (userId) => ['mealPreferences', userId],
  mealPlan: (userId) => ['mealPlan', userId],
  mealPlanGenerate: (userId) => ['mealPlan', 'generate', userId],
  
  // Meals & Nutrition
  meals: (userId, date) => ['meals', userId, date],
  mealsSummary: (userId) => ['meals', 'summary', userId],
  nutritionToday: (userId) => ['nutrition', 'today', userId],
  
  // Menu & Vendors
  menuItems: (vendorId) => ['menuItems', vendorId],
  vendors: ['vendors'],
  vendor: (vendorId) => ['vendor', vendorId],
  
  // Orders
  orders: (userId) => ['orders', userId],
  order: (orderId) => ['order', orderId],
  vendorOrders: (vendorId) => ['vendorOrders', vendorId],
  
  // Cart
  cart: (userId) => ['cart', userId],
  
  // Analytics
  vendorAnalytics: (vendorId) => ['vendorAnalytics', vendorId],
  studentInsights: ['studentInsights'],
  adminAnalytics: ['adminAnalytics'],
  
  // Reviews & Feedback
  reviews: (vendorId) => ['reviews', vendorId],
  feedback: (userId) => ['feedback', userId],
  
  // Recommendations
  recommendations: (userId) => ['recommendations', userId],
  aiRecommendations: (vendorId) => ['aiRecommendations', vendorId],
  
  // Admin
  adminVendors: ['admin', 'vendors'],
  adminStudents: ['admin', 'students'],
  adminOrders: ['admin', 'orders'],
  pendingVendors: ['admin', 'pendingVendors'],
  
  // Delivery
  deliveries: (staffId) => ['deliveries', staffId],
  deliveryHistory: (staffId) => ['deliveryHistory', staffId],
};

/**
 * Cache Invalidation Helpers
 */
export const invalidateQueries = {
  // Invalidate all user-related queries
  user: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  
  // Invalidate meal-related queries
  meals: (userId) => {
    queryClient.invalidateQueries({ queryKey: ['meals', userId] });
    queryClient.invalidateQueries({ queryKey: ['mealPlan', userId] });
    queryClient.invalidateQueries({ queryKey: ['nutrition', userId] });
  },
  
  // Invalidate order-related queries
  orders: (userId, vendorId) => {
    queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    if (vendorId) {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders', vendorId] });
    }
  },
  
  // Invalidate menu items
  menu: (vendorId) => {
    queryClient.invalidateQueries({ queryKey: ['menuItems', vendorId] });
  },
  
  // Invalidate cart
  cart: (userId) => {
    queryClient.invalidateQueries({ queryKey: ['cart', userId] });
  },
  
  // Invalidate analytics
  analytics: () => {
    queryClient.invalidateQueries({ queryKey: ['vendorAnalytics'] });
    queryClient.invalidateQueries({ queryKey: ['studentInsights'] });
    queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
  },
  
  // Invalidate all
  all: () => {
    queryClient.invalidateQueries();
  },
};

/**
 * Prefetch Helpers
 * Pre-fetch data for better UX
 */
export const prefetchQueries = {
  dashboard: async (userId) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.mealsSummary(userId),
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.orders(userId),
      }),
    ]);
  },
  
  mealPlanner: async (userId) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.mealPlan(userId),
    });
  },
};

export default queryClient;
