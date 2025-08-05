import { DailyReport, SectorRecap, APACComments, Sector } from '../types';
import { mockHistoricalData, sampleAPACComments, sampleSectorRecaps } from '../data/mockData';

const STORAGE_KEYS = {
  CURRENT_REPORT: 'market-memo-current-report',
  HISTORICAL_DATA: 'market-memo-historical-data',
  DRAFT_SECTORS: 'market-memo-draft-sectors',
  DRAFT_APAC: 'market-memo-draft-apac'
};

// Local storage service for managing data
export class DataService {
  // Get current date's report
  static getCurrentReport(): DailyReport | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_REPORT);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error loading current report:', error);
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

  // Get historical data (mock + any saved reports)
  static getHistoricalData(): DailyReport[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HISTORICAL_DATA);
      if (stored) {
        const savedData = JSON.parse(stored);
        // Merge with mock data, avoiding duplicates
        const allData = [...mockHistoricalData];
        savedData.forEach((report: DailyReport) => {
          if (!allData.find(r => r.date === report.date)) {
            allData.push(report);
          }
        });
        return allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return mockHistoricalData;
    } catch (error) {
      console.error('Error loading historical data:', error);
      return mockHistoricalData;
    }
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

  // Draft management for sector recaps
  static saveDraftSectorRecap(sectorRecap: SectorRecap): void {
    try {
      const drafts = this.getDraftSectorRecaps();
      const existingIndex = drafts.findIndex(d => d.sector === sectorRecap.sector);
      
      if (existingIndex >= 0) {
        drafts[existingIndex] = sectorRecap;
      } else {
        drafts.push(sectorRecap);
      }
      
      localStorage.setItem(STORAGE_KEYS.DRAFT_SECTORS, JSON.stringify(drafts));
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

  static getDraftSectorRecap(sector: Sector): SectorRecap | null {
    const drafts = this.getDraftSectorRecaps();
    return drafts.find(d => d.sector === sector) || null;
  }



  // Draft management for APAC comments
  static saveDraftAPACComments(apacComments: APACComments): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT_APAC, JSON.stringify(apacComments));
    } catch (error) {
      console.error('Error saving draft APAC comments:', error);
    }
  }

  static getDraftAPACComments(): APACComments | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFT_APAC);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading draft APAC comments:', error);
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
      console.error('Error clearing drafts:', error);
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
