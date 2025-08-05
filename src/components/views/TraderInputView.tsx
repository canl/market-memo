import React, { useState } from 'react';
import { EnhancedTraderInput } from '../TraderInput';
import { SectorRecap, APACComments } from '../../types';

interface TraderInputViewProps {
  onSave: (recap: SectorRecap) => void;
  onSubmit: (recap: SectorRecap) => void;
  onAPACSave: (comments: APACComments) => void;
  onAPACSubmit: (comments: APACComments) => void;
}

export const TraderInputView: React.FC<TraderInputViewProps> = ({
  onSave,
  onSubmit,
  onAPACSave,
  onAPACSubmit
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <EnhancedTraderInput
      onSave={onSave}
      onSubmit={onSubmit}
      onAPACSave={onAPACSave}
      onAPACSubmit={onAPACSubmit}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
};
