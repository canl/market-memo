import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Unstable_Grid2 as Grid,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';

import { APACComments, APACFormState } from '../types';
import { DataService } from '../services/dataService';
import { formatCurrency } from '../utils/formatters';

interface APACCommentsFormProps {
  onSave?: (comments: APACComments) => void;
  onSubmit?: (comments: APACComments) => void;
}

export const APACCommentsForm: React.FC<APACCommentsFormProps> = ({ onSave, onSubmit }) => {
  const [formState, setFormState] = useState<APACFormState>({
    risk: '',
    pnlCash: '',
    pnlCds: '',
    volumes: ''
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load draft data on component mount
  useEffect(() => {
    const draft = DataService.getDraftAPACComments();
    if (draft) {
      setFormState({
        risk: draft.risk,
        pnlCash: (draft.pnlCash / 1000).toString(), // Convert to display format
        pnlCds: (draft.pnlCds / 1000).toString(),
        volumes: draft.volumes
      });
    }
  }, []);

  const createAPACComments = (): APACComments => ({
    risk: formState.risk,
    pnlCash: parseFloat(formState.pnlCash || '0') * 1000, // Convert to actual value
    pnlCds: parseFloat(formState.pnlCds || '0') * 1000,
    volumes: formState.volumes,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      const comments = createAPACComments();
      DataService.saveDraftAPACComments(comments);
      onSave?.(comments);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleSubmit = () => {
    const comments = createAPACComments();
    onSubmit?.(comments);
  };

  const calculateTotalPnL = (): number => {
    const cash = parseFloat(formState.pnlCash || '0') * 1000;
    const cds = parseFloat(formState.pnlCds || '0') * 1000;
    return cash + cds;
  };

  const isFormValid = formState.risk.trim() !== '' && 
                     formState.volumes.trim() !== '' &&
                     formState.pnlCash.trim() !== '' &&
                     formState.pnlCds.trim() !== '';

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          APAC Overall Comments
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
            <TextField
              fullWidth
              label="Risk"
              value={formState.risk}
              onChange={(e) => setFormState(prev => ({
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
              value={formState.volumes}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                volumes: e.target.value
              }))}
              placeholder="e.g., 268M"
              helperText="Total trading volumes"
            />
          </Grid>

          <Grid xs={12}>
            <Typography variant="h6" gutterBottom>
              P&L Breakdown
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Cash P&L"
              value={formState.pnlCash}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                pnlCash: e.target.value
              }))}
              InputProps={{
                endAdornment: <InputAdornment position="end">k</InputAdornment>
              }}
              placeholder="0"
              helperText="Cash trading P&L in thousands"
            />
          </Grid>

          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="CDS P&L"
              value={formState.pnlCds}
              onChange={(e) => setFormState(prev => ({
                ...prev,
                pnlCds: e.target.value
              }))}
              InputProps={{
                endAdornment: <InputAdornment position="end">k</InputAdornment>
              }}
              placeholder="0"
              helperText="CDS trading P&L in thousands"
            />
          </Grid>

          <Grid xs={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300'
              }}
            >
              <Typography variant="h6" color="primary">
                Total P&L: {formatCurrency(calculateTotalPnL())}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cash: {formatCurrency(parseFloat(formState.pnlCash || '0') * 1000)},
                CDS: {formatCurrency(parseFloat(formState.pnlCds || '0') * 1000)}
              </Typography>
            </Box>
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
                Submit Comments
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
