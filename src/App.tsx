import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  ThemeProvider,
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
import { DashboardView, DailySummaryView, HistoricalDataView } from './components/views';
import { NotificationProvider, useNotification } from './components/NotificationProvider';
import { DataService } from './services/dataService';
import './App.css';
import createAppTheme from './theme';


function AppContent() {
  const navigate = useNavigate();
  const [currentReport, setCurrentReport] = useState<DailyReport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { showSuccess } = useNotification();

  // Clear old data structure on app start
  useEffect(() => {
    DataService.clearOldData();
  }, []);

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
              Market Memo
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardView
                  onNavigateToReports={() => navigate('/daily-summary')}
                  onNavigateToHistory={() => navigate('/historical-data')}
                  onSectorSave={handleSectorRecapSave}
                  onAPACSave={handleAPACCommentsSave}
                />
              }
            />

            <Route
              path="/daily-summary"
              element={
                <DailySummaryView
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
