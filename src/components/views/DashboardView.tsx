import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Dashboard } from '../Dashboard';
import { SectorInputModal } from '../SectorInputModal';
import { APACInputModal } from '../APACInputModal';
import { Sector, SectorRecap, APACComments } from '../../types';
import { InMemoryStorage } from '../../services/dataService';

interface DashboardViewProps {
  onNavigateToReports: () => void;
  onNavigateToHistory: () => void;
  onSectorSave: (recap: SectorRecap) => void;
  onAPACSave: (comments: APACComments) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToReports,
  onNavigateToHistory,
  onSectorSave,
  onAPACSave
}) => {
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [apacModalOpen, setApacModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Clear session data only once per browser session (on page refresh)
  useEffect(() => {
    const sessionKey = 'dashboard_session_initialized';
    const isSessionInitialized = sessionStorage.getItem(sessionKey);

    if (!isSessionInitialized) {
      // This is a fresh browser session (page refresh or new tab)
      InMemoryStorage.clearTodaysData();
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, []);

  const handleSectorEdit = (sector: Sector) => {
    setSelectedSector(sector);
    setSectorModalOpen(true);
  };

  const handleAPACEdit = () => {
    setApacModalOpen(true);
  };

  const handleSectorModalClose = () => {
    setSectorModalOpen(false);
    setSelectedSector(null);
  };

  const handleAPACModalClose = () => {
    setApacModalOpen(false);
  };

  const handleSectorSave = (recap: SectorRecap) => {
    onSectorSave(recap);
    // Trigger dashboard refresh
    setRefreshTrigger(prev => prev + 1);
    // Modal will close automatically after save
  };

  const handleAPACSave = (comments: APACComments) => {
    onAPACSave(comments);
    // Trigger dashboard refresh (same as sector save)
    setRefreshTrigger(prev => prev + 1);
    // Modal will close automatically after save
  };

  return (
    <Box>
      <Dashboard
        onSectorEdit={handleSectorEdit}
        onViewReports={onNavigateToReports}
        onViewHistory={onNavigateToHistory}
        onAPACEdit={handleAPACEdit}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        refreshTrigger={refreshTrigger}
      />

      <SectorInputModal
        open={sectorModalOpen}
        sector={selectedSector}
        onClose={handleSectorModalClose}
        onSave={handleSectorSave}
      />

      <APACInputModal
        open={apacModalOpen}
        onClose={handleAPACModalClose}
        onSave={handleAPACSave}
      />
    </Box>
  );
};
