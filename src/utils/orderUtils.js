export const formatOrderId = (orderId) => {
  if (!orderId) return 'N/A';
  
  if (orderId.length <= 12) return orderId;
  
  return `${orderId.substring(0, 8)}...${orderId.substring(orderId.length - 4)}`;
};

export const getFullOrderId = (orderId) => {
  return orderId || 'N/A';
};

export const formatOrderStatus = (status) => {
  if (!status) return 'Unknown';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const getStatusColor = (status) => {
  const statusColors = {
    'PENDING_CONFIRMATION': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'REJECTED': 'bg-red-100 text-red-800 border-red-200',
    'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-200',
    'PAYMENT_PROCESSING': 'bg-purple-100 text-purple-800 border-purple-200',
    'PREPARING': 'bg-orange-100 text-orange-800 border-orange-200',
    'READY_FOR_PICKUP': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'ON_THE_WAY': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'ARRIVING_SOON': 'bg-teal-100 text-teal-800 border-teal-200',
    'DELIVERED': 'bg-green-100 text-green-800 border-green-200',
    'COMPLETED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'RATING_PENDING': 'bg-amber-100 text-amber-800 border-amber-200'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};
