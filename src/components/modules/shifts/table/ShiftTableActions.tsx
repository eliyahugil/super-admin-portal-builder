
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, X, Clock, User, Calendar } from 'lucide-react';
import type { ShiftData } from './types';

interface ShiftTableActionsProps {
  shift: ShiftData;
  onStatusUpdate: (shiftId: string, newStatus: string) => void;
  onAssignEmployee?: (shiftId: string) => void;
  onScheduleChange?: (shiftId: string) => void;
}

export const ShiftTableActions: React.FC<ShiftTableActionsProps> = ({
  shift,
  onStatusUpdate,
  onAssignEmployee,
  onScheduleChange
}) => {
  const canApprove = shift.status === 'pending';
  const canReject = shift.status === 'pending' || shift.status === 'approved';
  const canComplete = shift.status === 'approved';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
        {canApprove && (
          <DropdownMenuItem onClick={() => onStatusUpdate(shift.id, 'approved')}>
            <Check className="mr-2 h-4 w-4" />
            אשר משמרת
          </DropdownMenuItem>
        )}
        {canReject && (
          <DropdownMenuItem onClick={() => onStatusUpdate(shift.id, 'rejected')}>
            <X className="mr-2 h-4 w-4" />
            דחה משמרת
          </DropdownMenuItem>
        )}
        {canComplete && (
          <DropdownMenuItem onClick={() => onStatusUpdate(shift.id, 'completed')}>
            <Clock className="mr-2 h-4 w-4" />
            סמן כהושלם
          </DropdownMenuItem>
        )}
        {onAssignEmployee && (
          <DropdownMenuItem onClick={() => onAssignEmployee(shift.id)}>
            <User className="mr-2 h-4 w-4" />
            שייך עובד
          </DropdownMenuItem>
        )}
        {onScheduleChange && (
          <DropdownMenuItem onClick={() => onScheduleChange(shift.id)}>
            <Calendar className="mr-2 h-4 w-4" />
            שנה זמנים
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
