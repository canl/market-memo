

// Format currency values
export const formatCurrency = (value: number): string => {
  if (value === 0) return '0';
  
  const absValue = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';
  
  if (absValue >= 1000000) {
    return `${sign}${(absValue / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    return `${sign}${(absValue / 1000).toFixed(0)}k`;
  } else {
    return `${sign}${absValue}`;
  }
};



// Format date for display
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date for input fields
export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};


