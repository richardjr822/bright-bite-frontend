import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import { API_BASE } from '../api';
import { handleApiError, notify } from '../utils/notifications';

/**
 * API Fetch Helper with Auth
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (user?.id) {
    headers['x-user-id'] = user.id;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = new Error('API Error');
    error.status = response.status;
    try {
      error.data = await response.json();
    } catch {}
    throw error;
  }
  
  return response.json();
};

/**
 * Meal Preferences Hooks
 */
export const useMealPreferences = (userId) => {
  return useQuery({
    queryKey: queryKeys.mealPreferences(userId),
    queryFn: () => fetchWithAuth(`/meal-plans/preferences`, {
      headers: { 'x-user-id': userId }
    }),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSaveMealPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, preferences }) => 
      fetchWithAuth('/meal-plans/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ userId, ...preferences }),
      }),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPreferences(userId) });
      notify.preferencesUpdated();
    },
    onError: handleApiError,
  });
};

/**
 * Meal Plan Hooks
 */
export const useMealPlan = (userId) => {
  return useQuery({
    queryKey: queryKeys.mealPlan(userId),
    queryFn: () => fetchWithAuth('/meal-plans/plan', {
      headers: { 'x-user-id': userId }
    }),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useGenerateMealPlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, preferences, force = false }) =>
      fetchWithAuth('/meal-plans/generate', {
        method: 'POST',
        body: JSON.stringify({ userId, ...preferences, force_regenerate: force }),
      }),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mealPlan(userId) });
      notify.mealPlanGenerated();
    },
    onError: handleApiError,
  });
};

/**
 * Nutrition & Meals Hooks
 */
export const useMealsSummary = (userId) => {
  return useQuery({
    queryKey: queryKeys.mealsSummary(userId),
    queryFn: () => fetchWithAuth('/meal-plans/meals/summary'),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent updates
  });
};

export const useLogMeal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mealData) =>
      fetchWithAuth('/meal-plans/meals', {
        method: 'POST',
        body: JSON.stringify(mealData),
      }),
    onSuccess: (data, variables) => {
      invalidateQueries.meals(variables.userId);
      notify.mealLogged(variables.name || 'Meal');
    },
    onError: handleApiError,
  });
};

/**
 * Menu Items Hooks
 */
export const useMenuItems = (vendorId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.menuItems(vendorId),
    queryFn: () => fetchWithAuth(`/vendor/menu/${vendorId}`),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vendorId, item }) => {
      const formData = new FormData();
      Object.entries(item).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      return fetch(`${API_BASE}/vendor/menu/${vendorId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      }).then(res => res.json());
    },
    onSuccess: (data, { vendorId }) => {
      invalidateQueries.menu(vendorId);
      notify.menuItemCreated();
    },
    onError: handleApiError,
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vendorId, itemId, updates }) =>
      fetchWithAuth(`/vendor/menu/${vendorId}/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    onSuccess: (data, { vendorId }) => {
      invalidateQueries.menu(vendorId);
      notify.menuItemUpdated();
    },
    onError: handleApiError,
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vendorId, itemId }) =>
      fetchWithAuth(`/vendor/menu/${vendorId}/${itemId}`, {
        method: 'DELETE',
      }),
    onSuccess: (data, { vendorId }) => {
      invalidateQueries.menu(vendorId);
      notify.menuItemDeleted();
    },
    onError: handleApiError,
  });
};

/**
 * Orders Hooks
 */
export const useOrders = (userId) => {
  return useQuery({
    queryKey: queryKeys.orders(userId),
    queryFn: () => fetchWithAuth(`/orders/user/${userId}`),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useVendorOrders = (vendorId) => {
  return useQuery({
    queryKey: queryKeys.vendorOrders(vendorId),
    queryFn: () => fetchWithAuth(`/orders/vendor/${vendorId}`),
    enabled: !!vendorId,
    staleTime: 30 * 1000, // 30 seconds - orders update frequently
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) =>
      fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    onSuccess: (data, variables) => {
      invalidateQueries.orders(variables.userId, variables.vendorId);
      invalidateQueries.cart(variables.userId);
      notify.orderPlaced();
    },
    onError: handleApiError,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status, vendorId }) =>
      fetchWithAuth(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (data, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      notify.orderStatusUpdated(status);
    },
    onError: handleApiError,
  });
};

/**
 * Vendor Analytics Hooks
 */
export const useVendorAnalytics = (vendorId, days = 30) => {
  return useQuery({
    queryKey: [...queryKeys.vendorAnalytics(vendorId), days],
    queryFn: () => fetchWithAuth(`/vendor/analytics/${vendorId}?days=${days}`),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudentInsights = () => {
  return useQuery({
    queryKey: queryKeys.studentInsights,
    queryFn: () => fetchWithAuth('/insights/vendor/student-analytics'),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAIRecommendations = (vendorId, limit = 5) => {
  return useQuery({
    queryKey: [...queryKeys.aiRecommendations(vendorId), limit],
    queryFn: () => fetchWithAuth(`/vendor/ai/recommendations/${vendorId}?limit=${limit}`),
    enabled: !!vendorId,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Reviews & Feedback Hooks
 */
export const useVendorReviews = (vendorId) => {
  return useQuery({
    queryKey: queryKeys.reviews(vendorId),
    queryFn: () => fetchWithAuth(`/feedback/vendor/${vendorId}`),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (feedbackData) =>
      fetchWithAuth('/feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      }),
    onSuccess: (data, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(vendorId) });
      notify.saved();
    },
    onError: handleApiError,
  });
};

/**
 * Recommendations Hooks
 */
export const useRecommendations = (userId) => {
  return useQuery({
    queryKey: queryKeys.recommendations(userId),
    queryFn: () => fetchWithAuth('/insights/recommendations'),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Admin Hooks
 */
export const usePendingVendors = () => {
  return useQuery({
    queryKey: queryKeys.pendingVendors,
    queryFn: () => fetchWithAuth('/admin/vendors/pending'),
    staleTime: 1 * 60 * 1000,
  });
};

export const useApproveVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vendorId }) =>
      fetchWithAuth(`/admin/vendors/${vendorId}/approve`, {
        method: 'POST',
      }),
    onSuccess: (data, { name }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingVendors });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminVendors });
      notify.vendorApproved(name || 'Vendor');
    },
    onError: handleApiError,
  });
};

export const useRejectVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ vendorId, reason }) =>
      fetchWithAuth(`/admin/vendors/${vendorId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    onSuccess: (data, { name }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingVendors });
      notify.vendorRejected(name || 'Vendor');
    },
    onError: handleApiError,
  });
};

export default {
  useMealPreferences,
  useSaveMealPreferences,
  useMealPlan,
  useGenerateMealPlan,
  useMealsSummary,
  useLogMeal,
  useMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useOrders,
  useVendorOrders,
  useCreateOrder,
  useUpdateOrderStatus,
  useVendorAnalytics,
  useStudentInsights,
  useAIRecommendations,
  useVendorReviews,
  useSubmitFeedback,
  useRecommendations,
  usePendingVendors,
  useApproveVendor,
  useRejectVendor,
};
