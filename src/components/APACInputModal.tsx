import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { APACComments } from '../types';
import { DataService } from '../services/dataService';
import { RichTextEditor } from './RichTextEditor';

interface APACInputModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (comments: APACComments) => void;
}

export const APACInputModal: React.FC<APACInputModalProps> = ({
  open,
  onClose,
  onSave
}) => {
  const [marketCommentary, setMarketCommentary] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (open) {
      // Load existing APAC commentary if available (same as TraderInput)
      const today = new Date().toISOString().split('T')[0];
      const draft = DataService.getDraftAPACComments(today);
      setMarketCommentary(draft?.marketCommentary || '');
      setSaveStatus('idle');
    }
  }, [open]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const today = new Date().toISOString().split('T')[0];

      // Calculate aggregated metrics from all sectors (same as TraderInput)
      const todaysReport = DataService.getReportByDate(today);
      const aggregatedMetrics = todaysReport?.sectorRecaps.reduce((acc, recap) => ({
        pnl: acc.pnl + (recap.metrics?.pnl || 0),
        risk: acc.risk + (recap.metrics?.risk || 0),
        volumes: acc.volumes + (recap.metrics?.volumes || 0)
      }), { pnl: 0, risk: 0, volumes: 0 }) || { pnl: 0, risk: 0, volumes: 0 };

      const comments: APACComments = {
        date: today,
        pnl: aggregatedMetrics.pnl,
        risk: aggregatedMetrics.risk,
        volumes: aggregatedMetrics.volumes,
        marketCommentary: marketCommentary
      };

      // Save using the same method as TraderInput
      DataService.saveDraftAPACComments(comments);
      onSave(comments);
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
    return marketCommentary.trim() !== '';
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
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              APAC Market Summary
            </Typography>
            <Chip
              label="Regional Commentary"
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
            APAC market summary saved successfully!
          </Alert>
        )}

        {saveStatus === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error saving APAC market summary. Please try again.
          </Alert>
        )}

        {/* APAC Market Summary Input */}
        <Box>
          <Typography variant="h6" gutterBottom>
            APAC Market Summary
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Provide high-level commentary on APAC market conditions, key themes, and overall regional outlook.
            Financial metrics (P&L, Risk, Volume) are automatically aggregated from sector inputs.
          </Typography>

          <RichTextEditor
            value={marketCommentary}
            onChange={setMarketCommentary}
            placeholder="Enter APAC regional market commentary and analysis...

Examples:
• Overall market sentiment and direction
• Key regional themes and trends
• Cross-sector insights and correlations
• Major market drivers and events
• Regional outlook and expectations"
            height={250}
          />
        </Box>
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
          {saveStatus === 'saving' ? 'Saving...' : 'Save Market Summary'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
