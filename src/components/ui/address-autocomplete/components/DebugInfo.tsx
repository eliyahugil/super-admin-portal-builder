
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
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="text-xs text-gray-400 mt-1">
      Debug: isOpen={isOpen.toString()}, suggestions={suggestionsCount}, isReady={isReady.toString()}
    </div>
  );
};
