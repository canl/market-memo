import React from 'react';
import { TextField } from '@mui/material';

interface SimpleDateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export const SimpleDateInput: React.FC<SimpleDateInputProps> = ({
  label,
  value,
  onChange,
  fullWidth = false,
  size = 'medium'
}) => {
  return (
    <TextField
      type="date"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth={fullWidth}
      size={size}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );
};
