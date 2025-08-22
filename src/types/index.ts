// Sector types
export type Sector = 'Australia IG' | 'Japan IG' | 'China IG' | 'SEA IG' | 'India IG' | 'Sovs';

// Simplified metrics structure for each sector
export interface SectorMetrics {
  pnl: number;
  risk: number;
  volumes: number;
}

// Form input metrics (string values for better UX)
export interface SectorMetricsForm {
  pnl: string;
  risk: string;
  volumes: string;
}

// Sector-specific recap data with simplified structure
export interface SectorRecap {
  sector: Sector;
  marketMovesAndFlows: string;
  metrics: SectorMetrics;
  marketCommentary: string;
  date: string;
  submittedBy?: string;
}

// APAC Overall Comments structure with simplified metrics
export interface APACComments {
  pnl: number;
  risk: number;
  volumes: number;
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

// Form state for trader input with simplified metrics
export interface TraderFormState {
  selectedSector: Sector;
  marketMovesAndFlows: string;
  metrics: SectorMetricsForm;
  marketCommentary: string;
}

// Form state for APAC comments with simplified structure
export interface APACFormState {
  pnl: number;
  risk: number;
  volumes: number;
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
