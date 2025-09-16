import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Card,
} from '@mui/material';
import {
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  Sector, 
  SectorRecap, 
  MarketMovesAndFlowsForm,
  IGOnlyMarketMovesForm,
  IGAndHYMarketMovesForm,
  IGOnlyMetricsForm,
  IGAndHYMetricsForm,
  IGOnlyMarketMoves,
  IGAndHYMarketMoves,
  IGOnlyMetrics,
  IGAndHYMetrics
} from '../types';
import { 
  SECTOR_LABELS, 
  getSectorModelType, 
  getSectorCategory
} from '../constants/sectors';
import { DataService } from '../services/dataService';
import { formatCurrency, parseNumericInput, formatNumericInput } from '../utils/formatters';
import { RichTextEditor } from './RichTextEditor';

interface SectorInputModalProps {
  open: boolean;
  sector: Sector | null;
  selectedDate: string;
  onClose: () => void;
  onSave: (recap: SectorRecap) => void;
}

export const SectorInputModal: React.FC<SectorInputModalProps> = ({
  open,
  sector,
  selectedDate,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<{
    marketMovesAndFlows: MarketMovesAndFlowsForm;
    metrics: IGOnlyMetricsForm | IGAndHYMetricsForm;
    marketCommentary: string;
    submittedBy: string;
  }>({
    marketMovesAndFlows: {
      ig: { lower: '', higher: '' },
      hy: { lower: '', higher: '' }
    } as IGAndHYMarketMovesForm,
    metrics: {
      ig: { pnl: '0', risk: '0', volumes: '0' },
      hy: { pnl: '0', risk: '0', volumes: '0' },
      lct: { pnl: '0', risk: '0', volumes: '0' },
      cds: { pnl: '0', risk: '0', volumes: '0' }
    } as IGAndHYMetricsForm,
    marketCommentary: '',
    submittedBy: 'Current User'
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');


  // Initialize form data based on sector model type
  const initializeFormData = (sector: Sector) => {
    const modelType = getSectorModelType(sector);
    
    if (modelType === 'IG Only') {
      return {
        marketMovesAndFlows: {
          ig: { lower: '', higher: '' }
        } as IGOnlyMarketMovesForm,
        metrics: {
          ig: { pnl: '0', risk: '0', volumes: '0' }
        } as IGOnlyMetricsForm,
        marketCommentary: '',
        submittedBy: 'Current User'
      };
    } else {
      return {
        marketMovesAndFlows: {
          ig: { lower: '', higher: '' },
          hy: { lower: '', higher: '' }
        } as IGAndHYMarketMovesForm,
        metrics: {
          ig: { pnl: '0', risk: '0', volumes: '0' },
          hy: { pnl: '0', risk: '0', volumes: '0' },
          lct: { pnl: '0', risk: '0', volumes: '0' },
          cds: { pnl: '0', risk: '0', volumes: '0' }
        } as IGAndHYMetricsForm,
        marketCommentary: '',
        submittedBy: 'Current User'
      };
    }
  };

  useEffect(() => {
    if (sector && open) {
      // Load existing data if available using the selected date
      const existingRecap = DataService.getDraftSectorRecap(sector, selectedDate);
      
      if (existingRecap) {
        // Convert existing data to form format
        const modelType = getSectorModelType(sector);
        
        if (modelType === 'IG Only') {
          const igMarketMoves = existingRecap.marketMovesAndFlows as IGOnlyMarketMoves;
          const igMetrics = existingRecap.metrics as IGOnlyMetrics;
          
          setFormData({
            marketMovesAndFlows: {
              ig: {
                lower: formatNumericInput(igMarketMoves.ig.lower || 0),
                higher: formatNumericInput(igMarketMoves.ig.higher || 0)
              }
            } as IGOnlyMarketMovesForm,
            metrics: {
              ig: {
                pnl: (igMetrics.ig.pnl / 1000).toString(),
                risk: (igMetrics.ig.risk / 1000).toString(),
                volumes: (igMetrics.ig.volumes / 1000).toString()
              }
            } as IGOnlyMetricsForm,
            marketCommentary: existingRecap.marketCommentary || '',
            submittedBy: existingRecap.submittedBy || 'Current User'
          });
        } else {
          const igHyMarketMoves = existingRecap.marketMovesAndFlows as IGAndHYMarketMoves;
          const igHyMetrics = existingRecap.metrics as IGAndHYMetrics;
          
          setFormData({
            marketMovesAndFlows: {
              ig: {
                lower: formatNumericInput(igHyMarketMoves.ig.lower || 0),
                higher: formatNumericInput(igHyMarketMoves.ig.higher || 0)
              },
              hy: {
                lower: formatNumericInput(igHyMarketMoves.hy.lower || 0),
                higher: formatNumericInput(igHyMarketMoves.hy.higher || 0)
              }
            } as IGAndHYMarketMovesForm,
            metrics: {
              ig: {
                pnl: (igHyMetrics.ig.pnl / 1000).toString(),
                risk: (igHyMetrics.ig.risk / 1000).toString(),
                volumes: (igHyMetrics.ig.volumes / 1000).toString()
              },
              hy: {
                pnl: (igHyMetrics.hy.pnl / 1000).toString(),
                risk: (igHyMetrics.hy.risk / 1000).toString(),
                volumes: (igHyMetrics.hy.volumes / 1000).toString()
              },
              lct: {
                pnl: (igHyMetrics.lct.pnl / 1000).toString(),
                risk: (igHyMetrics.lct.risk / 1000).toString(),
                volumes: (igHyMetrics.lct.volumes / 1000).toString()
              },
              cds: {
                pnl: (igHyMetrics.cds.pnl / 1000).toString(),
                risk: (igHyMetrics.cds.risk / 1000).toString(),
                volumes: (igHyMetrics.cds.volumes / 1000).toString()
              }
            } as IGAndHYMetricsForm,
            marketCommentary: existingRecap.marketCommentary || '',
            submittedBy: existingRecap.submittedBy || 'Current User'
          });
        }
      } else {
        // Reset form for new sector
        setFormData(initializeFormData(sector));
      }
      setSaveStatus('idle');
    }
  }, [sector, open, selectedDate]);

  // Helper function to parse metric values
  const parseMetricValue = useCallback((value: string): number => {
    if (value === '' || value === '-' || value === '+') return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }, []);

  const handleSave = async () => {
    if (!sector) return;

    setSaveStatus('saving');
    try {
      const modelType = getSectorModelType(sector);
      
      let marketMovesAndFlows: IGOnlyMarketMoves | IGAndHYMarketMoves;
      let metrics: IGOnlyMetrics | IGAndHYMetrics;

      if (modelType === 'IG Only') {
        const igForm = formData.marketMovesAndFlows as IGOnlyMarketMovesForm;
        const igMetricsForm = formData.metrics as IGOnlyMetricsForm;
        
        marketMovesAndFlows = {
          ig: {
            lower: parseNumericInput(igForm?.ig?.lower || ''),
            higher: parseNumericInput(igForm?.ig?.higher || '')
          }
        };
        
        metrics = {
          ig: {
            pnl: parseMetricValue(igMetricsForm?.ig?.pnl || '0') * 1000,
            risk: parseMetricValue(igMetricsForm?.ig?.risk || '0') * 1000,
            volumes: parseMetricValue(igMetricsForm?.ig?.volumes || '0') * 1000
          }
        };
      } else {
        const igHyForm = formData.marketMovesAndFlows as IGAndHYMarketMovesForm;
        const igHyMetricsForm = formData.metrics as IGAndHYMetricsForm;
        
        marketMovesAndFlows = {
          ig: {
            lower: parseNumericInput(igHyForm?.ig?.lower || ''),
            higher: parseNumericInput(igHyForm?.ig?.higher || '')
          },
          hy: {
            lower: parseNumericInput(igHyForm?.hy?.lower || ''),
            higher: parseNumericInput(igHyForm?.hy?.higher || '')
          }
        };
        
        metrics = {
          ig: {
            pnl: parseMetricValue(igHyMetricsForm?.ig?.pnl || '0') * 1000,
            risk: parseMetricValue(igHyMetricsForm?.ig?.risk || '0') * 1000,
            volumes: parseMetricValue(igHyMetricsForm?.ig?.volumes || '0') * 1000
          },
          hy: {
            pnl: parseMetricValue(igHyMetricsForm?.hy?.pnl || '0') * 1000,
            risk: parseMetricValue(igHyMetricsForm?.hy?.risk || '0') * 1000,
            volumes: parseMetricValue(igHyMetricsForm?.hy?.volumes || '0') * 1000
          },
          lct: {
            pnl: parseMetricValue(igHyMetricsForm?.lct?.pnl || '0') * 1000,
            risk: parseMetricValue(igHyMetricsForm?.lct?.risk || '0') * 1000,
            volumes: parseMetricValue(igHyMetricsForm?.lct?.volumes || '0') * 1000
          },
          cds: {
            pnl: parseMetricValue(igHyMetricsForm?.cds?.pnl || '0') * 1000,
            risk: parseMetricValue(igHyMetricsForm?.cds?.risk || '0') * 1000,
            volumes: parseMetricValue(igHyMetricsForm?.cds?.volumes || '0') * 1000
          }
        };
      }

      const recap: SectorRecap = {
        sector,
        date: new Date().toISOString().split('T')[0],
        marketMovesAndFlows,
        metrics,
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

  const isFormValid = useMemo(() => {
    if (!sector) return false;
    
    const modelType = getSectorModelType(sector);
    
    if (modelType === 'IG Only') {
      // For IG Only, only PNL is required
      const igMetricsForm = formData.metrics as IGOnlyMetricsForm;
      const pnlValue = igMetricsForm?.ig?.pnl?.trim() || '';
      return pnlValue !== '' && pnlValue !== '0';
    } else {
      // For IG & HY, only IG PNL is required
      const igHyMetricsForm = formData.metrics as IGAndHYMetricsForm;
      const igPnlValue = igHyMetricsForm?.ig?.pnl?.trim() || '';
      return igPnlValue !== '' && igPnlValue !== '0';
    }
  }, [sector, formData.metrics]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      if (isFormValid && saveStatus !== 'saving') {
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
            <Box display="flex" gap={1} sx={{ mt: 1 }}>
              <Chip 
                label={sector || ''} 
                size="small" 
                color="primary"
              />
              {sector && (
                <Chip 
                  label={getSectorModelType(sector)} 
                  size="small" 
                  color={getSectorModelType(sector) === 'IG Only' ? 'success' : 'warning'}
                  variant="outlined"
                />
              )}
              {sector && (
                <Chip 
                  label={getSectorCategory(sector)} 
                  size="small" 
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
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

        {/* Dynamic Form based on Sector Model */}
        <Grid container spacing={3}>
          {sector && (
            <>
              {/* Market Moves & Flows Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Market Moves & Flows
                </Typography>
                
                {getSectorModelType(sector) === 'IG Only' ? (
                  /* IG Only Form */
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                      Investment Grade
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Lower Bound"
                          type="number"
                          value={((formData.marketMovesAndFlows as IGOnlyMarketMovesForm)?.ig?.lower) || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            marketMovesAndFlows: {
                              ig: {
                                ...(prev.marketMovesAndFlows as IGOnlyMarketMovesForm).ig,
                                lower: e.target.value
                              }
                            } as IGOnlyMarketMovesForm
                          }))}
                          placeholder="0"
                          variant="outlined"
                          autoFocus
                          inputProps={{ step: "0.01" }}
                          helperText="Optional - accepts decimals (e.g., -2.5)"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Higher Bound"
                          type="number"
                          value={((formData.marketMovesAndFlows as IGOnlyMarketMovesForm)?.ig?.higher) || ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            marketMovesAndFlows: {
                              ig: {
                                ...(prev.marketMovesAndFlows as IGOnlyMarketMovesForm).ig,
                                higher: e.target.value
                              }
                            } as IGOnlyMarketMovesForm
                          }))}
                          placeholder="0"
                          variant="outlined"
                          inputProps={{ step: "0.01" }}
                          helperText="Optional - accepts decimals (e.g., 3.25)"
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ) : (
                  /* IG & HY Form */
                  <Box>
                    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                        Investment Grade
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="IG Lower Bound"
                            type="number"
                            value={((formData.marketMovesAndFlows as IGAndHYMarketMovesForm)?.ig?.lower) || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              marketMovesAndFlows: {
                                ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm),
                                ig: {
                                  ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm).ig,
                                  lower: e.target.value
                                }
                              } as IGAndHYMarketMovesForm
                            }))}
                            placeholder="0"
                            variant="outlined"
                            autoFocus
                            inputProps={{ step: "0.01" }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="IG Higher Bound"
                            type="number"
                            value={((formData.marketMovesAndFlows as IGAndHYMarketMovesForm)?.ig?.higher) || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              marketMovesAndFlows: {
                                ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm),
                                ig: {
                                  ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm).ig,
                                  higher: e.target.value
                                }
                              } as IGAndHYMarketMovesForm
                            }))}
                            placeholder="0"
                            variant="outlined"
                            inputProps={{ step: "0.01" }}
                          />
                        </Grid>
                      </Grid>
                    </Card>

                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="secondary.main" gutterBottom>
                        High Yield
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="HY Lower Bound"
                            type="number"
                            value={((formData.marketMovesAndFlows as IGAndHYMarketMovesForm)?.hy?.lower) || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              marketMovesAndFlows: {
                                ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm),
                                hy: {
                                  ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm).hy,
                                  lower: e.target.value
                                }
                              } as IGAndHYMarketMovesForm
                            }))}
                            placeholder="0"
                            variant="outlined"
                            inputProps={{ step: "0.01" }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="HY Higher Bound"
                            type="number"
                            value={((formData.marketMovesAndFlows as IGAndHYMarketMovesForm)?.hy?.higher) || ''}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              marketMovesAndFlows: {
                                ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm),
                                hy: {
                                  ...(prev.marketMovesAndFlows as IGAndHYMarketMovesForm).hy,
                                  higher: e.target.value
                                }
                              } as IGAndHYMarketMovesForm
                            }))}
                            placeholder="0"
                            variant="outlined"
                            inputProps={{ step: "0.01" }}
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Box>
                )}
              </Grid>

              {/* Financial Metrics Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Financial Metrics
                </Typography>
                
                {getSectorModelType(sector) === 'IG Only' ? (
                  /* IG Only Metrics - Organized by PNL, Risk, Volume */
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" gutterBottom>
                      Investment Grade Metrics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="P&L *"
                          type="number"
                          value={((formData.metrics as IGOnlyMetricsForm)?.ig?.pnl) || '0'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metrics: {
                              ig: {
                                ...(prev.metrics as IGOnlyMetricsForm).ig,
                                pnl: e.target.value
                              }
                            } as IGOnlyMetricsForm
                          }))}
                          onFocus={(e) => {
                            const currentValue = ((formData.metrics as IGOnlyMetricsForm)?.ig?.pnl) || '0';
                            if (currentValue === '0') {
                              e.target.select();
                            }
                          }}
                          onClick={(e) => {
                            const currentValue = ((formData.metrics as IGOnlyMetricsForm)?.ig?.pnl) || '0';
                            if (currentValue === '0') {
                              (e.target as HTMLInputElement).select();
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            endAdornment: <InputAdornment position="end">k</InputAdornment>
                          }}
                          variant="outlined"
                        />
                        {((formData.metrics as IGOnlyMetricsForm)?.ig?.pnl) && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {formatCurrency(parseFloat(((formData.metrics as IGOnlyMetricsForm)?.ig?.pnl) || '0') || 0)}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Risk"
                          type="number"
                          value={((formData.metrics as IGOnlyMetricsForm)?.ig?.risk) || '0'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metrics: {
                              ig: {
                                ...(prev.metrics as IGOnlyMetricsForm).ig,
                                risk: e.target.value
                              }
                            } as IGOnlyMetricsForm
                          }))}
                          onFocus={(e) => {
                            const currentValue = ((formData.metrics as IGOnlyMetricsForm)?.ig?.risk) || '0';
                            if (currentValue === '0') {
                              e.target.select();
                            }
                          }}
                          onClick={(e) => {
                            const currentValue = ((formData.metrics as IGOnlyMetricsForm)?.ig?.risk) || '0';
                            if (currentValue === '0') {
                              (e.target as HTMLInputElement).select();
                            }
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            endAdornment: <InputAdornment position="end">k</InputAdornment>
                          }}
                          variant="outlined"
                        />
                        {((formData.metrics as IGOnlyMetricsForm)?.ig?.risk) && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {formatCurrency(parseFloat(((formData.metrics as IGOnlyMetricsForm)?.ig?.risk) || '0') || 0)}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="Volume"
                          type="number"
                          value={((formData.metrics as IGOnlyMetricsForm)?.ig?.volumes) || '0'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            metrics: {
                              ig: {
                                ...(prev.metrics as IGOnlyMetricsForm).ig,
                                volumes: e.target.value
                              }
                            } as IGOnlyMetricsForm
                          }))}
                          onFocus={(e) => {
                            const currentValue = ((formData.metrics as IGOnlyMetricsForm)?.ig?.volumes) || '0';
                            if (currentValue === '0') {
                              e.target.select();
                            }
                          }}
                          onClick={(e) => {
                            const currentValue = ((formData.metrics as IGOnlyMetricsForm)?.ig?.volumes) || '0';
                            if (currentValue === '0') {
                              (e.target as HTMLInputElement).select();
                            }
                          }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">M</InputAdornment>
                          }}
                          variant="outlined"
                        />
                        {((formData.metrics as IGOnlyMetricsForm)?.ig?.volumes) && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {formatCurrency(parseFloat(((formData.metrics as IGOnlyMetricsForm)?.ig?.volumes) || '0') || 0)}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Card>
                ) : (
                  /* IG & HY Metrics - Organized by PNL, Risk, Volume */
                  <Box>
                    {/* PNL Section */}
                    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="success.main" gutterBottom>
                        P&L
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="IG P&L *"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.ig?.pnl) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                ig: {
                                  ...(prev.metrics as IGAndHYMetricsForm).ig,
                                  pnl: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.ig?.pnl) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.ig?.pnl) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="HY P&L"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.hy?.pnl) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                hy: {
                                  ...(prev.metrics as IGAndHYMetricsForm).hy,
                                  pnl: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.hy?.pnl) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.hy?.pnl) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="LCT P&L"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.lct?.pnl) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                lct: {
                                  ...(prev.metrics as IGAndHYMetricsForm).lct,
                                  pnl: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.lct?.pnl) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.lct?.pnl) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="CDS P&L"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.cds?.pnl) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                cds: {
                                  ...(prev.metrics as IGAndHYMetricsForm).cds,
                                  pnl: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.cds?.pnl) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.cds?.pnl) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Card>

                    {/* Risk Section */}
                    <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="error.main" gutterBottom>
                        Risk
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="IG Risk"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.ig?.risk) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                ig: {
                                  ...(prev.metrics as IGAndHYMetricsForm).ig,
                                  risk: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.ig?.risk) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.ig?.risk) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="HY Risk"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.hy?.risk) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                hy: {
                                  ...(prev.metrics as IGAndHYMetricsForm).hy,
                                  risk: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.hy?.risk) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.hy?.risk) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="LCT Risk"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.lct?.risk) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                lct: {
                                  ...(prev.metrics as IGAndHYMetricsForm).lct,
                                  risk: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.lct?.risk) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.lct?.risk) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="CDS Risk"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.cds?.risk) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                cds: {
                                  ...(prev.metrics as IGAndHYMetricsForm).cds,
                                  risk: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.cds?.risk) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.cds?.risk) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              endAdornment: <InputAdornment position="end">k</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Card>

                    {/* Volume Section */}
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="info.main" gutterBottom>
                        Volume
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="IG Volume"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.ig?.volumes) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                ig: {
                                  ...(prev.metrics as IGAndHYMetricsForm).ig,
                                  volumes: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.ig?.volumes) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.ig?.volumes) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">M</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="HY Volume"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.hy?.volumes) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                hy: {
                                  ...(prev.metrics as IGAndHYMetricsForm).hy,
                                  volumes: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.hy?.volumes) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.hy?.volumes) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">M</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="LCT Volume"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.lct?.volumes) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                lct: {
                                  ...(prev.metrics as IGAndHYMetricsForm).lct,
                                  volumes: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.lct?.volumes) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.lct?.volumes) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">M</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            label="CDS Volume"
                            type="number"
                            value={((formData.metrics as IGAndHYMetricsForm)?.cds?.volumes) || '0'}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              metrics: {
                                ...(prev.metrics as IGAndHYMetricsForm),
                                cds: {
                                  ...(prev.metrics as IGAndHYMetricsForm).cds,
                                  volumes: e.target.value
                                }
                              } as IGAndHYMetricsForm
                            }))}
                            onFocus={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.cds?.volumes) || '0';
                              if (currentValue === '0') {
                                e.target.select();
                              }
                            }}
                            onClick={(e) => {
                              const currentValue = ((formData.metrics as IGAndHYMetricsForm)?.cds?.volumes) || '0';
                              if (currentValue === '0') {
                                (e.target as HTMLInputElement).select();
                              }
                            }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">M</InputAdornment>
                            }}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Card>
                  </Box>
                )}
              </Grid>

              {/* Market Commentary */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Market Commentary
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                  Provide detailed market commentary and analysis with rich text formatting support. (Optional)
                </Typography>
                <RichTextEditor
                  value={formData.marketCommentary}
                  onChange={(value) => setFormData(prev => ({ ...prev, marketCommentary: value }))}
                  placeholder="Enter detailed market commentary and analysis... (Optional)

Examples:
• Key market movements and trends
• Sector-specific insights and drivers
• Notable trades and market events
• Risk factors and outlook
• Technical analysis and levels"
                  height={200}
                />
              </Grid>
            </>
          )}
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
          disabled={saveStatus === 'saving' || !isFormValid}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save Recap'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
