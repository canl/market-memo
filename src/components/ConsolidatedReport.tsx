import React, { forwardRef, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Unstable_Grid2 as Grid,
  Paper,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Backdrop
} from '@mui/material';
import {
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon
} from '@mui/icons-material';

import { DailyReport } from '../types';
import { SECTOR_LABELS } from '../constants/sectors';
import { formatDate, formatCurrency } from '../utils/formatters';
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
  ({ onExportPDF, onSendEmail, onPrint, selectedDate, onDateChange }, ref) => {
    const [currentReport, setCurrentReport] = useState<DailyReport | null>(null);
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true
    const [showUpdated, setShowUpdated] = useState<boolean>(false);

    const [internalSelectedDate, setInternalSelectedDate] = useState<string>(() => {
      if (selectedDate) return selectedDate;

      // Get the first available date from historical data
      const historicalData = DataService.getHistoricalData();
      if (historicalData.length > 0) {
        return historicalData[0].date; // Most recent date
      }

      return new Date().toISOString().split('T')[0];
    });

    useEffect(() => {
      setIsLoading(true);

      // Always fetch fresh data - this ensures we get the latest in-memory data for today
      const historicalData = DataService.getHistoricalData();
      const dates = historicalData.map(report => report.date).sort((a, b) => b.localeCompare(a));
      setAvailableDates(dates);

      // Load report based on selected date (prioritizes live data for today)
      const foundReport = DataService.getReportByDate(internalSelectedDate);
      setCurrentReport(foundReport);

      setIsLoading(false);
    }, [internalSelectedDate]); // Removed propReport dependency to always fetch fresh data

    const handleDateChange = (newDate: string) => {
      setIsLoading(true);
      setInternalSelectedDate(newDate);

      if (onDateChange) {
        onDateChange(newDate);
      }

      // Brief loading delay for smooth UX
      setTimeout(() => {
        // Load report for the new date - ALWAYS load when date changes
        const foundReport = DataService.getReportByDate(newDate);
        setCurrentReport(foundReport);
        setIsLoading(false);

        // Show updated indicator briefly
        setShowUpdated(true);
        setTimeout(() => setShowUpdated(false), 2000);
      }, 100); // Brief delay for smooth UX
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
                    <InputLabel>Quick Select Available Date</InputLabel>
                    <Select
                      value={internalSelectedDate}
                      label="Quick Select Available Date"
                      onChange={(e) => handleQuickDateSelect(e.target.value)}
                    >
                      {availableDates.slice(0, 10).map(date => (
                        <MenuItem key={date} value={date}>
                          {formatDate(date)} {date === availableDates[0] ? '(Latest)' : ''}
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
                  <InputLabel>Quick Select Date</InputLabel>
                  <Select
                    value={internalSelectedDate}
                    label="Quick Select Date"
                    onChange={(e) => handleQuickDateSelect(e.target.value)}
                  >
                    {availableDates.slice(0, 10).map(date => (
                      <MenuItem key={date} value={date}>
                        {formatDate(date)} {date === availableDates[0] ? '(Latest)' : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <div ref={ref}>
              <Paper
                key={currentReport.date} // Force re-render when date changes
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  '@media print': {
                    boxShadow: 'none',
                    border: 'none',
                    p: 2
                  }
                }}
              >
                {/* Loading Overlay */}
                {isLoading && (
                  <Backdrop
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      zIndex: 1,
                      borderRadius: 2
                    }}
                    open={isLoading}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                        Loading report data...
                      </Typography>
                    </Box>
                  </Backdrop>
                )}
                {/* Professional Header */}
                <Box
                  sx={{
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    pb: 2,
                    mb: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      APAC Credit Market Daily
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
                      Daily Trading Summary & Market Commentary
                    </Typography>
                  </Box>
                  <Box textAlign="right" sx={{ position: 'relative' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {formatDate(currentReport.date)}
                      {showUpdated && (
                        <Typography
                          component="span"
                          variant="caption"
                          sx={{
                            ml: 1,
                            px: 1,
                            py: 0.5,
                            backgroundColor: 'success.main',
                            color: 'white',
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            animation: 'fadeInOut 2s ease-in-out'
                          }}
                        >
                          UPDATED
                        </Typography>
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Generated: {new Date().toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="primary.main"
                  sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
                >
                  📰 APAC OVERALL SUMMARY
                </Typography>

                {/* Executive Summary - APAC Overview */}
                <Box
                  sx={{
                    mb: 3,
                    p: 2.5,
                    backgroundColor: 'action.hover',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >


                  {/* Key Metrics Row */}
                  <Grid container spacing={3} sx={{ mb: 2 }}>
                    <Grid xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          OVERALL P&L
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={(currentReport.apacComments.pnl || 0) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(currentReport.apacComments.pnl || 0)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          RISK
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(currentReport.apacComments.risk)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid xs={12} sm={3}>
                      <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          VOLUMES
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(currentReport.apacComments.volumes)}
                        </Typography>
                      </Box>
                    </Grid>


                  </Grid>

                  {/* Market Moves Summary */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                      Market Moves and Flows
                    </Typography>
                    <Typography variant="body2" sx={{
                      fontStyle: 'italic',
                      p: 1.5,
                      backgroundColor: 'background.paper',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}>
                      {currentReport.apacComments.marketCommentary}
                    </Typography>
                  </Box>
                </Box>

                {/* Sector Breakdown */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="primary.main"
                    sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
                  >
                    🏦 SECTOR BREAKDOWN
                  </Typography>

                  {currentReport.sectorRecaps.map((recap) => (
                    <Card
                      key={recap.sector}
                      sx={{
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          boxShadow: 2
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        {/* Sector Header */}
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 2,
                          pb: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {SECTOR_LABELS[recap.sector]}
                          </Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Total P&L
                            </Typography>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color={(recap.metrics?.pnl || 0) >= 0 ? 'success.main' : 'error.main'}
                            >
                              {formatCurrency(recap.metrics?.pnl || 0)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Metrics */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">P&L</Typography>
                              <Typography variant="body2" fontWeight="bold" color={(recap.metrics?.pnl || 0) >= 0 ? 'success.main' : 'error.main'}>
                                {formatCurrency(recap.metrics?.pnl || 0)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">Risk</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(recap.metrics?.risk || 0)}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">Volumes</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(recap.metrics?.volumes || 0)}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Market Moves */}
                        {recap.marketMovesAndFlows && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                              Market Moves and Flows
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {recap.marketMovesAndFlows}
                            </Typography>
                          </Box>
                        )}

                        {/* Market Commentary */}
                        {recap.marketCommentary && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                              Market Commentary
                            </Typography>
                            <Typography variant="body2" sx={{ textAlign: 'justify', lineHeight: 1.6 }}>
                              {recap.marketCommentary}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>

                {/* Professional Footer */}
                <Box
                  sx={{
                    mt: 4,
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Generated: {new Date().toLocaleString()} |
                    Report Date: {formatDate(currentReport.date)}
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
