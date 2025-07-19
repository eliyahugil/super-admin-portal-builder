import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, MapPin, X } from 'lucide-react';
import type { ShiftEntry } from '../types';

// Use a more flexible interface that matches the actual data structure
interface PendingSubmission {
  id: string;
  employee_id: string;
  shifts: any;
  status: string;
  submitted_at: string;
  week_start_date: string;
  week_end_date: string;
  notes?: string;
  employees?: {
    first_name: string;
    last_name: string;
    business_id: string;
    phone?: string;
  };
}

interface PendingSubmissionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: PendingSubmission[];
  parseShifts: (shiftsData: any) => ShiftEntry[];
  sendWhatsApp?: (phone: string | undefined, employeeName: string, weekStart: string, weekEnd: string) => void;
}

export const PendingSubmissionsDialog: React.FC<PendingSubmissionsDialogProps> = ({
  isOpen,
  onClose,
  submissions,
  parseShifts,
  sendWhatsApp
}) => {
  if (!submissions || submissions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              הגשות ממתינות
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">אין הגשות ממתינות</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            הגשות ממתינות ({submissions.length})
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {submissions.map((submission) => {
            const shifts = parseShifts(submission.shifts);
            console.log('🔍 PendingSubmissionsDialog submission:', {
              id: submission.id,
              employee_id: submission.employee_id,
              employees: submission.employees,
              hasEmployeeData: !!submission.employees
            });
            const employeeName = submission.employees 
              ? `${submission.employees.first_name} ${submission.employees.last_name}`
              : 'עובד לא ידוע';

            return (
              <Card key={submission.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {employeeName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(submission.week_start_date)} - {formatDate(submission.week_end_date)}
                      </Badge>
                      {sendWhatsApp && submission.employees?.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWhatsApp(
                            submission.employees?.phone,
                            employeeName,
                            submission.week_start_date,
                            submission.week_end_date
                          )}
                        >
                          WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    נשלח: {formatDate(submission.submitted_at)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm mb-2">משמרות מבוקשות:</h4>
                    
                    {shifts.length === 0 ? (
                      <p className="text-gray-500 text-sm">לא צוינו משמרות</p>
                    ) : (
                      <div className="grid gap-2">
                        {shifts.map((shift, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <Clock className="h-4 w-4 text-gray-500" />
                                {shift.start_time} - {shift.end_time}
                              </div>
                              
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                {shift.branch_preference || 'לא צוין'}
                              </div>
                            </div>
                            
                            <div className="text-sm">
                              {formatDate(shift.date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {submission.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-r-4 border-blue-400">
                        <h5 className="font-medium text-sm text-blue-800 mb-1">הערות כלליות:</h5>
                        <p className="text-sm text-blue-700">{submission.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};