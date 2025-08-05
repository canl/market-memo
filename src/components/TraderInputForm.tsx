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
  InputAdornment
} from '@mui/material';

import { Sector, SectorRecap, DailyPnL, TraderFormState } from '../types';
import { SECTORS, SECTOR_LABELS, SECTOR_PNL_FIELDS } from '../constants/sectors';
import { DataService } from '../services/dataService';


interface TraderInputFormProps {
  onSave?: (recap: SectorRecap) => void;
  onSubmit?: (recap: SectorRecap) => void;
}

export const TraderInputForm: React.FC<TraderInputFormProps> = ({ onSave, onSubmit }) => {
  const [formState, setFormState] = useState<TraderFormState>({
    selectedSector: 'Australia',
    marketMovesAndFlows: '',
    dailyPnL: {},
    marketCommentary: ''
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load draft data when sector changes
  useEffect(() => {
    const draft = DataService.getDraftSectorRecap(formState.selectedSector);
    if (draft) {
      setFormState({
        selectedSector: formState.selectedSector,
        marketMovesAndFlows: draft.marketMovesAndFlows,
        dailyPnL: draft.dailyPnL,
        marketCommentary: draft.marketCommentary
      });
    } else {
      // Clear form for new sector
      setFormState({
        selectedSector: formState.selectedSector,
        marketMovesAndFlows: '',
        dailyPnL: {},
        marketCommentary: ''
      });
    }
  }, [formState.selectedSector]);

  const handleSectorChange = (sector: Sector) => {
    setFormState(prev => ({ ...prev, selectedSector: sector }));
  };

  const handlePnLChange = (field: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value) * 1000; // Convert to actual value
    setFormState(prev => ({
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
    const value = formState.dailyPnL[key];
    return value !== undefined ? (value / 1000).toString() : '';
  };

  const createSectorRecap = (): SectorRecap => ({
    sector: formState.selectedSector,
    marketMovesAndFlows: formState.marketMovesAndFlows,
    dailyPnL: formState.dailyPnL,
    marketCommentary: formState.marketCommentary,
    date: new Date().toISOString().split('T')[0],
    submittedBy: 'Current User'
  });

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      const recap = createSectorRecap();
      DataService.saveDraftSectorRecap(recap);
      onSave?.(recap);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSubmit = () => {
    const recap = createSectorRecap();
    onSubmit?.(recap);
  };

  const isFormValid = formState.marketMovesAndFlows.trim() !== '' && 
                     formState.marketCommentary.trim() !== '';

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Trader Input Form
        </Typography>
        
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

        <Grid container spacing={3}>
          <Grid xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Sector</InputLabel>
              <Select
                value={formState.selectedSector}
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
              value={formState.marketMovesAndFlows}
              onChange={(e) => setFormState(prev => ({
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
              {SECTOR_PNL_FIELDS[formState.selectedSector].map(field => (
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
              value={formState.marketCommentary}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                marketCommentary: e.target.value
              }))}
              placeholder="Provide a comprehensive market commentary..."
            />
          </Grid>

          <Grid xs={12}>
            <Box display="flex" gap={2} justifyContent="flex-end">
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
                Submit Recap
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
