import React, { useState } from 'react';
import { EnhancedConsolidatedReport } from '../ConsolidatedReport';

interface DailySummaryViewProps {
  onExportPDF?: () => void;
  onSendEmail?: () => void;
  onPrint?: () => void;
}

export const DailySummaryView: React.FC<DailySummaryViewProps> = ({
  onExportPDF,
  onSendEmail,
  onPrint
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <EnhancedConsolidatedReport
      onExportPDF={onExportPDF}
      onSendEmail={onSendEmail}
      onPrint={onPrint}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
};
