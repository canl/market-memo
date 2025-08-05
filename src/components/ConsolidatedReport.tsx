import React, { forwardRef, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Unstable_Grid2 as Grid,
  Paper,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon
} from '@mui/icons-material';

import { DailyReport } from '../types';
import { SECTOR_LABELS } from '../constants/sectors';
import { formatDate, formatCurrency, formatPnL } from '../utils/formatters';
import { DataService } from '../services/dataService';

interface EnhancedConsolidatedReportProps {
  report?: DailyReport;
  onExportPDF?: () => void;
  onSendEmail?: () => void;
  onPrint?: () => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export const EnhancedConsolidatedReport = forwardRef<HTMLDivElement, EnhancedConsolidatedReportProps>(
  ({ report: propReport, onExportPDF, onSendEmail, onPrint, selectedDate, onDateChange }, ref) => {
    const [currentReport, setCurrentReport] = useState<DailyReport | null>(propReport || null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);

    const [internalSelectedDate, setInternalSelectedDate] = useState<string>(
      selectedDate || new Date().toISOString().split('T')[0]
    );

    useEffect(() => {
      // Get available dates from historical data
      const historicalData = DataService.getHistoricalData();
      const dates = historicalData.map(report => report.date).sort((a, b) => b.localeCompare(a));
      console.log('Available dates for consolidated report:', dates.length);
      setAvailableDates(dates);

      // If no report is provided via props, load based on selected date
      if (!propReport) {
        const foundReport = historicalData.find(r => r.date === internalSelectedDate);
        console.log('Found report for date', internalSelectedDate, ':', !!foundReport);
        setCurrentReport(foundReport || null);
      }
    }, [propReport, internalSelectedDate]);

    const handleDateChange = (newDate: string) => {
      setInternalSelectedDate(newDate);
      if (onDateChange) {
        onDateChange(newDate);
      }

      // Load report for the new date
      if (!propReport) {
        const historicalData = DataService.getHistoricalData();
        const foundReport = historicalData.find(r => r.date === newDate);
        console.log('Dynamically loading report for date:', newDate, 'Found:', !!foundReport);
        setCurrentReport(foundReport || null);
      }
    };

    const handleQuickDateSelect = (dateString: string) => {
      handleDateChange(dateString);
    };

    if (!currentReport) {
      return (
        <Box sx={{ p: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Consolidated Daily Report
              </Typography>

              <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                <Grid xs={12} md={6}>
                  <TextField
                    type="date"
                    label="Select Report Date"
                    value={internalSelectedDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value)}
                    fullWidth
                    className="date-picker-field"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                  
                  <Grid xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Quick Select</InputLabel>
                      <Select
                        value=""
                        label="Quick Select"
                        onChange={(e) => handleQuickDateSelect(e.target.value)}
                      >
                        {availableDates.slice(0, 10).map(date => (
                          <MenuItem key={date} value={date}>
                            {formatDate(date)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Alert severity="info">
                  No report found for {formatDate(internalSelectedDate)}.
                  Please select a different date or check if data exists for this date.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        );
    }

    const totalPnL = currentReport.apacComments.pnlCash + currentReport.apacComments.pnlCds;

    return (
      <Box sx={{ p: 0 }}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h5">
                Consolidated Daily Report
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={onPrint}
                  size="small"
                  startIcon={<PrintIcon />}
                >
                  Print
                </Button>
                <Button
                  variant="outlined"
                  onClick={onExportPDF}
                  size="small"
                  startIcon={<PdfIcon />}
                >
                  Export PDF
                </Button>
                <Button
                  variant="contained"
                  onClick={onSendEmail}
                  size="small"
                  startIcon={<EmailIcon />}
                >
                  Send to Desk
                </Button>
              </Stack>
            </Box>

            {/* Date Selector */}
            <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
              <Grid xs={12} md={6}>
                <TextField
                  type="date"
                  label="Report Date"
                  value={internalSelectedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value)}
                  fullWidth
                  size="small"
                  className="date-picker-field"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
                
                <Grid xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Quick Select Recent</InputLabel>
                    <Select
                      value=""
                      label="Quick Select Recent"
                      onChange={(e) => handleQuickDateSelect(e.target.value)}
                    >
                      {availableDates.slice(0, 10).map(date => (
                        <MenuItem key={date} value={date}>
                          {formatDate(date)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <div ref={ref}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        border: '1px solid #e0e0e0',
                        '@media print': {
                          boxShadow: 'none',
                          border: 'none'
                        }
                      }}
                    >
                  {/* Header */}
                  <Box textAlign="center" mb={4}>
                    <Typography variant="h4" gutterBottom>
                      APAC Market Memo
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {formatDate(currentReport.date)}
                    </Typography>
                  </Box>

                  {/* APAC Overall Comments */}
                  <Box mb={4}>
                    <Typography variant="h5" gutterBottom color="primary">
                      APAC Overall Comments
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2} mb={2}>
                      <Grid xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Risk
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {currentReport.apacComments.risk}
                        </Typography>
                      </Grid>
                      
                      <Grid xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          P&L
                        </Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="bold"
                          color={totalPnL >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(totalPnL)} 
                          <Typography component="span" variant="body2" color="text.secondary">
                            {' '}(Cash: {formatCurrency(currentReport.apacComments.pnlCash)}, 
                            CDS: {formatCurrency(currentReport.apacComments.pnlCds)})
                          </Typography>
                        </Typography>
                      </Grid>
                      
                      <Grid xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Volumes
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {currentReport.apacComments.volumes}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* APAC Market Summary */}
                    {currentReport.apacComments.marketCommentary && (
                      <Box mt={3}>
                        <Typography variant="h6" gutterBottom>
                          APAC Market Summary
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                          {currentReport.apacComments.marketCommentary}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Sector Recaps */}
                  {currentReport.sectorRecaps.map((recap, index) => (
                    <Box key={recap.sector} mb={4}>
                      <Typography variant="h5" gutterBottom color="primary">
                        {SECTOR_LABELS[recap.sector]}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={3}>
                        <Grid xs={12}>
                          <Typography variant="h6" gutterBottom>
                            Market Moves and Flows
                          </Typography>
                          <Typography variant="body1" paragraph>
                            {recap.marketMovesAndFlows || 'No market moves reported.'}
                          </Typography>
                        </Grid>
                        
                        <Grid xs={12} md={6}>
                          <Typography variant="h6" gutterBottom>
                            Daily P&L
                          </Typography>
                          <Typography variant="body1" paragraph>
                            {formatPnL(recap.dailyPnL)}
                          </Typography>
                        </Grid>
                        
                        <Grid xs={12}>
                          <Typography variant="h6" gutterBottom>
                            Market Commentary
                          </Typography>
                          <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                            {recap.marketCommentary || 'No market commentary provided.'}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {index < currentReport.sectorRecaps.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))}

                  {/* Footer */}
                  <Box 
                    mt={6} 
                    pt={3} 
                    borderTop="1px solid #e0e0e0"
                    textAlign="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Generated on {new Date().toLocaleString()} | 
                      Last modified: {new Date(currentReport.lastModified).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </div>
            </CardContent>
          </Card>
        </Box>
      );
  }
);
