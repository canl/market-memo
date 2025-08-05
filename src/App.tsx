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
  IconButton
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { DailyReport, SectorRecap, APACComments } from './types';
import { Sidebar } from './components/Sidebar';
import { TraderInputView, DailySummaryView, HistoricalDataView } from './components/views';
import { NotificationProvider, useNotification } from './components/NotificationProvider';
import { DataService } from './services/dataService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

function AppContent() {
  const [currentReport, setCurrentReport] = useState<DailyReport | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showSuccess } = useNotification();

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2'
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
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Credit Market Memo
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {new Date().toLocaleDateString()}
          </Typography>

          {/* User Avatar Placeholder */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', display: { xs: 'none', sm: 'block' } }}>
              John Doe
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.25)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Typography variant="body1" sx={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
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
                />
              }
            />
            <Route path="/historical-data" element={<HistoricalDataView />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
