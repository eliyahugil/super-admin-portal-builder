
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, User, FileText, X } from 'lucide-react';

interface ShiftDetailsDialogProps {
  shift: any;
  open: boolean;
  onClose: () => void;
}

export const ShiftDetailsDialog: React.FC<ShiftDetailsDialogProps> = ({ shift, open, onClose }) => {
  if (!shift) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">מאושר</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">ממתין לאישור</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">נדחה</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>פרטי משמרת</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Date */}
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{formatDate(shift.shift_date)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="font-medium">{shift.start_time} - {shift.end_time}</p>
              <p className="text-sm text-gray-500">זמני המשמרת</p>
            </div>
          </div>

          {/* Employee */}
          {shift.employee_id && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{shift.employee_name || 'לא ידוע'}</p>
                <p className="text-sm text-gray-500">עובד משובץ</p>
              </div>
            </div>
          )}

          {/* Branch */}
          {shift.branch_id && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{shift.branch_name || 'לא ידוע'}</p>
                <p className="text-sm text-gray-500">סניף</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-gray-500"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">סטטוס:</span>
              {getStatusBadge(shift.status || 'unknown')}
            </div>
          </div>

          {/* Role */}
          {shift.role && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{shift.role}</p>
                <p className="text-sm text-gray-500">תפקיד</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {shift.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="font-medium">הערות</p>
                <p className="text-sm text-gray-600 mt-1">{shift.notes}</p>
              </div>
            </div>
          )}

          {/* Required Employees */}
          {shift.required_employees && (
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{shift.required_employees} עובדים נדרשים</p>
                <p className="text-sm text-gray-500">כמות עובדים נדרשת</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>סגור</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
