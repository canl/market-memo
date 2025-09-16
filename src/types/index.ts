// Sector types
export type Sector = 'Australia' |
  'Japan' |
  'China' |
  'India' |
  'SEA' |
  'Korea' |
  'Asia Sovereign' |
  'CDS'

// IG Only metrics structure
export interface IGOnlyMetrics {
  ig: {
    pnl: number;
    risk: number;
    volumes: number;
  };
}

// IG & HY metrics structure with all credit types
export interface IGAndHYMetrics {
  ig: {
    pnl: number;
    risk: number;
    volumes: number;
  };
  hy: {
    pnl: number;
    risk: number;
    volumes: number;
  };
  lct: {
    pnl: number;
    risk: number;
    volumes: number;
  };
  cds: {
    pnl: number;
    risk: number;
    volumes: number;
  };
}

// Union type for sector metrics
export type SectorMetrics = IGOnlyMetrics | IGAndHYMetrics;

// Form input metrics for IG Only (string values for better UX)
export interface IGOnlyMetricsForm {
  ig: {
    pnl: string;
    risk: string;
    volumes: string;
  };
}

// Form input metrics for IG & HY (string values for better UX)
export interface IGAndHYMetricsForm {
  ig: {
    pnl: string;
    risk: string;
    volumes: string;
  };
  hy: {
    pnl: string;
    risk: string;
    volumes: string;
  };
  lct: {
    pnl: string;
    risk: string;
    volumes: string;
  };
  cds: {
    pnl: string;
    risk: string;
    volumes: string;
  };
}

// Union type for form metrics
export type SectorMetricsForm = IGOnlyMetricsForm | IGAndHYMetricsForm;

// IG Only Market Moves & Flows structure
export interface IGOnlyMarketMoves {
  ig: {
    lower?: number;
    higher?: number;
  };
}

// IG & HY Market Moves & Flows structure
export interface IGAndHYMarketMoves {
  ig: {
    lower?: number;
    higher?: number;
  };
  hy: {
    lower?: number;
    higher?: number;
  };
}

// Union type for market moves
export type MarketMovesAndFlows = IGOnlyMarketMoves | IGAndHYMarketMoves;

// Form input for IG Only Market Moves & Flows (string values for better UX)
export interface IGOnlyMarketMovesForm {
  ig: {
    lower: string;
    higher: string;
  };
}

// Form input for IG & HY Market Moves & Flows (string values for better UX)
export interface IGAndHYMarketMovesForm {
  ig: {
    lower: string;
    higher: string;
  };
  hy: {
    lower: string;
    higher: string;
  };
}

// Union type for form market moves
export type MarketMovesAndFlowsForm = IGOnlyMarketMovesForm | IGAndHYMarketMovesForm;

// Sector-specific recap data with simplified structure
export interface SectorRecap {
  sector: Sector;
  marketMovesAndFlows: MarketMovesAndFlows;
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

// Form state for trader input with new sector model
export interface TraderFormState {
  selectedSector: Sector;
  marketMovesAndFlows: MarketMovesAndFlowsForm;
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
export type NavigationView = 'dashboard' | 'daily-consolidation' | 'historical-data';
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
