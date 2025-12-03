import React from 'react';

/**
 * Reusable Loading Spinner Component
 * Supports multiple sizes, colors, and display modes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'green',
  fullScreen = false,
  message = null,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4',
  };

  const colorClasses = {
    green: 'border-green-500',
    blue: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size] || sizeClasses.md}
          ${colorClasses[color] || colorClasses.green}
          border-t-transparent
          rounded-full
          animate-spin
        `}
      />
      {message && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-gray-600'} animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Page-level loading component with branding
 */
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-2xl">🍽️</span>
      </div>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

/**
 * Inline loader for buttons or small areas
 */
export const InlineLoader = ({ size = 'sm', className = '' }) => (
  <LoadingSpinner size={size} className={className} />
);

/**
 * Overlay loader for sections
 */
export const OverlayLoader = ({ message = 'Processing...' }) => (
  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
    <LoadingSpinner size="md" message={message} />
  </div>
);

export default LoadingSpinner;
