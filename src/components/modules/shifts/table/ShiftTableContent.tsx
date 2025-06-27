
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, Check, X, Calendar, Clock, User } from 'lucide-react';
import type { ShiftData, ShiftSortBy, SortOrder } from './types';

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
  currentPage,
  pageSize
}) => {
  const getSortIcon = (field: ShiftSortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ממתין</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">נדחה</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">הושלם</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  if (shifts.length === 0) {
    return (
      <CardContent>
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין משמרות להצגה</h3>
          <p className="text-gray-600">לא נמצאו משמרות התואמות לקריטריונים שנבחרו</p>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50"
                onClick={() => onSort('employee_name')}
              >
                <div className="flex items-center justify-end gap-2">
                  <span>עובד</span>
                  {getSortIcon('employee_name')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50"
                onClick={() => onSort('shift_date')}
              >
                <div className="flex items-center justify-end gap-2">
                  <span>תאריך</span>
                  {getSortIcon('shift_date')}
                </div>
              </TableHead>
              <TableHead className="text-right">שעות</TableHead>
              <TableHead className="text-right">סניף</TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:bg-gray-50"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center justify-end gap-2">
                  <span>סטטוס</span>
                  {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead className="text-right">הערות</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.map((shift) => (
              <TableRow key={shift.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{shift.employee_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{formatDate(shift.shift_date)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{shift.start_time} - {shift.end_time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600">{shift.branch_name || 'לא צוין'}</span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(shift.status)}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {shift.notes ? shift.notes.substring(0, 50) + (shift.notes.length > 50 ? '...' : '') : '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {shift.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                          onClick={() => onStatusUpdate(shift.id, 'approved')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => onStatusUpdate(shift.id, 'rejected')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {shift.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-blue-600 hover:bg-blue-50"
                        onClick={() => onStatusUpdate(shift.id, 'completed')}
                      >
                        סמן כהושלם
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
};
