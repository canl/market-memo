import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Fab,
  Paper,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
  TextField,
  Collapse,
  Divider,
  Button,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as ReportIcon,
  History as HistoryIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { RichTextDisplay } from './RichTextDisplay';
import { MetricsBreakdown } from './MetricsBreakdown';
import { Sector, SectorRecap } from '../types';
import { SECTORS, SECTOR_LABELS, getSectorModelType, getSectorCategory } from '../constants/sectors';
import { DataService } from '../services/dataService';
import { formatMarketMovesAndFlows } from '../utils/formatters';


/**
 * Format functions for dashboard display
 * These functions convert stored values (in thousands) to display format
 */

/**
 * Formats P&L values with sign and 'k' suffix
 * @param value - P&L value in thousands
 * @returns Formatted string (e.g., "+1,200k", "-500k", "0")
 */
const formatPnL = (value: number): string => {
  if (value === 0) return '0';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value / 1000).toFixed(0)}k`;
};

/**
 * Formats Risk values with 'k' suffix
 * @param value - Risk value in thousands
 * @returns Formatted string (e.g., "1,200k", "500k", "0")
 */
const formatRisk = (value: number): string => {
  if (value === 0) return '0';
  return `${(value / 1000).toFixed(0)}k`;
};

/**
 * Formats Volume values with 'M' suffix (millions)
 * @param value - Volume value in thousands
 * @returns Formatted string (e.g., "1,200M", "500M", "0")
 */
const formatVolume = (value: number): string => {
  if (value === 0) return '0';
  // Volume is stored as thousands but displayed as millions
  return `${(value / 1000).toFixed(0)}M`;
};

interface DashboardProps {
  onSectorEdit: (sector: Sector) => void;
  onViewReports: () => void;
  onViewHistory: () => void;
  onAPACEdit: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  refreshTrigger?: number; // Add refresh trigger
  onExportPDF?: () => void;
  onSendEmail?: () => void;
  onPrint?: () => void;
}

interface SectorCardData {
  sector: Sector;
  label: string;
  recap?: SectorRecap;
  status: 'completed' | 'pending' | 'draft';
  pnl: number;
  risk: number;
  volumes: number;
}

/**
 * Dashboard Component
 * 
 * Main dashboard displaying sector overview, metrics summary, and sector cards.
 * Features:
 * - Date picker with print/export/email actions
 * - APAC market summary section
 * - Sector cards grouped by category (Country, Asia Sovereign / CDS)
 * - Expandable sector cards with detailed metrics breakdown
 * - Real-time data loading and persistence
 * 
 * @param props - Dashboard component props
 */
export const Dashboard: React.FC<DashboardProps> = ({
  onSectorEdit,
  onViewReports,
  onViewHistory,
  onAPACEdit,
  selectedDate,
  onDateChange,
  refreshTrigger,
  onExportPDF,
  onSendEmail,
  onPrint
}) => {
  const theme = useTheme();

  const [sectorData, setSectorData] = useState<SectorCardData[]>([]);
  const [totalMetrics, setTotalMetrics] = useState({
    pnl: 0,
    risk: 0,
    volumes: 0,
    completedSectors: 0,
    totalSectors: SECTORS.length
  });
  const [apacCommentary, setApacCommentary] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Set<Sector>>(new Set());

  const toggleCardExpansion = (sector: Sector) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sector)) {
        newSet.delete(sector);
      } else {
        newSet.add(sector);
      }
      return newSet;
    });
  };

  const loadDashboardData = useCallback(() => {
    const report = DataService.getReportByDate(selectedDate);

    // Load APAC commentary
    setApacCommentary(report?.apacComments?.marketCommentary || '');

    // Create sector cards data
    const cards: SectorCardData[] = SECTORS.map(sector => {
      const recap = report?.sectorRecaps.find(r => r.sector === sector);
      const status = recap ? 'completed' : 'pending';

      // Use new data model helper to get aggregated metrics
      const legacyMetrics = recap ? DataService.getLegacyMetrics(recap) : { pnl: 0, risk: 0, volumes: 0 };

      return {
        sector,
        label: SECTOR_LABELS[sector],
        recap,
        status,
        pnl: legacyMetrics.pnl,
        risk: legacyMetrics.risk,
        volumes: legacyMetrics.volumes
      };
    });

    setSectorData(cards);

    // Calculate totals by aggregating all sector data
    const totals = cards.reduce((acc, card) => ({
      pnl: acc.pnl + card.pnl,
      risk: acc.risk + card.risk,
      volumes: acc.volumes + card.volumes,
      completedSectors: acc.completedSectors + (card.status === 'completed' ? 1 : 0),
      totalSectors: SECTORS.length
    }), { pnl: 0, risk: 0, volumes: 0, completedSectors: 0, totalSectors: SECTORS.length });

    setTotalMetrics(totals);
  }, [selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, refreshTrigger]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'draft': return theme.palette.warning.main;
      default: return theme.palette.grey[400];
    }
  };

  // Sector grouping based on new model categories
  const sectorGroups = [
    {
      title: 'Country',
      sectors: SECTORS.filter(sector => getSectorCategory(sector) === 'Country')
    },
    {
      title: 'Asia Sovereign / CDS',
      sectors: SECTORS.filter(sector => getSectorCategory(sector) === 'Asia Sovereign / CDS')
    }
  ];

  const completionPercentage = (totalMetrics.completedSectors / totalMetrics.totalSectors) * 100;

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Date Navigation */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
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
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              {selectedDate === new Date().toISOString().split('T')[0]
                ? 'Viewing today\'s live data. Changes will be reflected immediately.'
                : 'Viewing historical data for the selected date.'
              }
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
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
          </Grid>
        </Grid>
      </Paper>

      {/* Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`, color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatPnL(totalMetrics.pnl)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total P&L
                  </Typography>
                </Box>
                {totalMetrics.pnl >= 0 ? 
                  <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} /> : 
                  <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                }
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {formatRisk(totalMetrics.risk)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Risk
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                {formatVolume(totalMetrics.volumes)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Volume
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {totalMetrics.completedSectors}/{totalMetrics.totalSectors}
                </Typography>
                <Avatar sx={{ bgcolor: theme.palette.success.main, width: 32, height: 32 }}>
                  <CheckIcon sx={{ fontSize: 20 }} />
                </Avatar>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sectors Completed
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage} 
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* APAC Market Summary */}
      <Card
        sx={{
          mb: 4,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          },
          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
        }}
        onClick={onAPACEdit}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              APAC Market Summary
            </Typography>
            <Chip
              label="Regional Commentary"
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          {apacCommentary ? (
            <RichTextDisplay
              content={apacCommentary}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                fontStyle: 'italic',
                color: 'text.primary'
              }}
            />
          ) : (
            <Box
              sx={{
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 1,
                border: `1px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Click to add APAC market summary and regional insights
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Sector Cards Grid */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
        Sector Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Click on any sector card to input market data and commentary
      </Typography>

      {sectorGroups.map((group, groupIndex) => (
        <Box key={group.title} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 2, fontSize: '1.1rem' }}>
            {group.title}
          </Typography>
          <Grid container spacing={2.5} sx={{ mb: 3, alignItems: 'flex-start' }}>
            {sectorData
              .filter(card => group.sectors.includes(card.sector))
              .map((card, index) => {
                const isExpanded = expandedCards.has(card.sector);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={`${card.sector}-${groupIndex}-${index}`}>
              <Card
                key={`card-${card.sector}-${groupIndex}`}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  height: 'auto',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                    transform: 'translateY(-1px)'
                  },
                  border: card.status === 'completed' ? `2px solid ${theme.palette.success.main}` : `1px solid ${alpha(theme.palette.divider, 0.12)}`
                }}
                onClick={() => onSectorEdit(card.sector)}
              >
                <CardContent sx={{ pb: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                        {card.label}
                      </Typography>
                      <Chip
                        label={getSectorModelType(card.sector)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          mt: 0.5,
                          color: getSectorModelType(card.sector) === 'IG Only' ? 'success.main' : 'warning.main',
                          borderColor: getSectorModelType(card.sector) === 'IG Only' ? 'success.main' : 'warning.main'
                        }}
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Chip
                        label={card.status === 'completed' ? 'Complete' : 'Pending'}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(card.status), 0.1),
                          color: getStatusColor(card.status),
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardExpansion(card.sector);
                        }}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.action.hover, 0.5)
                          }
                        }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Market Moves & Flows Section */}
                  <Box mb={1.5}>
                    <Typography variant="caption" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.8rem' }}>
                      Market Moves & Flows
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', mt: 0.5 }}>
                      {formatMarketMovesAndFlows(card.recap?.marketMovesAndFlows || { ig: { lower: undefined, higher: undefined } })}
                    </Typography>
                  </Box>

                  {/* Metrics Section */}
                  <Box mb={1.5} sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.8rem', mb: 0.5, display: 'block' }}>
                      Metrics
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1.5} justifyContent="space-between">
                      <Typography variant="body2" color={card.pnl >= 0 ? 'success.main' : 'error.main'} fontWeight="bold" sx={{ fontSize: '0.8rem' }}>
                        P&L: {formatPnL(card.pnl)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        Risk: {formatRisk(card.risk)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        Vol: {formatVolume(card.volumes)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Expandable Content */}
                  <Collapse in={isExpanded}>
                    <Divider sx={{ mb: 2 }} />

                    {/* Metrics Breakdown */}
                    {card.recap?.metrics && (
                      <MetricsBreakdown 
                        metrics={card.recap.metrics} 
                        modelType={getSectorModelType(card.sector)} 
                      />
                    )}

                    {/* Market Commentary */}
                    {card.recap?.marketCommentary && (
                      <Box mb={2}>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
                          Market Commentary:
                        </Typography>
                        <RichTextDisplay
                          content={card.recap.marketCommentary}
                          sx={{
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            '& p': { margin: '0.5rem 0' },
                            '& ul, & ol': { paddingLeft: '1.5rem', margin: '0.5rem 0' },
                            '& li': { marginBottom: '0.25rem' }
                          }}
                        />
                      </Box>
                    )}

                  </Collapse>

                  {/* Preview for Collapsed State */}
                  {!isExpanded && (
                    <Box mt={1}>
                      {card.recap?.marketCommentary ? (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Strip markdown formatting for preview */}
                          {card.recap.marketCommentary.replace(/[*_#\-+[\]]/g, '').trim()}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Click to add details...
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
          </Grid>
        </Box>
      ))}

      {/* Quick Actions */}
      <Paper 
        sx={{ 
          p: 3, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Fab 
            variant="extended" 
            color="primary" 
            onClick={onViewReports}
            sx={{ minWidth: 160 }}
          >
            <ReportIcon sx={{ mr: 1 }} />
            View Reports
          </Fab>
          <Fab 
            variant="extended" 
            color="secondary" 
            onClick={onViewHistory}
            sx={{ minWidth: 160 }}
          >
            <HistoryIcon sx={{ mr: 1 }} />
            Historical Data
          </Fab>
        </Box>
      </Paper>
    </Box>
  );
};
