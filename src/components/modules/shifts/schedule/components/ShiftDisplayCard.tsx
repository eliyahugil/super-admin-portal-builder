import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, User, MapPin, Trash2, AlertTriangle } from 'lucide-react';
import type { ShiftScheduleData } from '../types';

interface ShiftDisplayCardProps {
  shift: ShiftScheduleData;
  hasConflict: boolean;
  isSelectionMode: boolean;
  isSelected: boolean;
  onShiftClick: (shift: ShiftScheduleData) => void;
  onShiftSelection?: (shift: ShiftScheduleData, selected: boolean, event?: React.MouseEvent) => void;
  onDeleteShift: (shiftId: string, event: React.MouseEvent) => void;
  getEmployeeName: (employeeId: string) => string;
  getStatusColor: (status: string) => string;
  shiftType: 'morning' | 'evening' | 'night';
}

export const ShiftDisplayCard: React.FC<ShiftDisplayCardProps> = ({
  shift,
  hasConflict,
  isSelectionMode,
  isSelected,
  onShiftClick,
  onShiftSelection,
  onDeleteShift,
  getEmployeeName,
  getStatusColor,
  shiftType
}) => {
  // Debug logs
  console.log('🔍 ShiftDisplayCard render:', {
    shiftId: shift.id,
    isSelectionMode,
    isSelected,
    hasOnShiftSelection: !!onShiftSelection
  });
  const handleShiftCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onShiftSelection) {
      e.preventDefault();
      e.stopPropagation();
      onShiftSelection(shift, !isSelected, e);
    } else {
      onShiftClick(shift);
    }
  };

  const handleShiftSelectionChange = (checked: boolean) => {
    if (onShiftSelection) {
      const mockEvent = {
        preventDefault: () => {},
        stopPropagation: () => {}
      } as React.MouseEvent;
      onShiftSelection(shift, !!checked, mockEvent);
    }
  };

  const getShiftTypeColor = () => {
    switch (shiftType) {
      case 'morning':
        return 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 via-amber-25 to-white hover:from-amber-100';
      case 'evening':
        return 'border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 via-orange-25 to-white hover:from-orange-100';
      case 'night':
        return 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 via-purple-25 to-white hover:from-purple-100';
      default:
        return 'border-l-4 border-l-gray-400 bg-gradient-to-r from-gray-50 to-white';
    }
  };

  const getShiftTypeLabel = () => {
    switch (shiftType) {
      case 'morning':
        return 'בוקר';
      case 'evening':
        return 'ערב';
      case 'night':
        return 'לילה';
      default:
        return '';
    }
  };

  return (
    <div
      className={`relative group p-3 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 ${
        getShiftTypeColor()
      } ${hasConflict ? 'border-red-300 bg-red-50' : ''} ${
        isSelectionMode && isSelected ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300 scale-105' : ''
      } ${isSelectionMode ? 'transform hover:scale-102' : ''}`}
      onClick={handleShiftCardClick}
    >
      {/* סוג משמרת - קטן ובפינה */}
      <div className="absolute top-1 left-1">
        <Badge 
          variant="outline" 
          className={`text-[10px] px-1 py-0 h-4 ${
            shiftType === 'morning' ? 'bg-amber-100 text-amber-700 border-amber-300' :
            shiftType === 'evening' ? 'bg-orange-100 text-orange-700 border-orange-300' :
            'bg-purple-100 text-purple-700 border-purple-300'
          }`}
        >
          {getShiftTypeLabel()}
        </Badge>
      </div>

      {/* Selection checkbox - appears in selection mode */}
      {isSelectionMode && (
        <div className="absolute top-2 right-2 z-20 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className={`p-1 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-white shadow-md border-2 border-blue-300'} transition-all duration-200`}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleShiftSelectionChange}
              className="h-5 w-5 border-0 data-[state=checked]:bg-transparent data-[state=checked]:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      {/* Delete button - appears on hover when not in selection mode */}
      {!isSelectionMode && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => onDeleteShift(shift.id, e)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
      
      <div className="space-y-2 mt-4">
        {/* סניף - ראשון ובולט */}
        {shift.branch_name && (
          <div className="flex items-center justify-center">
            <Badge className="bg-blue-600 text-white font-medium px-3 py-1 shadow-sm">
              <MapPin className="h-3 w-3 ml-1" />
              {shift.branch_name}
            </Badge>
          </div>
        )}
        
        {/* שעות משמרת - שני */}
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="bg-white border-2 font-medium px-3 py-1 shadow-sm">
            <Clock className="h-3 w-3 ml-1" />
            {shift.start_time} - {shift.end_time}
          </Badge>
        </div>
        
        {/* עובד מוקצה או לא מוקצה - שלישי */}
        <div className="flex items-center justify-center">
          {shift.employee_id ? (
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 shadow-sm">
              <User className="h-3 w-3 ml-1" />
              {getEmployeeName(shift.employee_id)}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 px-3 py-1 shadow-sm">
              <User className="h-3 w-3 ml-1" />
              לא מוקצה
            </Badge>
          )}
        </div>

        {/* תפקיד - אם קיים */}
        {shift.role && (
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 px-2 py-1 text-xs">
              {shift.role}
            </Badge>
          </div>
        )}
      </div>
      
      {/* סטטוס וקונפליקטים - רביעי במטה */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <Badge variant="secondary" className={`${getStatusColor(shift.status || 'pending')} text-xs shadow-sm`}>
          {shift.status === 'approved' ? 'מאושר' : 
           shift.status === 'pending' ? 'ממתין' :
           shift.status === 'rejected' ? 'נדחה' : 'הושלם'}
        </Badge>
        {hasConflict && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" />
            <span className="text-xs text-red-500 font-medium">התנגשות</span>
          </div>
        )}
      </div>
    </div>
  );
};