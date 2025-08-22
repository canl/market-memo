import React from 'react';
import { Box, Typography } from '@mui/material';
import { EnhancedHistoricalViewer } from '../HistoricalViewer';
import { DailyReport } from '../../types';

export const HistoricalDataView: React.FC = () => {
  const handleReportSelect = (_report: DailyReport) => {
    // Could navigate to a detailed view or open a modal
    // Future enhancement: implement report detail view
  };

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h4" gutterBottom sx={{ px: 2, pt: 1 }}>
        Historical Data
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1, px: 2 }}>
        Browse historical market recaps and data
      </Typography>

      <EnhancedHistoricalViewer onReportSelect={handleReportSelect} />
    </Box>
  );
};
