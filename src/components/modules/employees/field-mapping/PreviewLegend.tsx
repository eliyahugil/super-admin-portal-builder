
import React from 'react';

export const PreviewLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
        <span>ממופה, ערכים ריקים</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
        <span>לא ממופה, יש ערכים</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
        <span>ממופה תקין</span>
      </div>
    </div>
  );
};
