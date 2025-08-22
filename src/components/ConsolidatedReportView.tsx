import { forwardRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Unstable_Grid2 as Grid,
  Paper,
  Button,
  Stack
} from '@mui/material';

import { DailyReport } from '../types';
import { SECTOR_LABELS } from '../constants/sectors';
import { formatDate, formatCurrency } from '../utils/formatters';

interface ConsolidatedReportViewProps {
  report: DailyReport;
  onExportPDF?: () => void;
  onSendEmail?: () => void;
  onPrint?: () => void;
}

export const ConsolidatedReportView = forwardRef<HTMLDivElement, ConsolidatedReportViewProps>(
  ({ report, onExportPDF, onSendEmail, onPrint }, ref) => {
    const totalPnL = report.apacComments.pnl;

    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              Consolidated Daily Report
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={onPrint}
                size="small"
              >
                Print
              </Button>
              <Button
                variant="outlined"
                onClick={onExportPDF}
                size="small"
              >
                Export PDF
              </Button>
              <Button
                variant="contained"
                onClick={onSendEmail}
                size="small"
              >
                Send to Desk
              </Button>
            </Stack>
          </Box>

          <div ref={ref}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                border: '1px solid #e0e0e0',
                '@media print': {
                  boxShadow: 'none',
                  border: 'none'
                }
              }}
            >
              {/* Header */}
              <Box textAlign="center" mb={4}>
                <Typography variant="h4" gutterBottom>
                  APAC Market Memo
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {formatDate(report.date)}
                </Typography>
              </Box>

              {/* APAC Overall Comments */}
              <Box mb={4}>
                <Typography variant="h5" gutterBottom color="primary">
                  APAC Overall Comments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} mb={2}>
                  <Grid xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Risk
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {report.apacComments.risk}
                    </Typography>
                  </Grid>

                  <Grid xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      P&L
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={totalPnL >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(totalPnL)}
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}(Risk: {formatCurrency(report.apacComments.risk)},
                        Volumes: {formatCurrency(report.apacComments.volumes)})
                      </Typography>
                    </Typography>
                  </Grid>

                  <Grid xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Volumes
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {report.apacComments.volumes}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Sector Recaps */}
              {report.sectorRecaps.map((recap, index) => (
                <Box key={recap.sector} mb={4}>
                  <Typography variant="h5" gutterBottom color="primary">
                    {SECTOR_LABELS[recap.sector]}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={3}>
                    <Grid xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Market Moves and Flows
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {recap.marketMovesAndFlows || 'No market moves reported.'}
                      </Typography>
                    </Grid>

                    <Grid xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Daily P&L
                      </Typography>
                      <Typography variant="body1" paragraph>
                        P&L: {formatCurrency(recap.metrics.pnl)}, Risk: {formatCurrency(recap.metrics.risk)}, Volumes: {formatCurrency(recap.metrics.volumes)}
                      </Typography>
                    </Grid>

                    <Grid xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Market Commentary
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                        {recap.marketCommentary || 'No market Commentary provided.'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {index < report.sectorRecaps.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}

              {/* Footer */}
              <Box 
                mt={6} 
                pt={3} 
                borderTop="1px solid #e0e0e0"
                textAlign="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Generated on {new Date().toLocaleString()} | 
                  Last modified: {new Date(report.lastModified).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </div>
        </CardContent>
      </Card>
    );
  }
);
