import React from 'react';
import { Box, useTheme, SxProps, Theme } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';

interface RichTextDisplayProps {
  content: string;
  sx?: SxProps<Theme>;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ content, sx = {} }) => {
  const theme = useTheme();

  // Check if content contains markdown syntax
  const isMarkdownContent = /[*_#\-+[\]]/i.test(content);

  // If it's plain text, just display it normally
  if (!isMarkdownContent) {
    return (
      <Box sx={sx}>
        {content}
      </Box>
    );
  }

  // For markdown content, render with MDEditor preview
  return (
    <Box>
      <div data-color-mode={theme.palette.mode}>
        <MDEditor.Markdown source={content} />
      </div>
    </Box>
  );
};
