import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DailyReport } from '../types';
import { formatDate } from '../utils/formatters';

export class PDFExportService {
  /**
   * Export a consolidated report to PDF
   * @param elementRef - Reference to the HTML element to export
   * @param report - The report data for filename generation
   * @param options - Export options
   */
  static async exportToPDF(
    elementRef: HTMLElement,
    report: DailyReport,
    options: {
      filename?: string;
      quality?: number;
      format?: 'a4' | 'letter';
      orientation?: 'portrait' | 'landscape';
    } = {}
  ): Promise<void> {
    try {
      const {
        filename = `Market_Memo_${report.date.replace(/-/g, '_')}.pdf`,
        quality = 0.95,
        format = 'a4',
        orientation = 'portrait'
      } = options;

      // Show loading state
      const loadingElement = document.createElement('div');
      loadingElement.innerHTML = `
        <div style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          color: white;
          font-family: Arial, sans-serif;
        ">
          <div style="text-align: center;">
            <div style="margin-bottom: 10px;">📄</div>
            <div>Generating PDF...</div>
          </div>
        </div>
      `;
      document.body.appendChild(loadingElement);

      // Configure html2canvas options for better quality
      const canvas = await html2canvas(elementRef, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: elementRef.scrollWidth,
        height: elementRef.scrollHeight,
        scrollX: 0,
        scrollY: 0
      } as any);

      // Calculate PDF dimensions
      const imgWidth = format === 'a4' ? 210 : 216; // A4: 210mm, Letter: 216mm
      const pageHeight = format === 'a4' ? 297 : 279; // A4: 297mm, Letter: 279mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
      });

      // Add title page
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('APAC Market Memo', 20, 30);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Daily Report - ${formatDate(report.date)}`, 20, 45);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 60);
      
      // Add a line
      pdf.setLineWidth(0.5);
      pdf.line(20, 70, 190, 70);

      // Add report summary
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Report Summary', 20, 85);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      let yPosition = 95;
      
      // APAC Summary
      pdf.text(`Risk: ${report.apacComments.risk}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total P&L: ${((report.apacComments.pnlCash + report.apacComments.pnlCds) / 1000).toFixed(0)}k`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Volumes: ${report.apacComments.volumes}`, 20, yPosition);
      yPosition += 15;
      
      // Sector Summary
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sector Coverage:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      yPosition += 8;
      
      report.sectorRecaps.forEach((recap, index) => {
        const totalPnL = Object.values(recap.dailyPnL).reduce((sum, val) => sum + (val || 0), 0);
        pdf.text(`• ${recap.sector}: ${(totalPnL / 1000).toFixed(0)}k P&L`, 25, yPosition);
        yPosition += 6;
      });

      // Add new page for detailed report
      pdf.addPage();
      
      // Add the main report content
      const imgData = canvas.toDataURL('image/jpeg', quality);
      
      if (imgHeight > pageHeight) {
        // Multi-page handling
        let heightLeft = imgHeight;
        let position = 0;
        
        while (heightLeft >= 0) {
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            imgData,
            'JPEG',
            10,
            position,
            imgWidth - 20,
            imgHeight
          );
          
          heightLeft -= pageHeight;
          position -= pageHeight;
        }
      } else {
        // Single page
        pdf.addImage(
          imgData,
          'JPEG',
          10,
          10,
          imgWidth - 20,
          imgHeight
        );
      }

      // Add footer to all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Market Memo - ${formatDate(report.date)} | Page ${i} of ${pageCount} | Generated: ${new Date().toLocaleDateString()}`,
          20,
          pageHeight - 10
        );
      }

      // Save the PDF
      pdf.save(filename);

      // Remove loading element
      document.body.removeChild(loadingElement);

      console.log(`PDF exported successfully: ${filename}`);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      
      // Remove loading element if it exists
      const loadingElement = document.querySelector('[style*="position: fixed"]');
      if (loadingElement) {
        document.body.removeChild(loadingElement);
      }
      
      // Show error message
      alert('Error generating PDF. Please try again.');
      throw error;
    }
  }

  /**
   * Export with custom options for different use cases
   */
  static async exportHighQuality(elementRef: HTMLElement, report: DailyReport): Promise<void> {
    return this.exportToPDF(elementRef, report, {
      quality: 1.0,
      format: 'a4',
      orientation: 'portrait'
    });
  }

  static async exportLandscape(elementRef: HTMLElement, report: DailyReport): Promise<void> {
    return this.exportToPDF(elementRef, report, {
      quality: 0.95,
      format: 'a4',
      orientation: 'landscape'
    });
  }

  static async exportLetter(elementRef: HTMLElement, report: DailyReport): Promise<void> {
    return this.exportToPDF(elementRef, report, {
      quality: 0.95,
      format: 'letter',
      orientation: 'portrait'
    });
  }
}
