import { DailyReport, SectorRecap, APACComments, Sector } from '../types';
import { mockHistoricalData, sampleAPACComments, sampleSectorRecaps } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_REPORT: 'market-memo-current-report',
  HISTORICAL_DATA: 'market-memo-historical-data',
  DRAFT_SECTORS: 'market-memo-draft-sectors',
  DRAFT_APAC: 'market-memo-draft-apac'
};

// In-memory storage for demo mode (today's live data)
class InMemoryStorage {
  private static todaysSectorRecaps: Map<Sector, SectorRecap> = new Map();
  private static todaysAPACComments: APACComments | null = null;
  private static todaysDate: string = new Date().toISOString().split('T')[0];

  static getTodaysDate(): string {
    return this.todaysDate;
  }

  static isTodaysDate(date: string): boolean {
    return date === this.todaysDate;
  }

  static setSectorRecap(recap: SectorRecap): void {
    this.todaysSectorRecaps.set(recap.sector, recap);
  }

  static getSectorRecap(sector: Sector): SectorRecap | null {
    return this.todaysSectorRecaps.get(sector) || null;
  }

  static getAllSectorRecaps(): SectorRecap[] {
    return Array.from(this.todaysSectorRecaps.values());
  }

  static setAPACComments(comments: APACComments): void {
    this.todaysAPACComments = comments;
  }

  static getAPACComments(): APACComments | null {
    return this.todaysAPACComments;
  }

