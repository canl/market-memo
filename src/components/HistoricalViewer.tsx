import React, { useState, useEffect, useMemo } from 'react';
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
  Unstable_Grid2 as Grid,
  Chip,
  Alert,
  useTheme
} from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, ModuleRegistry, AllCommunityModule, themeQuartz } from 'ag-grid-community';
import { DailyReport, HistoricalFilter, Sector } from '../types';
import { SECTORS, SECTOR_LABELS } from '../constants/sectors';
import { DataService } from '../services/dataService';
import { formatDate, formatCurrency } from '../utils/formatters';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

// Create custom themes
const darkTheme = themeQuartz
  .withParams({
    backgroundColor: "#1D2634",
    browserColorScheme: "dark",
    chromeBackgroundColor: {
      ref: "foregroundColor",
      mix: 0.07,
      onto: "backgroundColor"
    },
    foregroundColor: "#FFF",
    headerFontSize: 14,
    fontSize: 13,
    spacing: 8,
    borderRadius: 4,
    wrapperBorderRadius: 8
  });

const lightTheme = themeQuartz
  .withParams({
    backgroundColor: "#FFFFFF",
    browserColorScheme: "light",
    chromeBackgroundColor: {
      ref: "foregroundColor",
      mix: 0.05,
      onto: "backgroundColor"
    },
    foregroundColor: "#1f2937",
    headerFontSize: 14,
    fontSize: 13,
    spacing: 8,
    borderRadius: 4,
    wrapperBorderRadius: 8
  });

interface EnhancedHistoricalViewerProps {
  onReportSelect?: (report: DailyReport) => void;
}

interface GridRowData {
  id: string;
  date: string;
  sector: string;
  marketMovesAndFlows: string;
  marketCommentary: string;
  pnl: number;
  risk: number;
  volumes: number;
  submittedBy: string;
  reportData?: DailyReport;
}

