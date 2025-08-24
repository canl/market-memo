import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  Create as TraderInputIcon,
  EventNote as DailySummaryIcon,
  Insights as HistoricalDataIcon
} from '@mui/icons-material';


export type NavigationView = 'trader-input' | 'daily-consolidation' | 'historical-data';

interface SidebarProps {
  open: boolean;
}

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;

interface NavigationItem {
  id: NavigationView;
  label: string;
  icon: React.ReactNode;
  description: string;
  path: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'trader-input',
    label: 'Trader Input',
    icon: <TraderInputIcon />,
    description: 'Enter daily market recaps and P&L data',
    path: '/trader-input'
  },
  {
    id: 'daily-consolidation',
    label: 'Daily Consolidation',
    icon: <DailySummaryIcon />,
    description: 'View and export consolidated daily reports',
    path: '/daily-summary'
  },
  {
    id: 'historical-data',
    label: 'Historical Data',
    icon: <HistoricalDataIcon />,
    description: 'Browse historical market recaps and data',
    path: '/historical-data'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  open
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentView = (): NavigationView => {
    const currentPath = location.pathname;
    const item = navigationItems.find(item => item.path === currentPath);
    return item?.id || 'trader-input';
  };

  const currentView = getCurrentView();
  const drawerWidth = open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          borderRight: '1px solid #334155',
          backgroundColor: '#1e293b',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          zIndex: (theme) => theme.zIndex.drawer,
          marginTop: '64px', // Height of the AppBar
          height: 'calc(100vh - 64px)' // Full height minus AppBar
        },
      }}
    >


      {/* Navigation Items */}
      <List sx={{ pt: 3 }}>
        {navigationItems.map((item) => (
          <Tooltip
            key={item.id}
            title={open ? '' : item.label}
            placement="right"
            arrow
          >
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={currentView === item.id}
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: '0.5rem',
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  color: '#f8fafc',
                  '&.Mui-selected': {
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                    '&:hover': {
                      backgroundColor: '#1d4ed8',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(248, 250, 252, 0.05)',
                    transform: 'translateX(2px)',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    color: currentView === item.id ? '#ffffff' : '#cbd5e1',
                    opacity: 0.9,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.25rem'
                    }
                  }}
                >
                  {item.icon}
                </Box>
                {open && (
                  <Box sx={{ overflow: 'hidden' }}>
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: currentView === item.id ? '#ffffff' : '#f8fafc',
                        noWrap: true
                      }}
                      secondaryTypographyProps={{
                        fontSize: '0.75rem',
                        noWrap: true,
                        sx: {
                          color: currentView === item.id ? 'rgba(255, 255, 255, 0.8)' : '#94a3b8'
                        }
                      }}
                    />
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {/* Footer */}
      {open && (
        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Trading Desk POC
          </Typography>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            v1.0.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};
