
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Calendar, Users, Check } from 'lucide-react';

interface ShiftTableHeaderProps {
  totalShifts: number;
  filteredCount: number;
  newShiftsCount?: number;
  onExport?: () => void;
  onImport?: () => void;
  onCreateShift?: () => void;
  onBulkAssign?: () => void;
  onMarkAllAsSeen?: () => void;
}

export const ShiftTableHeader: React.FC<ShiftTableHeaderProps> = ({
  totalShifts,
  filteredCount,
  newShiftsCount = 0,
  onExport,
  onImport,
  onCreateShift,
  onBulkAssign,
  onMarkAllAsSeen
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-2xl font-bold">ניהול משמרות</CardTitle>
          <p className="text-gray-600 mt-1">
            מציג {filteredCount} מתוך {totalShifts} משמרות
            {newShiftsCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mr-2">
                {newShiftsCount} חדשות
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {newShiftsCount > 0 && onMarkAllAsSeen && (
            <Button 
              onClick={onMarkAllAsSeen} 
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Check className="mr-2 h-4 w-4" />
              סמן הכל כנצפה ({newShiftsCount})
            </Button>
          )}
          
          {onCreateShift && (
            <Button onClick={onCreateShift} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              משמרת חדשה
            </Button>
          )}
          
          {onBulkAssign && (
            <Button variant="outline" onClick={onBulkAssign}>
              <Users className="mr-2 h-4 w-4" />
              שיוך קבוצתי
            </Button>
          )}
          
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              יצוא
            </Button>
          )}
          
          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="mr-2 h-4 w-4" />
              יבוא
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
};
