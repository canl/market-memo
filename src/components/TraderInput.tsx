import React, { useState, useEffect } from 'react';
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
  ToggleButton,
  ToggleButtonGroup,
  Paper
} from '@mui/material';

import { Sector, SectorRecap, DailyPnL, TraderFormState, APACComments, InputMode } from '../types';
import { SECTORS, SECTOR_LABELS, SECTOR_PNL_FIELDS } from '../constants/sectors';
import { DataService } from '../services/dataService';
import { formatCurrency } from '../utils/formatters';
import { AggregationService } from '../services/aggregationService';

interface EnhancedTraderInputProps {
  onSave?: (recap: SectorRecap) => void;
  onSubmit?: (recap: SectorRecap) => void;
  onAPACSave?: (comments: APACComments) => void;
  onAPACSubmit?: (comments: APACComments) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const EnhancedTraderInput: React.FC<EnhancedTraderInputProps> = ({
  onSave,
  onSubmit,
  onAPACSave,
  onAPACSubmit,
  selectedDate,
  onDateChange
}) => {
  const [inputMode, setInputMode] = useState<InputMode>('sector');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Sector input state
  const [sectorFormState, setSectorFormState] = useState<TraderFormState>({
    selectedSector: 'Australia',
    marketMovesAndFlows: '',
    dailyPnL: {},
    marketCommentary: ''
  });

  // APAC input state
  const [apacFormState, setApacFormState] = useState({
    risk: '',
    volumes: '',
    marketCommentary: ''
  });

  // Real-time P&L aggregation
  const [aggregatedPnL, setAggregatedPnL] = useState({ cash: 0, cds: 0, total: 0 });

  // Load draft data when date or mode changes
  useEffect(() => {
    if (inputMode === 'sector') {
      const draft = DataService.getDraftSectorRecap(sectorFormState.selectedSector);
      if (draft && draft.date === selectedDate) {
        setSectorFormState({
          selectedSector: sectorFormState.selectedSector,
          marketMovesAndFlows: draft.marketMovesAndFlows,
          dailyPnL: draft.dailyPnL,
          marketCommentary: draft.marketCommentary || (draft as any).marketSummary || ''
        });
      }
    } else {
      const draft = DataService.getDraftAPACComments();
      if (draft && draft.date === selectedDate) {
        setApacFormState({
          risk: draft.risk,
          volumes: draft.volumes,
          marketCommentary: draft.marketCommentary || (draft as any).marketSummary || ''
        });
      }
    }
  }, [inputMode, selectedDate, sectorFormState.selectedSector]);

  // Update aggregated P&L when date changes or in APAC mode
  useEffect(() => {
    if (inputMode === 'apac') {
      const pnlData = AggregationService.calculateAPACPnL(selectedDate);
      setAggregatedPnL(pnlData);
    }
  }, [inputMode, selectedDate]);

  const handleInputModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: InputMode | null,
  ) => {
    if (newMode !== null) {
      setInputMode(newMode);
    }
  };

  const handleSectorChange = (sector: Sector) => {
    setSectorFormState(prev => ({ ...prev, selectedSector: sector }));
  };

