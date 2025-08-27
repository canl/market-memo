import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import { Box, useTheme } from '@mui/material';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your commentary...",
  height = 200,
  disabled = false
}) => {
  const theme = useTheme();

  // Dynamic colors based on theme mode
  const textColor = theme.palette.mode === 'dark' ? '#ffffff' : '#000000';

  return (
    <Box
      sx={{
        // Main editor container
        '& .w-md-editor': {
          backgroundColor: `${theme.palette.background.paper} !important`,
          border: `1px solid ${theme.palette.divider} !important`,
          borderRadius: `${theme.shape.borderRadius}px !important`,
        },
      }}
    >
      <div data-color-mode={theme.palette.mode}>
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || '')}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
          textareaProps={{
            placeholder,
            disabled,
            style: {
              fontSize: '1rem',
              lineHeight: 1.6,
              fontFamily: theme.typography.body1.fontFamily,
            },
          }}
          height={height}
        />
      </div>
    </Box>
  );
};
