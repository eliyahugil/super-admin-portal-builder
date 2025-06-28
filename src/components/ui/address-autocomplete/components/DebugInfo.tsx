
import React from 'react';

interface DebugInfoProps {
  isOpen: boolean;
  suggestionsCount: number;
  isReady: boolean;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({
  isOpen,
  suggestionsCount,
  isReady,
}) => {
  // Debug info - remove in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="text-xs text-gray-400 mt-1">
      Debug: {isReady ? '✅' : '❌'} Google Maps | 
      {isOpen ? ' 📂' : ' 📁'} Dropdown | 
      📋 {suggestionsCount} הצעות
    </div>
  );
};
