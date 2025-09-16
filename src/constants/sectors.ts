import { Sector } from '../types';

// Updated sector list with 8 sectors total
export const SECTORS: Sector[] = [
  'Australia',
  'Japan',
  'China',
  'India',
  'SEA',
  'Korea',
  'Asia Sovereign',
  'CDS'
];

export const SECTOR_LABELS: Record<Sector, string> = {
  'Australia': 'Australia',
  'Japan': 'Japan',
  'China': 'China',
  'India': 'India',
  'SEA': 'SEA',
  'Korea': 'Korea',
  'Asia Sovereign': 'Asia Sovereign',
  'CDS': 'CDS'
};

// Sector model types
export type SectorModelType = 'IG Only' | 'IG & HY';

// Sector model configuration
export interface SectorModelConfig {
  type: SectorModelType;
  category: 'Country' | 'Asia Sovereign / CDS';
}

// Sector model mapping
export const SECTOR_MODELS: Record<Sector, SectorModelConfig> = {
  // IG Only sectors
  'Korea': { type: 'IG Only', category: 'Country' },
  'Asia Sovereign': { type: 'IG Only', category: 'Asia Sovereign / CDS' },
  'CDS': { type: 'IG Only', category: 'Asia Sovereign / CDS' },
  
  // IG & HY sectors
  'Australia': { type: 'IG & HY', category: 'Country' },
  'Japan': { type: 'IG & HY', category: 'Country' },
  'China': { type: 'IG & HY', category: 'Country' },
  'India': { type: 'IG & HY', category: 'Country' },
  'SEA': { type: 'IG & HY', category: 'Country' }
};

// Helper functions
export const getSectorModelType = (sector: Sector): SectorModelType => {
  return SECTOR_MODELS[sector]?.type || 'IG Only';
};

export const getSectorCategory = (sector: Sector): string => {
  return SECTOR_MODELS[sector]?.category || 'Country';
};

export const isIGOnlySector = (sector: Sector): boolean => {
  return getSectorModelType(sector) === 'IG Only';
};

export const isIGAndHYSector = (sector: Sector): boolean => {
  return getSectorModelType(sector) === 'IG & HY';
};

