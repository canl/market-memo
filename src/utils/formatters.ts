
import { MarketMovesAndFlows } from '../types';

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

/**
 * Formats Market Moves & Flows values for display
 * @param marketMovesAndFlows - The market moves and flows object
 * @returns Formatted string in "lower/higher" format
 */
export const formatMarketMovesAndFlows = (marketMovesAndFlows: MarketMovesAndFlows): string => {
  const { lower, higher } = marketMovesAndFlows;

  // If both values are undefined/null, return 0/0 (consistent with metrics showing 0)
  if (lower === undefined && higher === undefined) {
    return '0/0';
  }

  // Format individual values
  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return '–';
    }
    // Handle decimals properly
    return value % 1 === 0 ? value.toString() : value.toString();
  };

  return `${formatValue(lower)}/${formatValue(higher)}`;
};

/**
 * Parses string input to number, handling empty strings
 * @param value - String value from input
 * @returns Number or undefined if empty/invalid
 */
export const parseNumericInput = (value: string): number | undefined => {
  if (!value || value.trim() === '') {
    return undefined;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

/**
 * Formats number for input field display
 * @param value - Number value
 * @returns String representation for input field
 */
export const formatNumericInput = (value: number | undefined): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return value.toString();
};


