import { SectorRecap, DailyPnL, APACComments } from '../types';
import { DataService } from './dataService';

export class AggregationService {
  // Calculate total P&L from all sector inputs for a specific date
  static calculateAPACPnL(date: string): { cash: number; cds: number; total: number } {
    const sectorRecaps = DataService.getDraftSectorRecaps();
    const dateRecaps = sectorRecaps.filter(recap => recap.date === date);
    
    let totalCash = 0;
    let totalCds = 0;
    
    dateRecaps.forEach(recap => {
      const pnl = recap.dailyPnL;
      
      // Sum all bond types as cash
      totalCash += (pnl.usdBonds || 0) + 
                   (pnl.localBonds || 0) + 
                   (pnl.jpyBonds || 0) + 
                   (pnl.cnyBonds || 0) + 
                   (pnl.myrBonds || 0) + 
                   (pnl.inrBonds || 0);
      
      // Sum CDS separately
      totalCds += (pnl.cds || 0);
    });
    
    return {
      cash: totalCash,
      cds: totalCds,
      total: totalCash + totalCds
    };
  }

  // Get aggregated P&L breakdown by sector for a specific date
  static getSectorPnLBreakdown(date: string): Array<{
    sector: string;
    totalPnL: number;
    cashPnL: number;
    cdsPnL: number;
    details: DailyPnL;
  }> {
    const sectorRecaps = DataService.getDraftSectorRecaps();
    const dateRecaps = sectorRecaps.filter(recap => recap.date === date);
    
    return dateRecaps.map(recap => {
      const pnl = recap.dailyPnL;
      const cashPnL = (pnl.usdBonds || 0) + 
                      (pnl.localBonds || 0) + 
                      (pnl.jpyBonds || 0) + 
                      (pnl.cnyBonds || 0) + 
                      (pnl.myrBonds || 0) + 
                      (pnl.inrBonds || 0);
      const cdsPnL = pnl.cds || 0;
      
      return {
        sector: recap.sector,
        totalPnL: cashPnL + cdsPnL,
        cashPnL,
        cdsPnL,
        details: pnl
      };
    });
  }

  // Create or update APAC comments with auto-calculated P&L
  static createAPACCommentsWithCalculatedPnL(
    risk: string,
    volumes: string,
    marketCommentary: string,
    date: string
  ): APACComments {
    const pnlData = this.calculateAPACPnL(date);
    
    return {
      risk,
      pnlCash: pnlData.cash,
      pnlCds: pnlData.cds,
      volumes,
      date
    };
  }

  // Get summary statistics for a date
  static getDateSummary(date: string): {
    totalSectors: number;
    completedSectors: number;
    totalPnL: number;
    riskExposure: string;
    volumes: string;
  } {
    const sectorRecaps = DataService.getDraftSectorRecaps();
    const dateRecaps = sectorRecaps.filter(recap => recap.date === date);
    const apacComments = DataService.getDraftAPACComments();
    
    const pnlData = this.calculateAPACPnL(date);
    
    return {
      totalSectors: 6, // Total number of sectors
      completedSectors: dateRecaps.length,
      totalPnL: pnlData.total,
      riskExposure: (apacComments && apacComments.date === date) ? apacComments.risk : '',
      volumes: (apacComments && apacComments.date === date) ? apacComments.volumes : ''
    };
  }

  // Check if all sectors have been completed for a date
  static isDateComplete(date: string): boolean {
    const sectorRecaps = DataService.getDraftSectorRecaps();
    const dateRecaps = sectorRecaps.filter(recap => recap.date === date);
    const apacComments = DataService.getDraftAPACComments();
    
    const hasAllSectors = dateRecaps.length === 6; // All 6 sectors
    const hasAPACComments = apacComments && apacComments.date === date;
    
    return hasAllSectors && !!hasAPACComments;
  }

  // Get real-time P&L updates for live display
  static subscribeToRealTimePnL(date: string, callback: (pnlData: {
    cash: number;
    cds: number;
    total: number;
    breakdown: Array<{ sector: string; totalPnL: number; }>
  }) => void): () => void {
    // In a real application, this would set up a subscription to real-time updates
    // For now, we'll simulate with periodic updates
    const interval = setInterval(() => {
      const pnlData = this.calculateAPACPnL(date);
      const breakdown = this.getSectorPnLBreakdown(date);
      
      callback({
        ...pnlData,
        breakdown: breakdown.map(item => ({
          sector: item.sector,
          totalPnL: item.totalPnL
        }))
      });
    }, 1000); // Update every second
    
    // Return cleanup function
    return () => clearInterval(interval);
  }
}
