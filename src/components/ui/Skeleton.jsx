import React from 'react';

/**
 * Base Skeleton Component
 * Provides animated placeholder while content loads
 */
export const Skeleton = ({ className = '', animate = true }) => (
  <div 
    className={`
      bg-gray-200 rounded
      ${animate ? 'animate-pulse' : ''}
      ${className}
    `}
  />
);

/**
 * Text skeleton - for paragraphs and titles
 */
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

/**
 * Card skeleton - for card components
 */
export const SkeletonCard = ({ hasImage = true, className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
    {hasImage && <Skeleton className="h-48 w-full rounded-none" />}
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

/**
 * Avatar skeleton
 */
export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };
  
  return (
    <Skeleton className={`${sizeClasses[size]} rounded-full ${className}`} />
  );
};

/**
 * Table row skeleton
 */
export const SkeletonTableRow = ({ columns = 5, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

/**
 * Dashboard stat card skeleton
 */
export const SkeletonStatCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-4 w-32" />
  </div>
);

/**
 * Menu item skeleton
 */
export const SkeletonMenuItem = ({ className = '' }) => (
  <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
    <Skeleton className="h-40 w-full rounded-none" />
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  </div>
);

/**
 * List item skeleton
 */
export const SkeletonListItem = ({ hasAvatar = true, className = '' }) => (
  <div className={`flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100 ${className}`}>
    {hasAvatar && <SkeletonAvatar size="md" />}
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" />
  </div>
);

/**
 * Dashboard grid skeleton
 */
export const SkeletonDashboard = () => (
  <div className="p-6 space-y-6">
    {/* Stats row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonStatCard key={i} />
      ))}
    </div>
    
    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
    
    {/* Table */}
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <Skeleton className="h-6 w-48" />
      </div>
      <table className="w-full">
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonTableRow key={i} columns={5} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/**
 * Menu grid skeleton
 */
export const SkeletonMenuGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonMenuItem key={i} />
    ))}
  </div>
);

export default Skeleton;
