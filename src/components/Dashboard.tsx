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
  TextField
} from '@mui/material';
import {
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as ReportIcon,
  History as HistoryIcon,

  CheckCircle as CheckIcon,
  Schedule as PendingIcon
} from '@mui/icons-material';
import { Sector, SectorRecap } from '../types';
import { SECTORS, SECTOR_LABELS } from '../constants/sectors';
import { DataService } from '../services/dataService';


// Format functions to match Trader Input page exactly
const formatPnL = (value: number): string => {
  if (value === 0) return '0';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value / 1000).toFixed(0)}k`;
};

const formatRisk = (value: number): string => {
  if (value === 0) return '0';
  return `${(value / 1000).toFixed(0)}k`;
};

const formatVolume = (value: number): string => {
  if (value === 0) return '0';
  // Volume is stored as thousands but displayed as millions
  // So if user enters 268M, it's stored as 268000, and we show (268000/1000)M = 268M
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

export const Dashboard: React.FC<DashboardProps> = ({
  onSectorEdit,
  onViewReports,
  onViewHistory,
  onAPACEdit,
  selectedDate,
  onDateChange,
  refreshTrigger
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

  const loadDashboardData = useCallback(() => {
    const report = DataService.getReportByDate(selectedDate);

    // Load APAC commentary
    setApacCommentary(report?.apacComments?.marketCommentary || '');

    // Create sector cards data
    const cards: SectorCardData[] = SECTORS.map(sector => {
      const recap = report?.sectorRecaps.find(r => r.sector === sector);
      const status = recap ? 'completed' : 'pending';

      return {
        sector,
        label: SECTOR_LABELS[sector],
        recap,
        status,
        pnl: recap?.metrics.pnl || 0,
        risk: recap?.metrics.risk || 0,
        volumes: recap?.metrics.volumes || 0
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'draft': return <EditIcon />;
      default: return <PendingIcon />;
    }
  };

  const completionPercentage = (totalMetrics.completedSectors / totalMetrics.totalSectors) * 100;

  return (
    <Box sx={{ p: 3, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Trading Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Box>

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
          <Grid item xs={12} md={8}>
            <Typography variant="body2" color="text.secondary">
              {selectedDate === new Date().toISOString().split('T')[0]
                ? 'Viewing today\'s live data. Changes will be reflected immediately.'
                : 'Viewing historical data for the selected date.'
              }
            </Typography>
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
            <Typography
              variant="body1"
              color="text.primary"
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.5),
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                fontStyle: 'italic'
              }}
            >
              {apacCommentary}
            </Typography>
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
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Sector Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {sectorData.map((card) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={card.sector}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                },
                border: card.status === 'completed' ? `2px solid ${theme.palette.success.main}` : 'none'
              }}
              onClick={() => onSectorEdit(card.sector)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Chip 
                    label={card.label}
                    size="small"
                    sx={{ 
                      bgcolor: alpha(getStatusColor(card.status), 0.1),
                      color: getStatusColor(card.status),
                      fontWeight: 'bold'
                    }}
                  />
                  <IconButton 
                    size="small" 
                    sx={{ color: getStatusColor(card.status) }}
                  >
                    {getStatusIcon(card.status)}
                  </IconButton>
                </Box>

                <Box mb={2}>
                  <Typography variant="h6" fontWeight="bold" color={card.pnl >= 0 ? 'success.main' : 'error.main'}>
                    {formatPnL(card.pnl)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    P&L
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Risk: {formatRisk(card.risk)}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Volume: {formatVolume(card.volumes)}
                  </Typography>
                </Box>

                {card.recap?.marketCommentary && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 1, 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {card.recap.marketCommentary}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
