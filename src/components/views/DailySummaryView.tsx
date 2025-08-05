import React, { useState } from 'react';
import { EnhancedConsolidatedReport } from '../ConsolidatedReport';
import { DailyReport } from '../../types';

interface DailySummaryViewProps {
  report?: DailyReport;
  onExportPDF?: () => void;
  onSendEmail?: () => void;
  onPrint?: () => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  report,
  onExportPDF,
  onSendEmail,
  onPrint
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <EnhancedConsolidatedReport
      report={report}
      onExportPDF={onExportPDF}
      onSendEmail={onSendEmail}
      onPrint={onPrint}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
};
