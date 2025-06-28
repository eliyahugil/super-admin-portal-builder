
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShiftTableActions } from './ShiftTableActions';
import type { ShiftData, ShiftSortBy, SortOrder } from './types';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ShiftTableContentProps {
  shifts: ShiftData[];
  sortBy: ShiftSortBy;
  sortOrder: SortOrder;
  onSort: (field: ShiftSortBy) => void;
  onStatusUpdate: (shiftId: string, newStatus: string) => void;
  onRefetch: () => void;
  currentPage: number;
  pageSize: number;
}

export const ShiftTableContent: React.FC<ShiftTableContentProps> = ({
  shifts,
  sortBy,
  sortOrder,
  onSort,
  onStatusUpdate,
  onRefetch,
  currentPage,
  pageSize
}) => {
  const getSortIcon = (field: ShiftSortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="ml-2 h-4 w-4" /> : 
      <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'ממתין', variant: 'secondary' as const },
      approved: { label: 'מאושר', variant: 'default' as const },
      rejected: { label: 'נדחה', variant: 'destructive' as const },
      completed: { label: 'הושלם', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, variant: 'secondary' as const };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM format
  };

  if (shifts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">לא נמצאו משמרות</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('employee_name')}
            >
              שם עובד
              {getSortIcon('employee_name')}
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('shift_date')}
            >
              תאריך משמרת
              {getSortIcon('shift_date')}
            </TableHead>
            <TableHead>זמן התחלה</TableHead>
            <TableHead>זמן סיום</TableHead>
            <TableHead>סניף</TableHead>
            <TableHead>תפקיד</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('status')}
            >
              סטטוס
              {getSortIcon('status')}
            </TableHead>
            <TableHead>הערות</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => onSort('created_at')}
            >
              נוצר
              {getSortIcon('created_at')}
            </TableHead>
            <TableHead className="w-[50px]">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => (
            <TableRow key={shift.id}>
              <TableCell className="font-medium">
                {shift.employee_name || 'לא משוייך'}
              </TableCell>
              <TableCell>{formatDate(shift.shift_date)}</TableCell>
              <TableCell>{formatTime(shift.start_time)}</TableCell>
              <TableCell>{formatTime(shift.end_time)}</TableCell>
              <TableCell>{shift.branch_name || '-'}</TableCell>
              <TableCell>{shift.role_preference || '-'}</TableCell>
              <TableCell>{getStatusBadge(shift.status)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {shift.notes || '-'}
              </TableCell>
              <TableCell>{formatDate(shift.created_at)}</TableCell>
              <TableCell>
                <ShiftTableActions
                  shift={shift}
                  onStatusUpdate={onStatusUpdate}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