  const handlePnLChange = (field: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value) * 1000;
    setSectorFormState(prev => ({
      ...prev,
      dailyPnL: {
        ...prev.dailyPnL,
        [getPnLFieldKey(field)]: numValue
      }
    }));
  };

  const getPnLFieldKey = (field: string): keyof DailyPnL => {
    switch (field) {
      case 'USD Bonds': return 'usdBonds';
      case 'AUD Bonds': return 'localBonds';
      case 'JPY Bonds': return 'jpyBonds';
      case 'CNY Bonds': return 'cnyBonds';
      case 'MYR Bonds': return 'myrBonds';
      case 'INR Bonds': return 'inrBonds';
      case 'CDS': return 'cds';
      default: return 'usdBonds';
    }
  };

  const getPnLValue = (field: string): string => {
    const key = getPnLFieldKey(field);
    const value = sectorFormState.dailyPnL[key];
    return value !== undefined ? (value / 1000).toString() : '';
  };

  const createSectorRecap = (): SectorRecap => ({
    sector: sectorFormState.selectedSector,
    marketMovesAndFlows: sectorFormState.marketMovesAndFlows,
    dailyPnL: sectorFormState.dailyPnL,
    marketCommentary: sectorFormState.marketCommentary,
    date: selectedDate,
    submittedBy: 'Current User'
  });

  const createAPACComments = (): APACComments => ({
    risk: apacFormState.risk,
    pnlCash: aggregatedPnL.cash,
    pnlCds: aggregatedPnL.cds,
    volumes: apacFormState.volumes,
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
      } else {
        const comments = createAPACComments();
        DataService.saveDraftAPACComments(comments);
        onAPACSave?.(comments);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSubmit = () => {
    if (inputMode === 'sector') {
      const recap = createSectorRecap();
      onSubmit?.(recap);
    } else {
      const comments = createAPACComments();
      onAPACSubmit?.(comments);
    }
  };

  const isSectorFormValid = (sectorFormState.marketMovesAndFlows || '').trim() !== '' &&
                           (sectorFormState.marketCommentary || '').trim() !== '';

  const isAPACFormValid = (apacFormState.risk || '').trim() !== '' &&
                         (apacFormState.volumes || '').trim() !== '' &&
                         (apacFormState.marketCommentary || '').trim() !== '';

  const isFormValid = inputMode === 'sector' ? isSectorFormValid : isAPACFormValid;

  return (
    <Box sx={{ p: 0 }}>
      {/* Header with Date Picker and Mode Toggle */}
      <Paper sx={{ p: 2, mb: 1, backgroundColor: 'grey.50' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} md={4}>
            <TextField
              type="date"
              label="Trading Date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
            
            <Grid xs={12} md={8}>
              <Box display="flex" justifyContent="center">
                <ToggleButtonGroup
                  value={inputMode}
                  exclusive
                  onChange={handleInputModeChange}
                  aria-label="input mode"
                  size="large"
                >
                  <ToggleButton value="sector" aria-label="sector input">
                    <Box textAlign="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        📝 Sector Input
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Individual sector recaps
                      </Typography>
                    </Box>
                  </ToggleButton>
                  <ToggleButton value="apac" aria-label="apac input">
                    <Box textAlign="center">
                      <Typography variant="subtitle1" fontWeight={600}>
                        🌏 APAC Overall
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Consolidated comments
                      </Typography>
                    </Box>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
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

        {/* Input Forms */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              {inputMode === 'sector' ? 'Sector Input Form' : 'APAC Overall Comments'}
            </Typography>
            
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
                    label="Market Movers and Flows"
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
                    Daily P&L
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {SECTOR_PNL_FIELDS[sectorFormState.selectedSector].map(field => (
                      <Grid xs={12} sm={6} md={4} key={field}>
                        <TextField
                          fullWidth
                          type="number"
                          label={field}
                          value={getPnLValue(field)}
                          onChange={(e) => handlePnLChange(field, e.target.value)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">k</InputAdornment>
                          }}
                          placeholder="0"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                <Grid xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Market Commentary"
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
                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Risk"
                    value={apacFormState.risk}
                    onChange={(e) => setApacFormState(prev => ({ 
                      ...prev, 
                      risk: e.target.value 
                    }))}
                    placeholder="e.g., 82k (-24k)"
                    helperText="Enter risk exposure with change from previous day"
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Volumes"
                    value={apacFormState.volumes}
                    onChange={(e) => setApacFormState(prev => ({ 
                      ...prev, 
                      volumes: e.target.value 
                    }))}
                    placeholder="e.g., 268M"
                    helperText="Total trading volumes"
                  />
                </Grid>

                <Grid xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Auto-calculated P&L Breakdown
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300' }}>
                    <Grid container spacing={2}>
                      <Grid xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Cash P&L
                        </Typography>
                        <Typography variant="h6" color={aggregatedPnL.cash >= 0 ? 'success.main' : 'error.main'}>
                          {formatCurrency(aggregatedPnL.cash)}
                        </Typography>
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          CDS P&L
                        </Typography>
                        <Typography variant="h6" color={aggregatedPnL.cds >= 0 ? 'success.main' : 'error.main'}>
                          {formatCurrency(aggregatedPnL.cds)}
                        </Typography>
                      </Grid>
                      <Grid xs={12} sm={4}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total P&L
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color={aggregatedPnL.total >= 0 ? 'success.main' : 'error.main'}>
                          {formatCurrency(aggregatedPnL.total)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
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
                variant="outlined"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                Submit {inputMode === 'sector' ? 'Recap' : 'Comments'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
};
