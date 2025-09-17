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
  Email as EmailIcon,
  Security as SecurityIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import { RichTextDisplay } from './RichTextDisplay';
import { MetricsBreakdown } from './MetricsBreakdown';
import { Sector, SectorRecap } from '../types';
import { SECTORS, SECTOR_LABELS, getSectorModelType, getSectorCategory } from '../constants/sectors';
import { DataService } from '../services/dataService';

/**
 * Format functions for dashboard display
 * These functions convert stored values (in thousands) to display format
 */

/**
 * Formats P&L values with sign and 'k' suffix, including thousand separators
 * @param value - P&L value in thousands
 * @returns Formatted string (e.g., "+1,200k", "-500k", "0")
 */
const formatPnL = (value: number): string => {
  if (value === 0) return '0';
  const sign = value >= 0 ? '+' : '';
  const formattedValue = formatWithSeparators(Math.abs(value / 1000));
  return `${sign}${formattedValue}k`;
};

/**
 * Formats Risk values with 'k' suffix, including thousand separators
 * @param value - Risk value in thousands
 * @returns Formatted string (e.g., "1,200k", "500k", "0")
 */
const formatRisk = (value: number): string => {
  if (value === 0) return '0';
  const formattedValue = formatWithSeparators(value / 1000);
  return `${formattedValue}k`;
};

/**
 * Formats Volume values with 'M' suffix (millions), including thousand separators
 * @param value - Volume value in thousands
 * @returns Formatted string (e.g., "1,200M", "500M", "0")
 */
const formatVolume = (value: number): string => {
  if (value === 0) return '0';
  // Volume is stored as thousands but displayed as millions
  const formattedValue = formatWithSeparators(value / 1000);
  return `${formattedValue}M`;
};

/**
 * Formats values with thousand separators for readability
 * @param value - Numeric value
 * @returns Formatted string with thousand separators
 */
const formatWithSeparators = (value: number): string => {
  return value.toLocaleString('en-US');
};

/**
 * Calculates Cash breakdown (IG + HY + LCT) from sector metrics
 * @param metrics - Sector metrics object
 * @returns Cash breakdown values
 */
const calculateCashBreakdown = (metrics: any): { pnl: number; risk: number; volumes: number } => {
  if ('ig' in metrics && !('hy' in metrics)) {
    // IG Only model - only IG counts as Cash
    return {
      pnl: metrics.ig.pnl,
      risk: metrics.ig.risk,
      volumes: metrics.ig.volumes
    };
  } else if ('hy' in metrics) {
    // IG & HY model - Cash = IG + HY + LCT
    return {
      pnl: metrics.ig.pnl + metrics.hy.pnl + metrics.lct.pnl,
      risk: metrics.ig.risk + metrics.hy.risk + metrics.lct.risk,
      volumes: metrics.ig.volumes + metrics.hy.volumes + metrics.lct.volumes
    };
  } else {
    return { pnl: 0, risk: 0, volumes: 0 };
  }
};

/**
 * Calculates CDS breakdown from sector metrics
 * @param metrics - Sector metrics object
 * @returns CDS breakdown values
 */
const calculateCDSBreakdown = (metrics: any): { pnl: number; risk: number; volumes: number } => {
  if ('cds' in metrics) {
    return {
      pnl: metrics.cds.pnl,
      risk: metrics.cds.risk,
      volumes: metrics.cds.volumes
    };
  } else {
    return { pnl: 0, risk: 0, volumes: 0 };
  }
};

/**
 * Formats Market Moves & Flows for Dashboard display
 * Shows both IG and HY values for IG & HY sectors
 * @param marketMovesAndFlows - The market moves and flows object
 * @param modelType - The sector model type ('IG Only' or 'IG & HY')
 * @returns Formatted string for dashboard display
 */
