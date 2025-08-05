import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { DailyReport, SectorRecap, APACComments } from './types';
import { Sidebar } from './components/Sidebar';
import { TraderInputView, DailySummaryView, HistoricalDataView } from './components/views';
import { NotificationProvider, useNotification } from './components/NotificationProvider';
import { DataService } from './services/dataService';
import './App.css';

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

function AppContent() {
  const [currentReport, setCurrentReport] = useState<DailyReport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { showSuccess } = useNotification();

  const theme = createAppTheme(isDarkMode);

  // Set theme attribute on document body for CSS targeting
  React.useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialize or load current report
  React.useEffect(() => {
    let report = DataService.getCurrentReport();
    if (!report) {
      // Initialize with sample data for demo
      report = DataService.initializeTodayWithSample();
    }
    setCurrentReport(report);
  }, []);

  const handleSectorRecapSave = (recap: SectorRecap) => {
    if (!currentReport) return;

    const updatedReport = {
      ...currentReport,
      sectorRecaps: [
        ...currentReport.sectorRecaps.filter(r => r.sector !== recap.sector),
        recap
      ],
      lastModified: new Date().toISOString()
    };

    setCurrentReport(updatedReport);
    DataService.saveCurrentReport(updatedReport);
    showSuccess(`${recap.sector} recap saved successfully!`);
  };

  const handleAPACCommentsSave = (comments: APACComments) => {
    if (!currentReport) return;

    const updatedReport = {
      ...currentReport,
      apacComments: comments,
      lastModified: new Date().toISOString()
    };

    setCurrentReport(updatedReport);
    DataService.saveCurrentReport(updatedReport);
    showSuccess('APAC comments saved successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    // For now, use the browser's print to PDF functionality
    // This can be enhanced with a dedicated PDF library later
    window.print();
  };

  const handleSendEmail = () => {
    // Placeholder for email functionality
    showSuccess('Email functionality will be implemented soon');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle navigation"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            edge="start"
            sx={{
              mr: 2,
              color: '#f8fafc',
              backgroundColor: 'transparent',
              borderRadius: '0.375rem',
              '&:hover': {
                backgroundColor: 'rgba(248, 250, 252, 0.1)',
              }
            }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
            <img
              src="/memo.png"
              alt="Memo"
              style={{
                width: '26px',
                height: '26px',
                // filter: isDarkMode ? 'brightness(0) invert(1)' : 'none'
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: isDarkMode ? '#f8fafc' : '#1e293b',
                fontWeight: 600,
                fontSize: '1.125rem'
              }}
            >
              Credit Market Memo
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  animation: 'pulse 2s infinite'
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: '#10b981',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Live
              </Typography>
            </Box>

            {/* Theme Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={(e) => setIsDarkMode(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-thumb': {
                      backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: isDarkMode ? '#475569' : '#cbd5e1',
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isDarkMode ? <DarkModeIcon sx={{ fontSize: 16, color: '#cbd5e1' }} /> : <LightModeIcon sx={{ fontSize: 16, color: '#64748b' }} />}
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#cbd5e1' : '#64748b' }}>
                    {isDarkMode ? 'Dark' : 'Light'}
                  </Typography>
                </Box>
              }
              sx={{ ml: 1 }}
            />
            <Typography
              variant="body2"
              sx={{
                color: '#cbd5e1',
                fontSize: '0.875rem'
              }}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#cbd5e1',
                fontSize: '0.875rem',
                fontFamily: '"JetBrains Mono", "Consolas", monospace'
              }}
            >
              {new Date().toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>

          {/* User Avatar Placeholder */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#cbd5e1',
                display: { xs: 'none', sm: 'block' },
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              John Doe
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                }
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                JD
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Layout with Sidebar and Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: '64px' }}>
        <Sidebar open={sidebarOpen} />

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: 'calc(100vh - 64px)',
            overflow: 'auto'
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/trader-input" replace />} />
            <Route
              path="/trader-input"
              element={
                <TraderInputView
                  onSave={handleSectorRecapSave}
                  onSubmit={handleSectorRecapSave}
                  onAPACSave={handleAPACCommentsSave}
                  onAPACSubmit={handleAPACCommentsSave}
                />
              }
            />
            <Route
              path="/daily-summary"
              element={
                <DailySummaryView
                  report={currentReport || undefined}
                  onPrint={handlePrint}
                  onExportPDF={handleExportPDF}
                  onSendEmail={handleSendEmail}
                />
              }
            />
            <Route path="/historical-data" element={<HistoricalDataView />} />
          </Routes>
        </Box>
      </Box>
    </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </Router>
  );
}

export default App;
