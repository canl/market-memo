import { Sector } from '../types';

export const SECTORS: Sector[] = [
  'Australia',
  'Japan', 
  'China',
  'SEA',
  'India',
  'Sovs'
];

export const SECTOR_LABELS: Record<Sector, string> = {
  'Australia': 'Australia IG',
  'Japan': 'Japan IG',
  'China': 'China IG', 
  'SEA': 'SEA IG',
  'India': 'India IG',
  'Sovs': 'Sovs'
};

// P&L field configurations for each sector
export const SECTOR_PNL_FIELDS: Record<Sector, string[]> = {
  'Australia': ['USD Bonds', 'AUD Bonds', 'CDS'],
  'Japan': ['USD Bonds', 'JPY Bonds', 'CDS'],
  'China': ['USD Bonds', 'CNY Bonds', 'CDS'],
  'SEA': ['USD Bonds', 'MYR Bonds', 'CDS'],
  'India': ['USD Bonds', 'INR Bonds', 'CDS'],
  'Sovs': ['USD Bonds', 'CDS']
};