const formatDashboardMarketMovesAndFlows = (marketMovesAndFlows: any, modelType: string): string => {
  // Helper function to format individual values
  const formatValue = (value: number | undefined): string => {
    if (value === undefined || value === null || value === 0) {
      return '–';
    }
    // Handle decimals properly
    return value % 1 === 0 ? value.toString() : value.toString();
  };

  // Handle IG Only case
  if (modelType === 'IG Only') {
    const { lower, higher } = marketMovesAndFlows.ig || { lower: undefined, higher: undefined };
    return `${formatValue(lower)}/${formatValue(higher)}`;
  }

  // Handle IG & HY case - show both credit types in one row
  if (modelType === 'IG & HY') {
    const igLower = formatValue(marketMovesAndFlows.ig?.lower);
    const igHigher = formatValue(marketMovesAndFlows.ig?.higher);
    const hyLower = formatValue(marketMovesAndFlows.hy?.lower);
    const hyHigher = formatValue(marketMovesAndFlows.hy?.higher);
    
    return `IG: ${igLower}/${igHigher}    HY: ${hyLower}/${hyHigher}`;
  }

  // Fallback for legacy data
  const { lower, higher } = marketMovesAndFlows || { lower: undefined, higher: undefined };
  return `${formatValue(lower)}/${formatValue(higher)}`;
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
    totalSectors: SECTORS.length,
    cashBreakdown: { pnl: 0, risk: 0, volumes: 0 },
    cdsBreakdown: { pnl: 0, risk: 0, volumes: 0 }
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
    const totals = cards.reduce((acc, card) => {
      const cashBreakdown = card.recap ? calculateCashBreakdown(card.recap.metrics) : { pnl: 0, risk: 0, volumes: 0 };
      const cdsBreakdown = card.recap ? calculateCDSBreakdown(card.recap.metrics) : { pnl: 0, risk: 0, volumes: 0 };
      
      return {
        pnl: acc.pnl + card.pnl,
        risk: acc.risk + card.risk,
        volumes: acc.volumes + card.volumes,
        completedSectors: acc.completedSectors + (card.status === 'completed' ? 1 : 0),
        totalSectors: SECTORS.length,
        cashBreakdown: {
          pnl: acc.cashBreakdown.pnl + cashBreakdown.pnl,
          risk: acc.cashBreakdown.risk + cashBreakdown.risk,
          volumes: acc.cashBreakdown.volumes + cashBreakdown.volumes
        },
        cdsBreakdown: {
          pnl: acc.cdsBreakdown.pnl + cdsBreakdown.pnl,
          risk: acc.cdsBreakdown.risk + cdsBreakdown.risk,
          volumes: acc.cdsBreakdown.volumes + cdsBreakdown.volumes
        }
      };
    }, { 
      pnl: 0, 
      risk: 0, 
      volumes: 0, 
      completedSectors: 0, 
      totalSectors: SECTORS.length,
      cashBreakdown: { pnl: 0, risk: 0, volumes: 0 },
      cdsBreakdown: { pnl: 0, risk: 0, volumes: 0 }
    });

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
    <Box sx={{ p: 2, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Date Navigation */}
      <Paper sx={{ p: 1.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              type="date"
              label="Trading Date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              className="date-picker-field"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {selectedDate === new Date().toISOString().split('T')[0]
                ? 'Live data - changes reflected immediately'
                : 'Historical data for selected date'
              }
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4} md={5}>
            <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap">
              <Button
                variant="outlined"
                onClick={onPrint}
                size="small"
                startIcon={<PrintIcon />}
                sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
              >
                Print
              </Button>
              <Button
                variant="outlined"
                onClick={onExportPDF}
                size="small"
                startIcon={<PdfIcon />}
                sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
              >
                PDF
              </Button>
              <Button
                variant="contained"
                onClick={onSendEmail}
                size="small"
                startIcon={<EmailIcon />}
                sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
              >
                Email
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%', 
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={totalMetrics.pnl >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPnL(totalMetrics.pnl)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total P&L
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {totalMetrics.pnl >= 0 ? 
                    <TrendingUpIcon sx={{ fontSize: 24, color: theme.palette.primary.main }} /> : 
                    <TrendingDownIcon sx={{ fontSize: 24, color: theme.palette.error.main }} />
                  }
                </Box>
              </Box>
              
              {/* Cash and CDS Breakdown */}
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Cash: {formatPnL(totalMetrics.cashBreakdown.pnl)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    CDS: {formatPnL(totalMetrics.cdsBreakdown.pnl)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%', 
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.error.main}`,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.palette.error.dark,
              boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.15)}`
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {formatRisk(totalMetrics.risk)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Risk
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SecurityIcon sx={{ fontSize: 24, color: theme.palette.error.main }} />
                </Box>
              </Box>
              
              {/* Cash and CDS Breakdown */}
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Cash: {formatRisk(totalMetrics.cashBreakdown.risk)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    CDS: {formatRisk(totalMetrics.cdsBreakdown.risk)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%', 
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.info.main}`,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.palette.info.dark,
              boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.15)}`
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {formatVolume(totalMetrics.volumes)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Volume
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BarChartIcon sx={{ fontSize: 24, color: theme.palette.info.main }} />
                </Box>
              </Box>
              
              {/* Cash and CDS Breakdown */}
              <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Cash: {formatVolume(totalMetrics.cashBreakdown.volumes)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    CDS: {formatVolume(totalMetrics.cdsBreakdown.volumes)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ 
            height: '100%', 
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.success.main}`,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: theme.palette.success.dark,
              boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.15)}`
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="text.primary">
                    {totalMetrics.completedSectors}/{totalMetrics.totalSectors}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sectors Completed
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckIcon sx={{ fontSize: 24, color: theme.palette.success.main }} />
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={completionPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.success.main,
                    borderRadius: 4
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* APAC Market Summary */}
      <Card
        sx={{
          mb: 3,
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
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
              APAC Market Summary
            </Typography>
            <Chip
              label="Regional Commentary"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>

          {apacCommentary ? (
            <RichTextDisplay
              content={apacCommentary}
              sx={{
                p: 1.5,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                fontStyle: 'italic',
                color: 'text.primary',
                fontSize: '0.9rem'
              }}
            />
          ) : (
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 1,
                border: `1px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                Click to add APAC market summary and regional insights
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Sector Cards Grid */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 1.5 }}>
        Sector Overview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Click on any sector card to input market data and commentary
      </Typography>

      {sectorGroups.map((group, groupIndex) => (
        <Box key={group.title} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 1.5, fontSize: '1.1rem' }}>
            {group.title}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2, alignItems: 'flex-start' }}>
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
                  minHeight: '180px',
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
                <CardContent sx={{ p: 2, pb: 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
                        {card.label}
                      </Typography>
                      <Chip
                        label={getSectorModelType(card.sector)}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.65rem',
                          height: 18,
                          mt: 0.25,
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
                          fontSize: '0.7rem',
                          height: 20
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
                    <Typography variant="caption" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.75rem' }}>
                      Market Moves & Flows
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.7rem', 
                        mt: 0.25,
                        lineHeight: 1.1,
                        letterSpacing: '0.01em'
                      }}
                    >
                      {formatDashboardMarketMovesAndFlows(
                        card.recap?.marketMovesAndFlows || { ig: { lower: undefined, higher: undefined } },
                        getSectorModelType(card.sector)
                      )}
                    </Typography>
                  </Box>

                  {/* Metrics Section */}
                  <Box mb={1.5} sx={{ flex: 1 }}>
                    <Typography variant="caption" fontWeight="bold" color="text.primary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                      Metrics
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between">
                      <Typography variant="body2" color={card.pnl >= 0 ? 'success.main' : 'error.main'} fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                        P&L: {formatPnL(card.pnl)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Risk: {formatRisk(card.risk)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        Vol: {formatVolume(card.volumes)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Expandable Content */}
                  <Collapse in={isExpanded}>
                    <Divider sx={{ mb: 1.5 }} />

                    {/* Metrics Breakdown */}
                    {card.recap?.metrics && (
                      <MetricsBreakdown 
                        metrics={card.recap.metrics} 
                        modelType={getSectorModelType(card.sector)} 
                      />
                    )}

                    {/* Market Commentary */}
                    {card.recap?.marketCommentary && (
                      <Box mb={1.5}>
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
                            fontSize: '0.65rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.2
                          }}
                        >
                          {/* Strip markdown formatting for preview */}
                          {card.recap.marketCommentary.replace(/[*_#\-+[\]]/g, '').trim()}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
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
          p: 2.5, 
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