export const EnhancedHistoricalViewer: React.FC<EnhancedHistoricalViewerProps> = ({ onReportSelect }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [historicalData, setHistoricalData] = useState<DailyReport[]>([]);
  const [filter, setFilter] = useState<HistoricalFilter>({
    dateFrom: '',
    dateTo: '',
    sector: 'All'
  });
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({
    from: '',
    to: ''
  });

  useEffect(() => {
    const data = DataService.getHistoricalData();
    setHistoricalData(data);

    // Set default date range to show recent data
    if (data.length > 0) {
      const latest = new Date(data[0].date);
      const oldest = new Date(data[data.length - 1].date);

      const latestStr = latest.toISOString().split('T')[0];
      const oldestStr = oldest.toISOString().split('T')[0];

      setSelectedDateRange({
        from: oldestStr,
        to: latestStr
      });

      setFilter(prev => ({
        ...prev,
        dateFrom: oldestStr,
        dateTo: latestStr
      }));
    }
  }, []);

  const filteredData = useMemo(() => {
    let filtered = historicalData;

    if (filter.dateFrom) {
      filtered = filtered.filter(report => report.date >= filter.dateFrom!);
    }
    
    if (filter.dateTo) {
      filtered = filtered.filter(report => report.date <= filter.dateTo!);
    }

    // Convert to grid format
    const gridData: GridRowData[] = [];
    
    filtered.forEach(report => {
      // Add APAC row
      gridData.push({
        id: `${report.date}-apac`,
        date: report.date,
        sector: 'APAC Overall',
        marketMovesAndFlows: 'Overall Comments',
        marketCommentary: report.apacComments.marketCommentary || 'No summary provided',
        pnl: report.apacComments.pnl,
        risk: report.apacComments.risk,
        volumes: report.apacComments.volumes,
        submittedBy: 'APAC Desk',
        reportData: report
      });

      // Add sector rows
      report.sectorRecaps.forEach(recap => {
        if (filter.sector === 'All' || filter.sector === recap.sector) {
          gridData.push({
            id: `${report.date}-${recap.sector}`,
            date: report.date,
            sector: SECTOR_LABELS[recap.sector],
            marketMovesAndFlows: recap.marketMovesAndFlows,
            marketCommentary: recap.marketCommentary,
            pnl: recap.metrics.pnl,
            risk: recap.metrics.risk,
            volumes: recap.metrics.volumes,
            submittedBy: recap.submittedBy || 'Unknown',
            reportData: report
          });
        }
      });
    });

    const sortedData = gridData.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;

      // APAC first, then sectors
      if (a.sector === 'APAC Overall' && b.sector !== 'APAC Overall') return -1;
      if (b.sector === 'APAC Overall' && a.sector !== 'APAC Overall') return 1;
      return a.sector.localeCompare(b.sector);
    });

    return sortedData;
  }, [historicalData, filter]);

  const columnDefs: ColDef[] = [
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      valueFormatter: (params) => formatDate(params.value),
      sort: 'desc'
    },
    {
      field: 'sector',
      headerName: 'Sector',
      width: 140,
      cellRenderer: (params: any) => {
        const isAPAC = params.value === 'APAC Overall';
        return (
          <Chip
            label={params.value}
            size="small"
            color={isAPAC ? 'primary' : 'default'}
            variant={isAPAC ? 'filled' : 'outlined'}
          />
        );
      }
    },
    {
      field: 'marketMovesAndFlows',
      headerName: 'Market Moves & Flows',
      width: 200,
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' }
    },
    {
      field: 'marketCommentary',
      headerName: 'Market Commentary',
      flex: 1,
      minWidth: 250,
      wrapText: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' }
    },
    {
      field: 'pnl',
      headerName: 'P&L',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      cellStyle: (params) => ({
        color: params.value >= 0 ? '#22c55e' : '#ef4444',
        fontWeight: 'bold'
      })
    },
    {
      field: 'risk',
      headerName: 'Risk',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value)
    },
    {
      field: 'volumes',
      headerName: 'Volume',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value)
    },
    {
      field: 'submittedBy',
      headerName: 'Submitted By',
      width: 120
    }
  ];

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    setSelectedDateRange(prev => ({
      ...prev,
      [field]: value
    }));

    setFilter(prev => ({
      ...prev,
      [field === 'from' ? 'dateFrom' : 'dateTo']: value
    }));
  };

  return (
    <Box sx={{ p: 0 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Historical Recap Viewer
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid xs={12} sm={6} md={3}>
              <TextField
                type="date"
                label="From Date"
                value={selectedDateRange.from}
                onChange={(e) => handleDateRangeChange('from', e.target.value)}
                fullWidth
                size="small"
                className="date-picker-field"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <TextField
                type="date"
                label="To Date"
                value={selectedDateRange.to}
                onChange={(e) => handleDateRangeChange('to', e.target.value)}
                fullWidth
                size="small"
                className="date-picker-field"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sector Filter</InputLabel>
                  <Select
                    value={filter.sector}
                    label="Sector Filter"
                    onChange={(e) => setFilter(prev => ({ ...prev, sector: e.target.value as Sector | 'All' }))}
                  >
                    <MenuItem value="All">All Sectors</MenuItem>
                    {SECTORS.map(sector => (
                      <MenuItem key={sector} value={sector}>
                        {SECTOR_LABELS[sector]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" height="100%">
                  <Typography variant="body2" color="text.secondary">
                    {filteredData.length} records found
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {filteredData.length === 0 ? (
              <Alert severity="info">
                No historical data found for the selected date range and filters.
              </Alert>
            ) : (
              <Box sx={{ height: 600, width: '100%' }}>
                <AgGridReact
                  theme={isDarkMode ? darkTheme : lightTheme}
                  rowData={filteredData}
                  columnDefs={columnDefs}
                  onGridReady={onGridReady}
                  pagination={true}
                  paginationPageSize={20}
                  domLayout="normal"
                  rowHeight={50}
                  headerHeight={40}
                  rowSelection="single"
                  onRowClicked={(event) => {
                    if (event.data.reportData && onReportSelect) {
                      onReportSelect(event.data.reportData);
                    }
                  }}
                  getRowStyle={(params) => {
                    if (params.data.sector === 'APAC Overall') {
                      return {
                        backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#e2e8f0' : '#334155'
                      };
                    }
                    return undefined;
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
};
