// Sector types
export type Sector = 'Australia' | 'Japan' | 'China' | 'SEA' | 'India' | 'Sovs';

// P&L structure for different sectors
export interface DailyPnL {
  usdBonds?: number;
  localBonds?: number;
  jpyBonds?: number;
  cnyBonds?: number;
  myrBonds?: number;
  inrBonds?: number;
  cds?: number;
}

// Sector-specific recap data
export interface SectorRecap {
  sector: Sector;
  marketMovesAndFlows: string;
  dailyPnL: DailyPnL;
  marketCommentary: string;
  date: string;
  submittedBy?: string;
}

// APAC Overall Comments structure
export interface APACComments {
  risk: string;
  pnlCash: number;
  pnlCds: number;
  volumes: string;
  marketCommentary?: string;
  date: string;
}

// Complete daily report structure
export interface DailyReport {
  date: string;
  apacComments: APACComments;
  sectorRecaps: SectorRecap[];
  createdAt: string;
  lastModified: string;
}

// Historical data filter options
export interface HistoricalFilter {
  dateFrom?: string;
  dateTo?: string;
  sector?: Sector | 'All';
}

// Form state for trader input
export interface TraderFormState {
  selectedSector: Sector;
  marketMovesAndFlows: string;
  dailyPnL: DailyPnL;
  marketCommentary: string;
}

// Form state for APAC comments
export interface APACFormState {
  risk: string;
  pnlCash: string;
  pnlCds: string;
  volumes: string;
}

// Navigation state
export type ViewMode = 'input' | 'apac' | 'historical' | 'report';
export type NavigationView = 'trader-input' | 'daily-consolidation' | 'historical-data';
export type InputMode = 'sector' | 'apac';

// Export options
export interface ExportOptions {
  format: 'pdf' | 'email';
  includeDate: boolean;
  includeSignature: boolean;
}

// Notification types
export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}
