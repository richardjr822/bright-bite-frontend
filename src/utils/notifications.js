import toast from 'react-hot-toast';

/**
 * Notification Utilities
 * Centralized toast notifications with consistent styling
 */

// Default toast options
const defaultOptions = {
  duration: 4000,
  position: 'top-center',
};

// Success notification
export const showSuccess = (message, options = {}) => {
  return toast.success(message, {
    ...defaultOptions,
    ...options,
    icon: '✅',
    style: {
      background: '#ecfdf5',
      color: '#065f46',
      border: '1px solid #6ee7b7',
      padding: '12px 16px',
      borderRadius: '12px',
      fontWeight: 500,
    },
  });
};

// Error notification
export const showError = (message, options = {}) => {
  return toast.error(message, {
    ...defaultOptions,
    duration: 5000, // Errors stay longer
    ...options,
    icon: '❌',
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fca5a5',
      padding: '12px 16px',
      borderRadius: '12px',
      fontWeight: 500,
    },
  });
};

// Warning notification
export const showWarning = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: '⚠️',
    style: {
      background: '#fffbeb',
      color: '#92400e',
      border: '1px solid #fcd34d',
      padding: '12px 16px',
      borderRadius: '12px',
      fontWeight: 500,
    },
  });
};

// Info notification
export const showInfo = (message, options = {}) => {
  return toast(message, {
    ...defaultOptions,
    ...options,
    icon: 'ℹ️',
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #93c5fd',
      padding: '12px 16px',
      borderRadius: '12px',
      fontWeight: 500,
    },
  });
};

// Loading notification (returns toast ID for dismissal)
export const showLoading = (message = 'Loading...', options = {}) => {
  return toast.loading(message, {
    ...defaultOptions,
    duration: Infinity, // Loading stays until dismissed
    ...options,
    style: {
      background: '#f9fafb',
      color: '#374151',
      border: '1px solid #d1d5db',
      padding: '12px 16px',
      borderRadius: '12px',
      fontWeight: 500,
    },
  });
};

// Dismiss a specific toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Promise-based toast (for async operations)
export const showPromise = (promise, messages, options = {}) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Processing...',
      success: messages.success || 'Success!',
      error: (err) => messages.error || err?.message || 'Something went wrong',
    },
    {
      ...defaultOptions,
      ...options,
      success: {
        style: {
          background: '#ecfdf5',
          color: '#065f46',
          border: '1px solid #6ee7b7',
        },
      },
      error: {
        style: {
          background: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fca5a5',
        },
      },
    }
  );
};

// Action-specific notifications
export const notify = {
  // Authentication
  loginSuccess: (name) => showSuccess(`Welcome back, ${name}!`),
  loginError: (msg) => showError(msg || 'Login failed. Please check your credentials.'),
  logoutSuccess: () => showSuccess('Successfully logged out'),
  sessionExpired: () => showWarning('Your session has expired. Please log in again.'),
  
  // Orders
  orderPlaced: () => showSuccess('Order placed successfully!'),
  orderCancelled: () => showInfo('Order has been cancelled'),
  orderError: (msg) => showError(msg || 'Failed to process order'),
  
  // Menu items
  itemAdded: (name) => showSuccess(`${name} added to cart`),
  itemRemoved: (name) => showInfo(`${name} removed from cart`),
  cartCleared: () => showInfo('Cart cleared'),
  
  // Meal planning
  mealPlanGenerated: () => showSuccess('Your meal plan has been generated!'),
  mealPlanSaved: () => showSuccess('Meal plan saved successfully'),
  preferencesUpdated: () => showSuccess('Preferences updated successfully'),
  mealLogged: (name) => showSuccess(`${name} logged to tracker`),
  
  // Profile
  profileUpdated: () => showSuccess('Profile updated successfully'),
  passwordChanged: () => showSuccess('Password changed successfully'),
  avatarUpdated: () => showSuccess('Avatar updated successfully'),
  
  // Vendor
  menuItemCreated: () => showSuccess('Menu item created successfully'),
  menuItemUpdated: () => showSuccess('Menu item updated'),
  menuItemDeleted: () => showInfo('Menu item deleted'),
  orderStatusUpdated: (status) => showSuccess(`Order marked as ${status}`),
  
  // Admin
  vendorApproved: (name) => showSuccess(`${name} has been approved`),
  vendorRejected: (name) => showInfo(`${name} has been rejected`),
  userUpdated: () => showSuccess('User updated successfully'),
  
  // Generic
  saved: () => showSuccess('Changes saved'),
  deleted: () => showInfo('Item deleted'),
  copied: () => showSuccess('Copied to clipboard'),
  
  // Network/API
  networkError: () => showError('Network error. Please check your connection.'),
  serverError: () => showError('Server error. Please try again later.'),
  unauthorized: () => showError('Unauthorized. Please log in again.'),
  forbidden: () => showError('You do not have permission to perform this action.'),
  notFound: () => showError('The requested resource was not found.'),
  validationError: (msg) => showError(msg || 'Please check your input and try again.'),
};

// Handle API errors consistently
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (!navigator.onLine) {
    notify.networkError();
    return;
  }
  
  const status = error?.response?.status || error?.status;
  const message = error?.response?.data?.detail || error?.message || fallbackMessage;
  
  switch (status) {
    case 400:
      notify.validationError(message);
      break;
    case 401:
      notify.unauthorized();
      break;
    case 403:
      notify.forbidden();
      break;
    case 404:
      notify.notFound();
      break;
    case 500:
    case 502:
    case 503:
      notify.serverError();
      break;
    default:
      showError(message);
  }
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  showPromise,
  dismissToast,
  dismissAllToasts,
  notify,
  handleApiError,
};