  static getTodaysReport(): DailyReport | null {
    const sectorRecaps = this.getAllSectorRecaps();
    const apacComments = this.getAPACComments();

    // Only return live data if we actually have some input
    if (sectorRecaps.length === 0 && !apacComments) {
      return null; // No live data, caller should fall back to mock data
    }

    // Create aggregated APAC comments if none exists but we have sector data
    let finalAPACComments: APACComments;

    if (apacComments) {
      finalAPACComments = apacComments;
    } else if (sectorRecaps.length > 0) {
      // Aggregate from sector recaps
      const aggregated = sectorRecaps.reduce(
        (totals, recap) => ({
          pnl: totals.pnl + (recap.metrics?.pnl || 0),
          risk: totals.risk + (recap.metrics?.risk || 0),
          volumes: totals.volumes + (recap.metrics?.volumes || 0)
        }),
        { pnl: 0, risk: 0, volumes: 0 }
      );

      finalAPACComments = {
        pnl: aggregated.pnl,
        risk: aggregated.risk,
        volumes: aggregated.volumes,
        marketCommentary: '',
        date: this.todaysDate
      };
    } else {
      // No data at all
      finalAPACComments = {
        pnl: 0,
        risk: 0,
        volumes: 0,
        marketCommentary: '',
        date: this.todaysDate
      };
    }

    return {
      date: this.todaysDate,
      apacComments: finalAPACComments,
      sectorRecaps: sectorRecaps,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
  }

  static clearTodaysData(): void {
    this.todaysSectorRecaps.clear();
    this.todaysAPACComments = null;
  }
}

// Local storage service for managing data
// Export InMemoryStorage for direct access
export { InMemoryStorage };

export class DataService {
  // Clear old data structure from localStorage
  static clearOldData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_REPORT);
      localStorage.removeItem(STORAGE_KEYS.HISTORICAL_DATA);
      localStorage.removeItem(STORAGE_KEYS.DRAFT_SECTORS);
      localStorage.removeItem(STORAGE_KEYS.DRAFT_APAC);
    } catch (error) {
      // Silently handle localStorage errors in production
    }
  }

  // Get current date's report
  static getCurrentReport(): DailyReport | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_REPORT);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      // Silently handle localStorage errors in production
      return null;
    }
  }

  // Save current report
  static saveCurrentReport(report: DailyReport): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_REPORT, JSON.stringify(report));
    } catch (error) {
      console.error('Error saving current report:', error);
    }
  }

  // Get historical data (mock + any saved reports + today's live data)
  static getHistoricalData(): DailyReport[] {
    try {
      // Start with mock data (historical dates only)
      const allData = [...mockHistoricalData];

      // Add today's live data if it exists
      const todaysReport = InMemoryStorage.getTodaysReport();
      if (todaysReport) {
        // Remove any existing mock data for today's date
        const filteredData = allData.filter(r => r.date !== InMemoryStorage.getTodaysDate());
        filteredData.push(todaysReport);
        return filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      return allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error loading historical data:', error);
      return mockHistoricalData;
    }
  }

  // Get a specific report by date (prioritizes in-memory storage for today)
  static getReportByDate(date: string): DailyReport | null {
    if (InMemoryStorage.isTodaysDate(date)) {
      return InMemoryStorage.getTodaysReport();
    }

    // For historical dates, check the historical data
    const historicalData = this.getHistoricalData();
    return historicalData.find(report => report.date === date) || null;
  }

  // Save a completed report to historical data
  static saveToHistory(report: DailyReport): void {
    try {
      const historical = this.getHistoricalData();
      const existingIndex = historical.findIndex(r => r.date === report.date);
      
      if (existingIndex >= 0) {
        historical[existingIndex] = report;
      } else {
        historical.push(report);
      }
      
      // Keep only user-saved reports in localStorage (mock data is always available)
      const userReports = historical.filter(r => 
        !mockHistoricalData.find(mock => mock.date === r.date)
      );
      
      localStorage.setItem(STORAGE_KEYS.HISTORICAL_DATA, JSON.stringify(userReports));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }

  // Draft management for sector recaps (uses in-memory storage for today)
  static saveDraftSectorRecap(sectorRecap: SectorRecap): void {
    try {
      if (InMemoryStorage.isTodaysDate(sectorRecap.date)) {
        // Save to in-memory storage for today's date
        InMemoryStorage.setSectorRecap(sectorRecap);
      } else {
        // Save to localStorage for other dates
        const drafts = this.getDraftSectorRecaps();
        const existingIndex = drafts.findIndex(d => d.sector === sectorRecap.sector);

        if (existingIndex >= 0) {
          drafts[existingIndex] = sectorRecap;
        } else {
          drafts.push(sectorRecap);
        }

        localStorage.setItem(STORAGE_KEYS.DRAFT_SECTORS, JSON.stringify(drafts));
      }
    } catch (error) {
      console.error('Error saving draft sector recap:', error);
    }
  }

  static getDraftSectorRecaps(): SectorRecap[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_SECTORS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading draft sector recaps:', error);
      return [];
    }
  }

  static getDraftSectorRecap(sector: Sector, date?: string): SectorRecap | null {
    // Check in-memory storage for today's date
    if (date && InMemoryStorage.isTodaysDate(date)) {
      return InMemoryStorage.getSectorRecap(sector);
    }

    // Check localStorage for other dates
    const drafts = this.getDraftSectorRecaps();
    return drafts.find(d => d.sector === sector) || null;
  }



  // Draft management for APAC comments (uses in-memory storage for today)
  static saveDraftAPACComments(apacComments: APACComments): void {
    try {
      if (InMemoryStorage.isTodaysDate(apacComments.date)) {
        // Save to in-memory storage for today's date
        InMemoryStorage.setAPACComments(apacComments);
      } else {
        // Save to localStorage for other dates
        localStorage.setItem(STORAGE_KEYS.DRAFT_APAC, JSON.stringify(apacComments));
      }
    } catch (error) {
      console.error('Error saving draft APAC comments:', error);
    }
  }

  static getDraftAPACComments(date?: string): APACComments | null {
    try {
      // Check in-memory storage for today's date
      if (date && InMemoryStorage.isTodaysDate(date)) {
        return InMemoryStorage.getAPACComments();
      }

      // Check localStorage for other dates
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_APAC);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      // Silently handle localStorage errors in production
      return null;
    }
  }

  // Clear all drafts
  static clearDrafts(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_SECTORS);
      localStorage.removeItem(STORAGE_KEYS.DRAFT_APAC);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_REPORT);
    } catch (error) {
      // Silently handle localStorage errors in production
    }
  }

  // Initialize today's report with sample data (for demo purposes)
  static initializeTodayWithSample(): DailyReport {
    const today = new Date().toISOString().split('T')[0];
    const report: DailyReport = {
      date: today,
      apacComments: { ...sampleAPACComments, date: today },
      sectorRecaps: sampleSectorRecaps.map(recap => ({ ...recap, date: today })),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    this.saveCurrentReport(report);
    return report;
  }
}
