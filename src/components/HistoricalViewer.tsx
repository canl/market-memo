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
  Alert
} from '@mui/material';

import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { DailyReport, HistoricalFilter, Sector } from '../types';
import { SECTORS, SECTOR_LABELS } from '../constants/sectors';
import { DataService } from '../services/dataService';
import { formatDate, formatCurrency } from '../utils/formatters';

interface EnhancedHistoricalViewerProps {
  onReportSelect?: (report: DailyReport) => void;
}

interface GridRowData {
  id: string;
  date: string;
  sector: string;
  marketMovesAndFlows: string;
  dailyPnL: string;
  totalPnL: number;
  marketCommentary: string;
  submittedBy: string;
  apacRisk?: string;
  apacPnL?: string;
  apacVolumes?: string;
  apacmarketCommentary?: string;
  reportData?: DailyReport;
}

export const EnhancedHistoricalViewer: React.FC<EnhancedHistoricalViewerProps> = ({ onReportSelect }) => {
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

    // Set default date range to last 7 days
    if (data.length > 0) {
      const latest = new Date(data[0].date);
      const weekAgo = new Date(latest);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const latestStr = latest.toISOString().split('T')[0];
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      setSelectedDateRange({
        from: weekAgoStr,
        to: latestStr
      });

      setFilter(prev => ({
        ...prev,
        dateFrom: weekAgoStr,
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
        dailyPnL: `P&L: ${formatCurrency(report.apacComments.pnl)}, Risk: ${formatCurrency(report.apacComments.risk)}, Volumes: ${formatCurrency(report.apacComments.volumes)}`,
        totalPnL: report.apacComments.pnl,
        marketCommentary: report.apacComments.marketCommentary || 'No summary provided',
        submittedBy: 'APAC Desk',
        apacRisk: formatCurrency(report.apacComments.risk),
        apacPnL: `${formatCurrency(report.apacComments.pnl)}`,
        apacVolumes: formatCurrency(report.apacComments.volumes),
        apacmarketCommentary: report.apacComments.marketCommentary,
        reportData: report
      });

      // Add sector rows
      report.sectorRecaps.forEach(recap => {
        if (filter.sector === 'All' || filter.sector === recap.sector) {
          const totalPnL = recap.metrics.pnl;
          
          gridData.push({
            id: `${report.date}-${recap.sector}`,
            date: report.date,
            sector: SECTOR_LABELS[recap.sector],
            marketMovesAndFlows: recap.marketMovesAndFlows,
            dailyPnL: `P&L: ${formatCurrency(recap.metrics.pnl)}, Risk: ${formatCurrency(recap.metrics.risk)}, Volumes: ${formatCurrency(recap.metrics.volumes)}`,
            totalPnL,
            marketCommentary: recap.marketCommentary,
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
      autoHeight: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' }
    },
    {
      field: 'dailyPnL',
      headerName: 'Daily P&L',
      width: 180,
      wrapText: true,
      autoHeight: true
    },
    {
      field: 'totalPnL',
      headerName: 'Total P&L',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
      cellStyle: (params) => ({
        color: params.value >= 0 ? 'green' : 'red',
        fontWeight: 'bold'
      })
    },
    {
      field: 'marketCommentary',
      headerName: 'Market Commentary',
      flex: 1,
      minWidth: 300,
      wrapText: true,
      autoHeight: true,
      cellStyle: { whiteSpace: 'normal', lineHeight: '1.4' }
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
                <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
                  <AgGridReact
                    rowData={filteredData}
                    columnDefs={columnDefs}
                    onGridReady={onGridReady}
                    pagination={true}
                    paginationPageSize={20}
                    domLayout="normal"

                    rowSelection="single"
                    onRowClicked={(event) => {
                      if (event.data.reportData && onReportSelect) {
                        onReportSelect(event.data.reportData);
                      }
                    }}
                    getRowStyle={(params) => {
                      if (params.data.sector === 'APAC Overall') {
                        return { backgroundColor: '#334155', fontWeight: 'bold' };
                      }
                      return undefined;
                    }}
                  />
                </div>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
};
