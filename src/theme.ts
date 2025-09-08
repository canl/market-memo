import { createTheme } from '@mui/material/styles';

const createAppTheme = (isDarkMode: boolean) => createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    primary: {
      main: '#fb8b1e', // Professional orange
    },
    secondary: {
      main: '#059669', // Professional green
    },
    background: {
      default: isDarkMode ? '#0f172a' : '#f8fafc', // Dark slate / Light gray
      paper: isDarkMode ? '#1e293b' : '#ffffff', // Slightly lighter paper / White
    },
    text: {
      primary: isDarkMode ? '#f8fafc' : '#1e293b', // Clean white / Dark slate
      secondary: isDarkMode ? '#cbd5e1' : '#64748b', // Light gray / Medium gray
    },
    info: {
      main: '#0ea5e9', // Sky blue
    },
    success: {
      main: '#10b981', // Emerald green
    },
    error: {
      main: '#ef4444', // Clean red
    },
    warning: {
      main: '#f59e0b', // Amber
    },
    divider: isDarkMode ? '#334155' : '#e2e8f0', // Subtle divider
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      color: '#f8fafc',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      color: '#f8fafc',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#f8fafc',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#f8fafc',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#f8fafc',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#f8fafc',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#f8fafc',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8rem',
      color: '#cbd5e1',
      lineHeight: 1.4,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',
          color: '#f8fafc',
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: isDarkMode
            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
            : '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          boxShadow: isDarkMode
            ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          boxShadow: isDarkMode
            ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
            color: isDarkMode ? '#f8fafc' : '#1e293b',
            borderRadius: '0.375rem',
            '& fieldset': {
              borderColor: isDarkMode ? '#475569' : '#d1d5db',
            },
            '&:hover fieldset': {
              borderColor: isDarkMode ? '#64748b' : '#9ca3af',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#fb8b1e',
              borderWidth: '2px',
            },
            // Date input specific styling
            '& input[type="date"]': {
              colorScheme: isDarkMode ? 'dark' : 'light',
              position: 'relative',
              '&::-webkit-calendar-picker-indicator': {
                filter: isDarkMode ? 'invert(1) brightness(2) contrast(2) saturate(0)' : 'none',
                cursor: 'pointer',
                opacity: isDarkMode ? 1 : 0.8,
                backgroundColor: isDarkMode ? 'rgba(248, 250, 252, 0.15)' : 'transparent',
                borderRadius: '4px',
                padding: '3px',
                border: isDarkMode ? '1px solid rgba(248, 250, 252, 0.2)' : 'none',
                '&:hover': {
                  opacity: 1,
                  backgroundColor: isDarkMode ? 'rgba(248, 250, 252, 0.25)' : 'rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.05)',
                },
              },
              '&::-webkit-inner-spin-button': {
                display: 'none',
              },
              '&::-webkit-clear-button': {
                display: 'none',
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: isDarkMode ? '#94a3b8' : '#6b7280',
            fontSize: '0.875rem',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#fb8b1e',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
        },
        contained: {
          backgroundColor: '#2563eb',
          color: '#ffffff',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          '&:hover': {
            backgroundColor: '#1d4ed8',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
        outlined: {
          borderColor: isDarkMode ? '#475569' : '#d1d5db',
          color: isDarkMode ? '#f8fafc' : '#374151',
          '&:hover': {
            borderColor: isDarkMode ? '#64748b' : '#9ca3af',
            backgroundColor: isDarkMode ? 'rgba(248, 250, 252, 0.05)' : 'rgba(55, 65, 81, 0.05)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#334155',
            color: '#f8fafc',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderBottom: '1px solid #475569',
            textTransform: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #334155',
          fontSize: '0.875rem',
          color: '#f8fafc',
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(248, 250, 252, 0.05)',
          },
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(248, 250, 252, 0.02)',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#f8fafc',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#475569',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#64748b',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563eb',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          color: '#f8fafc',
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: '#334155',
          },
          '&.Mui-selected': {
            backgroundColor: '#2563eb',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '0.375rem',
          fontSize: '0.75rem',
          fontWeight: 500,
        },
      },
    },
  },
});

export default createAppTheme;
