import React from 'react';
import { Box, Typography } from '@mui/material';
import { IGOnlyMetrics, IGAndHYMetrics } from '../types';

interface MetricsBreakdownProps {
  metrics: IGOnlyMetrics | IGAndHYMetrics;
  modelType: 'IG Only' | 'IG & HY';
}

/**
 * MetricsBreakdown Component
 * 
 * Displays a detailed breakdown of P&L, Risk, and Volume metrics for IG & HY sectors.
 * Groups metrics by Cash (IG, HY, LCT) and CDS, with smart zero suppression.
 * 
 * @param metrics - The metrics data (IGOnlyMetrics or IGAndHYMetrics)
 * @param modelType - The sector model type ('IG Only' or 'IG & HY')
 */
export const MetricsBreakdown: React.FC<MetricsBreakdownProps> = ({ metrics, modelType }) => {
  if (modelType === 'IG Only') {
    // For IG Only sectors, no breakdown is needed as per requirements
    return null;
  }

  const igHyMetrics = metrics as IGAndHYMetrics;
  
  // Calculate Cash totals (IG + HY + LCT)
  const cashPnl = igHyMetrics.ig.pnl + igHyMetrics.hy.pnl + igHyMetrics.lct.pnl;
  const cashRisk = igHyMetrics.ig.risk + igHyMetrics.hy.risk + igHyMetrics.lct.risk;
  const cashVolumes = igHyMetrics.ig.volumes + igHyMetrics.hy.volumes + igHyMetrics.lct.volumes;

  // CDS totals
  const cdsPnl = igHyMetrics.cds.pnl;
  const cdsRisk = igHyMetrics.cds.risk;
  const cdsVolumes = igHyMetrics.cds.volumes;

  /**
   * Formats a numeric value with thousand separators and 'k' suffix
   * @param value - The numeric value to format
   * @returns Formatted string (e.g., "+1,200k", "-500k")
   */
  const formatValueK = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    const absValue = Math.abs(value);
    const valueInK = absValue / 1000;
    const formattedValue = valueInK.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${sign}${formattedValue}k`;
  };

  /**
   * Formats individual credit type values with smart zero suppression
   * Hides zero values unless all values are zero (then shows all)
   * @param ig - IG value
   * @param hy - HY value  
   * @param lct - LCT value
   * @returns Formatted string with conditional display
   */
  const formatCreditTypeValues = (ig: number, hy: number, lct: number) => {
    const values = [];
    if (ig !== 0) values.push(`IG: ${formatValueK(ig)}`);
    if (hy !== 0) values.push(`HY: ${formatValueK(hy)}`);
    if (lct !== 0) values.push(`LCT: ${formatValueK(lct)}`);
    
    // If all are zero, show them all with proper formatting
    if (values.length === 0) {
      return `(IG: ${formatValueK(ig)}, HY: ${formatValueK(hy)}, LCT: ${formatValueK(lct)})`;
    }
    
    return `(${values.join(', ')})`;
  };

  // Check if any metrics have non-zero values
  const hasAnyMetrics = cashPnl !== 0 || cdsPnl !== 0 || cashRisk !== 0 || cdsRisk !== 0 || cashVolumes !== 0 || cdsVolumes !== 0;

  if (!hasAnyMetrics) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
        Metrics Breakdown:
      </Typography>
      
      {/* P&L Breakdown */}
      {(cashPnl !== 0 || cdsPnl !== 0) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" color="success.main" gutterBottom>
            P&L:
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • Cash: {formatValueK(cashPnl)} 
              <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                {formatCreditTypeValues(igHyMetrics.ig.pnl, igHyMetrics.hy.pnl, igHyMetrics.lct.pnl)}
              </Box>
            </Typography>
            {cdsPnl !== 0 && (
              <Typography variant="body2">
                • CDS: {formatValueK(cdsPnl)}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Risk Breakdown */}
      {(cashRisk !== 0 || cdsRisk !== 0) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" color="error.main" gutterBottom>
            Risk:
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • Cash: {formatValueK(cashRisk)} 
              <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                {formatCreditTypeValues(igHyMetrics.ig.risk, igHyMetrics.hy.risk, igHyMetrics.lct.risk)}
              </Box>
            </Typography>
            {cdsRisk !== 0 && (
              <Typography variant="body2">
                • CDS: {formatValueK(cdsRisk)}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* Volume Breakdown */}
      {(cashVolumes !== 0 || cdsVolumes !== 0) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" color="info.main" gutterBottom>
            Volume:
          </Typography>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              • Cash: {formatValueK(cashVolumes)} 
              <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
                {formatCreditTypeValues(igHyMetrics.ig.volumes, igHyMetrics.hy.volumes, igHyMetrics.lct.volumes)}
              </Box>
            </Typography>
            {cdsVolumes !== 0 && (
              <Typography variant="body2">
                • CDS: {formatValueK(cdsVolumes)}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};
