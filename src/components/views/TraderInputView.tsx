import React, { useState } from 'react';
import { EnhancedTraderInput } from '../TraderInput';
import { SectorRecap, APACComments } from '../../types';

interface TraderInputViewProps {
  onSave: (recap: SectorRecap) => void;
  onAPACSave: (comments: APACComments) => void;
}

export const TraderInputView: React.FC<TraderInputViewProps> = ({
  onSave,
  onAPACSave
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <EnhancedTraderInput
      onSave={onSave}
      onAPACSave={onAPACSave}
      selectedDate={selectedDate}
      onDateChange={setSelectedDate}
    />
  );
};
