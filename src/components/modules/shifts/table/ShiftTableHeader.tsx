
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Calendar, Users } from 'lucide-react';

interface ShiftTableHeaderProps {
  totalShifts: number;
  filteredCount: number;
  onExport?: () => void;
  onImport?: () => void;
  onCreateShift?: () => void;
  onBulkAssign?: () => void;
}

export const ShiftTableHeader: React.FC<ShiftTableHeaderProps> = ({
  totalShifts,
  filteredCount,
  onExport,
  onImport,
  onCreateShift,
  onBulkAssign
}) => {
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-2xl font-bold">ניהול משמרות</CardTitle>
          <p className="text-gray-600 mt-1">
            מציג {filteredCount} מתוך {totalShifts} משמרות
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
