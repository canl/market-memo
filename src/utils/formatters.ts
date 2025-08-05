import { DailyPnL } from '../types';

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

// Format P&L for display
export const formatPnL = (pnl: DailyPnL): string => {
  const parts: string[] = [];
  
  if (pnl.usdBonds !== undefined && pnl.usdBonds !== 0) {
    parts.push(`USD Bonds ${formatCurrency(pnl.usdBonds)}`);
  }
  if (pnl.localBonds !== undefined && pnl.localBonds !== 0) {
    parts.push(`Local Bonds ${formatCurrency(pnl.localBonds)}`);
  }
  if (pnl.jpyBonds !== undefined && pnl.jpyBonds !== 0) {
    parts.push(`JPY Bonds ${formatCurrency(pnl.jpyBonds)}`);
  }
  if (pnl.cnyBonds !== undefined && pnl.cnyBonds !== 0) {
    parts.push(`CNY Bonds ${formatCurrency(pnl.cnyBonds)}`);
  }
  if (pnl.myrBonds !== undefined && pnl.myrBonds !== 0) {
    parts.push(`MYR Bonds ${formatCurrency(pnl.myrBonds)}`);
  }
  if (pnl.inrBonds !== undefined && pnl.inrBonds !== 0) {
    parts.push(`INR Bonds ${formatCurrency(pnl.inrBonds)}`);
  }
  if (pnl.cds !== undefined && pnl.cds !== 0) {
    parts.push(`CDS ${formatCurrency(pnl.cds)}`);
  }
  
  return parts.join(', ') || 'No P&L data';
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

// Calculate total P&L
export const calculateTotalPnL = (pnl: DailyPnL): number => {
  return (pnl.usdBonds || 0) + 
         (pnl.localBonds || 0) + 
         (pnl.jpyBonds || 0) + 
         (pnl.cnyBonds || 0) + 
         (pnl.myrBonds || 0) + 
         (pnl.inrBonds || 0) + 
         (pnl.cds || 0);
};
