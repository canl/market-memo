import jsPDF from 'jspdf';
import { DailyReport } from '../types';
import { PDFExportService } from './pdfExportService';
import { SECTOR_LABELS } from '../constants/sectors';
import { formatDate, formatCurrency, formatPnL } from '../utils/formatters';

export class ExportService {
  // Export report as PDF using enhanced PDF service
  static async exportToPDF(elementRef: HTMLElement, report: DailyReport): Promise<void> {
    try {
      await PDFExportService.exportToPDF(elementRef, report);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  // Export high quality PDF
  static async exportHighQualityPDF(elementRef: HTMLElement, report: DailyReport): Promise<void> {
    try {
      await PDFExportService.exportHighQuality(elementRef, report);
    } catch (error) {
      console.error('Error generating high quality PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  // Generate text-based PDF (alternative method)
  static generateTextPDF(report: DailyReport): void {
    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const lineHeight = 7;
      const pageHeight = 280;

      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        if (yPosition > pageHeight) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(fontSize);
        if (isBold) {
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        
        const lines = pdf.splitTextToSize(text, 180);
        pdf.text(lines, 15, yPosition);
        yPosition += lines.length * lineHeight;
      };

      // Title
      addText('APAC Market Memo', 18, true);
      addText(formatDate(report.date), 14, true);
      yPosition += 10;

      // APAC Overall Comments
      addText('APAC Overall Comments', 16, true);
      yPosition += 5;
      
      const totalPnL = report.apacComments.pnlCash + report.apacComments.pnlCds;
      addText(`Risk: ${report.apacComments.risk}`);
      addText(`P&L: ${formatCurrency(totalPnL)} (Cash: ${formatCurrency(report.apacComments.pnlCash)}, CDS: ${formatCurrency(report.apacComments.pnlCds)})`);
      addText(`Volumes: ${report.apacComments.volumes}`);
      yPosition += 10;

      // Sector Recaps
      report.sectorRecaps.forEach(recap => {
        addText(SECTOR_LABELS[recap.sector], 14, true);
        yPosition += 3;
        
        addText('Market Moves and Flows:', 12, true);
        addText(recap.marketMovesAndFlows || 'No market moves reported.');
        yPosition += 3;
        
        addText('Daily P&L:', 12, true);
        addText(formatPnL(recap.dailyPnL));
        yPosition += 3;
        
        addText('Market Commentary:', 12, true);
        addText(recap.marketCommentary || 'No market commentary provided.');
        yPosition += 10;
      });

      // Footer
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleString()}`, 15, pageHeight + 10);
      pdf.text(`Last modified: ${new Date(report.lastModified).toLocaleString()}`, 15, pageHeight + 15);

      // Download
      const fileName = `APAC_Market_Memo_${report.date}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating text PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }

  // Simulate email sending
  static simulateEmailSend(report: DailyReport): Promise<void> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        console.log('Email sent successfully:', {
          to: 'trading-desk@company.com',
          subject: `APAC Market Memo - ${formatDate(report.date)}`,
          date: report.date,
          attachments: [`APAC_Market_Memo_${report.date}.pdf`]
        });
        resolve();
      }, 1500);
    });
  }

  // Print functionality
  static printReport(): void {
    window.print();
  }
}
