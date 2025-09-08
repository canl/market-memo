import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  InputAdornment,
  Chip,
  Alert,

} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Sector, SectorRecap, MarketMovesAndFlowsForm } from '../types';
import { SECTOR_LABELS } from '../constants/sectors';
import { DataService } from '../services/dataService';
import { formatCurrency, parseNumericInput, formatNumericInput } from '../utils/formatters';

interface SectorInputModalProps {
  open: boolean;
  sector: Sector | null;
  onClose: () => void;
  onSave: (recap: SectorRecap) => void;
}

export const SectorInputModal: React.FC<SectorInputModalProps> = ({
  open,
  sector,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    marketMovesAndFlows: {
      lower: '',
      higher: ''
    } as MarketMovesAndFlowsForm,
    metrics: {
      pnl: '',
      risk: '',
      volumes: ''
    },
    marketCommentary: '',
    submittedBy: 'Current User'
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (sector && open) {
      // Load existing data if available (pass today's date to check InMemoryStorage)
      const today = new Date().toISOString().split('T')[0];
      const existingRecap = DataService.getDraftSectorRecap(sector, today);
      if (existingRecap) {
        setFormData({
          marketMovesAndFlows: {
            lower: formatNumericInput(existingRecap.marketMovesAndFlows.lower),
            higher: formatNumericInput(existingRecap.marketMovesAndFlows.higher)
          },
          metrics: {
            pnl: (existingRecap.metrics.pnl / 1000).toString(), // Convert back from stored value
            risk: (existingRecap.metrics.risk / 1000).toString(), // Convert back from stored value
            volumes: (existingRecap.metrics.volumes / 1000).toString() // Convert back from stored value
          },
          marketCommentary: existingRecap.marketCommentary,
          submittedBy: existingRecap.submittedBy || 'Current User'
        });
      } else {
        // Reset form for new sector
        setFormData({
          marketMovesAndFlows: {
            lower: '',
            higher: ''
          },
          metrics: { pnl: '', risk: '', volumes: '' },
          marketCommentary: '',
          submittedBy: 'Current User'
        });
      }
      setSaveStatus('idle');
    }
  }, [sector, open]);

  // Helper function to parse metric values (same as TraderInput)
  const parseMetricValue = (value: string): number => {
    if (value === '' || value === '-' || value === '+') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleSave = async () => {
    if (!sector) return;

    setSaveStatus('saving');
    try {
      const recap: SectorRecap = {
        sector,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        marketMovesAndFlows: {
          lower: parseNumericInput(formData.marketMovesAndFlows.lower),
          higher: parseNumericInput(formData.marketMovesAndFlows.higher)
        },
        metrics: {
          pnl: parseMetricValue(formData.metrics.pnl) * 1000, // Convert to actual value (k)
          risk: parseMetricValue(formData.metrics.risk) * 1000, // Convert to actual value (k)
          volumes: parseMetricValue(formData.metrics.volumes) * 1000 // Convert to actual value (M -> k for internal storage)
        },
        marketCommentary: formData.marketCommentary,
        submittedBy: formData.submittedBy
      };

      DataService.saveDraftSectorRecap(recap);
      onSave(recap);
      setSaveStatus('saved');
      
      setTimeout(() => {
        onClose();
        setSaveStatus('idle');
      }, 1000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const isFormValid = () => {
    return formData.marketMovesAndFlows.lower.trim() !== '' ||
           formData.marketMovesAndFlows.higher.trim() !== '' ||
           formData.marketCommentary.trim() !== '' ||
           formData.metrics.pnl !== '' ||
           formData.metrics.risk !== '' ||
           formData.metrics.volumes !== '';
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      if (isFormValid() && saveStatus !== 'saving') {
        handleSave();
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      onKeyDown={handleKeyDown}
      PaperProps={{
        sx: { minHeight: '70vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {sector ? SECTOR_LABELS[sector] : ''} Recap
            </Typography>
            <Chip 
              label={sector || ''} 
              size="small" 
              color="primary" 
              sx={{ mt: 1 }}
            />
          </Box>
          <Button onClick={onClose} color="inherit">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Status Messages */}
        {saveStatus === 'saved' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Sector recap saved successfully!
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error saving recap. Please try again.
          </Alert>
        )}

        {/* Single Form */}
        <Grid container spacing={3}>
          {/* Market Moves & Flows */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Market Moves & Flows
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Lower Bound"
                  type="number"
                  value={formData.marketMovesAndFlows.lower}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    marketMovesAndFlows: {
                      ...prev.marketMovesAndFlows,
                      lower: e.target.value
                    }
                  }))}
                  placeholder="0"
                  variant="outlined"
                  autoFocus
                  inputProps={{
                    step: "0.01",
                    min: undefined,
                    max: undefined
                  }}
                  helperText="Optional - accepts decimals (e.g., -2.5)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Higher Bound"
                  type="number"
                  value={formData.marketMovesAndFlows.higher}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    marketMovesAndFlows: {
                      ...prev.marketMovesAndFlows,
                      higher: e.target.value
                    }
                  }))}
                  placeholder="0"
                  variant="outlined"
                  inputProps={{
                    step: "0.01",
                    min: undefined,
                    max: undefined
                  }}
                  helperText="Optional - accepts decimals (e.g., 3.25)"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Financial Metrics */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Financial Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="P&L"
                  type="number"
                  value={formData.metrics.pnl}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metrics: { ...prev.metrics, pnl: e.target.value }
                  }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">k</InputAdornment>
                  }}
                  variant="outlined"
                />
                {formData.metrics.pnl && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formatCurrency(parseFloat(formData.metrics.pnl) || 0)}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Risk"
                  type="number"
                  value={formData.metrics.risk}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metrics: { ...prev.metrics, risk: e.target.value }
                  }))}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">k</InputAdornment>
                  }}
                  variant="outlined"
                />
                {formData.metrics.risk && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formatCurrency(parseFloat(formData.metrics.risk) || 0)}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Volume"
                  type="number"
                  value={formData.metrics.volumes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metrics: { ...prev.metrics, volumes: e.target.value }
                  }))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">M</InputAdornment>
                  }}
                  variant="outlined"
                />
                {formData.metrics.volumes && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {formatCurrency(parseFloat(formData.metrics.volumes) || 0)}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Market Commentary */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Market Commentary
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={formData.marketCommentary}
              onChange={(e) => setFormData(prev => ({ ...prev, marketCommentary: e.target.value }))}
              placeholder="Provide detailed market commentary and analysis..."
              variant="outlined"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1, alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          Press Ctrl+Enter to save quickly
        </Typography>

        <Button
          onClick={onClose}
          variant="outlined"
          disabled={saveStatus === 'saving'}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          disabled={saveStatus === 'saving' || !isFormValid()}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Recap'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
