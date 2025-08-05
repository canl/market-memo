import { Sector } from '../types';

export const SECTORS: Sector[] = [
  'Australia IG',
  'Japan IG',
  'China IG',
  'SEA IG',
  'India IG',
  'Sovs'
];

export const SECTOR_LABELS: Record<Sector, string> = {
  'Australia IG': 'Australia IG',
  'Japan IG': 'Japan IG',
  'China IG': 'China IG',
  'SEA IG': 'SEA IG',
  'India IG': 'India IG',
  'Sovs': 'Sovs'
};

// P&L field configurations for each sector
export const SECTOR_PNL_FIELDS: Record<Sector, string[]> = {
  'Australia IG': ['USD Bonds', 'AUD Bonds', 'CDS'],
  'Japan IG': ['USD Bonds', 'JPY Bonds', 'CDS'],
  'China IG': ['USD Bonds', 'CNY Bonds', 'CDS'],
  'SEA IG': ['USD Bonds', 'MYR Bonds', 'CDS'],
  'India IG': ['USD Bonds', 'INR Bonds', 'CDS'],
  'Sovs': ['USD Bonds', 'CDS']
};
