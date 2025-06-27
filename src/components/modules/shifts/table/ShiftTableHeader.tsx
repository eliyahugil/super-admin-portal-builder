
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users } from 'lucide-react';

interface ShiftTableHeaderProps {
  totalShifts: number;
  filteredCount: number;
}

export const ShiftTableHeader: React.FC<ShiftTableHeaderProps> = ({
  totalShifts,
  filteredCount
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle className="text-2xl">טבלת משמרות</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              ניהול וצפייה במשמרות העובדים
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>מציג {filteredCount} מתוך {totalShifts} משמרות</span>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
