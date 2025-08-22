import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Unstable_Grid2 as Grid,
  Divider,
  Alert,
  InputAdornment,
  Paper,
  Tabs,
  Tab
} from '@mui/material';

import { Sector, SectorRecap, TraderFormState, APACComments, InputMode, SectorMetrics } from '../types';
import { SECTORS, SECTOR_LABELS } from '../constants/sectors';
import { DataService, InMemoryStorage } from '../services/dataService';

// Constants
const SAVE_STATUS_TIMEOUT = {
  SUCCESS: 2000,
  ERROR: 3000
} as const;

const INITIAL_SECTOR_FORM_STATE: TraderFormState = {
  selectedSector: 'Australia IG',
  marketMovesAndFlows: '',
  metrics: {
    pnl: '',
    risk: '',
    volumes: ''
  },
  marketCommentary: ''
};

const INITIAL_APAC_FORM_STATE = {
  marketCommentary: ''
};

// Helper functions for metrics
const parseMetricValue = (value: string): number => {
  if (value === '' || value === '-' || value === '+') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Convert form metrics to final metrics
const convertFormMetricsToMetrics = (formMetrics: { pnl: string; risk: string; volumes: string }): SectorMetrics => ({
  pnl: parseMetricValue(formMetrics.pnl) * 1000, // Convert to actual value (k)
  risk: parseMetricValue(formMetrics.risk) * 1000, // Convert to actual value (k)
  volumes: parseMetricValue(formMetrics.volumes) * 1000 // Convert to actual value (M -> k for internal storage)
});

// Calculate aggregated metrics from in-memory sector data only
const calculateAggregatedMetrics = (selectedDate: string) => {
  // Only aggregate from in-memory data for today's date
  if (!InMemoryStorage.isTodaysDate(selectedDate)) {
    return { pnl: 0, risk: 0, volumes: 0 };
  }

  const sectorRecaps = InMemoryStorage.getAllSectorRecaps();

  if (sectorRecaps.length === 0) {
    return { pnl: 0, risk: 0, volumes: 0 };
  }

  return sectorRecaps.reduce(
    (totals, recap) => ({
      pnl: totals.pnl + (recap.metrics?.pnl || 0),
      risk: totals.risk + (recap.metrics?.risk || 0),
      volumes: totals.volumes + (recap.metrics?.volumes || 0)
    }),
    { pnl: 0, risk: 0, volumes: 0 }
  );
};

const validateSectorForm = (formState: TraderFormState): boolean => {
  // Only require metrics (P&L, Risk, Volumes) - text fields are optional
  const hasValidMetrics = (formState.metrics.pnl || '').trim() !== '' &&
                         (formState.metrics.risk || '').trim() !== '' &&
                         (formState.metrics.volumes || '').trim() !== '';

  return hasValidMetrics;
};

const validateAPACForm = (formState: { marketCommentary: string }): boolean => {
  return (formState.marketCommentary || '').trim() !== '';
};

interface EnhancedTraderInputProps {
  onSave?: (recap: SectorRecap) => void;
  onAPACSave?: (comments: APACComments) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const EnhancedTraderInput: React.FC<EnhancedTraderInputProps> = ({
  onSave,
  onAPACSave,
  selectedDate,
  onDateChange
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('sector');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Sector input state
  const [sectorFormState, setSectorFormState] = useState<TraderFormState>(INITIAL_SECTOR_FORM_STATE);

  // APAC input state
  const [apacFormState, setApacFormState] = useState(INITIAL_APAC_FORM_STATE);

  // Aggregated metrics from all sectors
  const [aggregatedMetrics, setAggregatedMetrics] = useState({ pnl: 0, risk: 0, volumes: 0 });

  // Handle sector change with smart form behavior
  const handleSectorChange = useCallback((sector: Sector) => {
    // Check if there's saved data for the selected sector
    const draft = DataService.getDraftSectorRecap(sector, selectedDate);

    if (draft && draft.date === selectedDate) {
      // Restore previously entered data for this sector
      setSectorFormState({
        selectedSector: sector,
        marketMovesAndFlows: draft.marketMovesAndFlows,
        metrics: {
          pnl: draft.metrics ? (draft.metrics.pnl / 1000).toString() : '',
          risk: draft.metrics ? (draft.metrics.risk / 1000).toString() : '',
          volumes: draft.metrics ? (draft.metrics.volumes / 1000).toString() : ''
        },
        marketCommentary: draft.marketCommentary || ''
      });
    } else {
      // Clear form for new sector (no previous data)
      setSectorFormState({
        selectedSector: sector,
        marketMovesAndFlows: '',
        metrics: {
          pnl: '',
          risk: '',
          volumes: ''
        },
        marketCommentary: ''
      });
    }
  }, [selectedDate]);

  // Load draft data when date or mode changes
  useEffect(() => {
    if (inputMode === 'sector') {
      // Sector data loading is now handled by handleSectorChange
      // Just trigger a sector change to load data for current sector
      handleSectorChange(sectorFormState.selectedSector);
    } else {
      const draft = DataService.getDraftAPACComments(selectedDate);
      if (draft && draft.date === selectedDate) {
        setApacFormState({
          marketCommentary: draft.marketCommentary || ''
        });
      }
    }
  }, [inputMode, selectedDate, handleSectorChange, sectorFormState.selectedSector]);

  // Update aggregated metrics when date changes or in APAC mode
  useEffect(() => {
    if (inputMode === 'apac') {
      const metrics = calculateAggregatedMetrics(selectedDate);
      setAggregatedMetrics(metrics);
    }
  }, [inputMode, selectedDate]);

  const handleInputModeChange = (
    _event: React.SyntheticEvent,
    newMode: InputMode,
  ) => {
    setInputMode(newMode);
  };



  const handleMetricChange = (metric: 'pnl' | 'risk' | 'volumes', value: string) => {
    // Allow negative numbers, decimals, and partial input
    if (value === '' || value === '-' || value === '+' || /^[+-]?\d*\.?\d*$/.test(value)) {
      setSectorFormState(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metric]: value
        }
      }));
    }
  };

  const createSectorRecap = (): SectorRecap => ({
    sector: sectorFormState.selectedSector,
    marketMovesAndFlows: sectorFormState.marketMovesAndFlows,
    metrics: convertFormMetricsToMetrics(sectorFormState.metrics),
    marketCommentary: sectorFormState.marketCommentary,
    date: selectedDate,
    submittedBy: 'Current User'
  });

  const createAPACComments = (): APACComments => ({
    pnl: aggregatedMetrics.pnl,
    risk: aggregatedMetrics.risk,
    volumes: aggregatedMetrics.volumes,
    marketCommentary: apacFormState.marketCommentary,
    date: selectedDate
  });

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      if (inputMode === 'sector') {
        const recap = createSectorRecap();
        DataService.saveDraftSectorRecap(recap);
        onSave?.(recap);

        // Refresh aggregated metrics after saving sector data
        if (InMemoryStorage.isTodaysDate(selectedDate)) {
          const updatedMetrics = calculateAggregatedMetrics(selectedDate);
          setAggregatedMetrics(updatedMetrics);
        }
      } else {
        const comments = createAPACComments();
        DataService.saveDraftAPACComments(comments);
        onAPACSave?.(comments);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), SAVE_STATUS_TIMEOUT.SUCCESS);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), SAVE_STATUS_TIMEOUT.ERROR);
    }
  };

  const isFormValid = inputMode === 'sector'
    ? validateSectorForm(sectorFormState)
    : validateAPACForm(apacFormState);

  return (
    <Box sx={{ p: 0 }}>
      {/* Header with Title and Date Picker */}
      <Paper sx={{ p: 2, mb: 1 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Market Input
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} md={4}>
            <TextField
              type="date"
              label="Trading Date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              fullWidth
              variant="outlined"
              className="date-picker-field"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

        {/* Status Messages */}
        {saveStatus === 'saved' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Draft saved successfully!
          </Alert>
        )}
        
        {saveStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error saving draft. Please try again.
          </Alert>
        )}

        {/* Input Forms with Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={inputMode}
              onChange={handleInputModeChange}
              aria-label="input mode tabs"
              sx={{ px: 2 }}
            >
              <Tab
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Sector Input
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Individual sector recaps
                    </Typography>
                  </Box>
                }
                value="sector"
              />
              <Tab
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      APAC Overall
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Consolidated comments
                    </Typography>
                  </Box>
                }
                value="apac"
              />
            </Tabs>
          </Box>
          <CardContent>
            
            {inputMode === 'sector' ? (
              // Sector Input Form (existing logic)
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sector</InputLabel>
                    <Select
                      value={sectorFormState.selectedSector}
                      label="Sector"
                      onChange={(e) => handleSectorChange(e.target.value as Sector)}
                    >
                      {SECTORS.map(sector => (
                        <MenuItem key={sector} value={sector}>
                          {SECTOR_LABELS[sector]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Market Movers and Flows (Optional)"
                    value={sectorFormState.marketMovesAndFlows}
                    onChange={(e) => setSectorFormState(prev => ({ 
                      ...prev, 
                      marketMovesAndFlows: e.target.value 
                    }))}
                    placeholder="Describe key market movements and flow patterns..."
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Metrics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="P&L"
                        value={sectorFormState.metrics.pnl}
                        onChange={(e) => handleMetricChange('pnl', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">k</InputAdornment>
                        }}
                        placeholder="Enter P&L (e.g., 150 or -75)"
                        helperText="Positive or negative values in thousands"
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Risk"
                        value={sectorFormState.metrics.risk}
                        onChange={(e) => handleMetricChange('risk', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">k</InputAdornment>
                        }}
                        placeholder="Enter risk (e.g., 82)"
                        helperText="Risk exposure in thousands"
                      />
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Volumes"
                        value={sectorFormState.metrics.volumes}
                        onChange={(e) => handleMetricChange('volumes', e.target.value)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">M</InputAdornment>
                        }}
                        placeholder="Enter volumes (e.g., 268)"
                        helperText="Trading volumes in millions"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Market Commentary (Optional)"
                    value={sectorFormState.marketCommentary}
                    onChange={(e) => setSectorFormState(prev => ({ 
                      ...prev, 
                      marketCommentary: e.target.value 
                    }))}
                    placeholder="Provide a comprehensive market summary..."
                  />
                </Grid>
              </Grid>
            ) : (
              // APAC Overall Input Form
              <Grid container spacing={3}>
                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom>
                    APAC Overall Metrics (Auto-Aggregated)
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          TOTAL P&L
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" color={aggregatedMetrics.pnl >= 0 ? 'success.main' : 'error.main'}>
                          {(aggregatedMetrics.pnl / 1000).toFixed(0)}k
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Auto-calculated from sectors
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          TOTAL RISK
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {(aggregatedMetrics.risk / 1000).toFixed(0)}k
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Auto-calculated from sectors
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                          TOTAL VOLUMES
                        </Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {(aggregatedMetrics.volumes / 1000).toFixed(0)}M
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Auto-calculated from sectors
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="APAC Market Summary"
                    value={apacFormState.marketCommentary}
                    onChange={(e) => setApacFormState(prev => ({
                      ...prev,
                      marketCommentary: e.target.value
                    }))}
                    placeholder="Provide overall APAC market commentary and key themes..."
                    helperText="This summary will be visible to all traders and can be edited by anyone"
                  />
                </Grid>
              </Grid>
            )}

            {/* Action Buttons */}
            <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saveStatus === 'saving' || !isFormValid}
              >
                {saveStatus === 'saving' ? 'Submitting...' : `Submit ${inputMode === 'sector' ? 'Recap' : 'Comments'}`}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
};
