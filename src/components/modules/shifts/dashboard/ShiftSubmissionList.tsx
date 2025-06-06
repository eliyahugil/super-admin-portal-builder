
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, MessageSquare, FileText } from 'lucide-react';
import { ShiftSubmission, ShiftEntry } from '../types';

interface ShiftSubmissionListProps {
  filteredSubmissions: ShiftSubmission[];
  parseShifts: (shiftsData: any) => ShiftEntry[];
  sendWhatsApp: (phone: string | undefined, employeeName: string, weekStart: string, weekEnd: string) => void;
}

export const ShiftSubmissionList: React.FC<ShiftSubmissionListProps> = ({ 
  filteredSubmissions, 
  parseShifts, 
  sendWhatsApp 
}) => {
  if (filteredSubmissions?.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין הגשות משמרות</h3>
        <p className="text-gray-600">לא נמצאו הגשות משמרות במערכת</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filteredSubmissions?.map((submission: ShiftSubmission) => {
        const parsedShifts = parseShifts(submission.shifts);
        
        return (
          <Card key={submission.id} className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">
                      {submission.employee?.first_name} {submission.employee?.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      מס' עובד: {submission.employee?.employee_id}
                    </p>
                  </div>
                </div>
                <div className="text-left flex items-center gap-3">
                  <Badge variant="default">הוגש</Badge>
                  <Button
                    onClick={() => sendWhatsApp(
                      submission.employee?.phone,
                      `${submission.employee?.first_name} ${submission.employee?.last_name}`,
                      submission.week_start_date,
                      submission.week_end_date
                    )}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    שלח בוואטסאפ
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                הוגש: {new Date(submission.submitted_at).toLocaleDateString('he-IL')} {new Date(submission.submitted_at).toLocaleTimeString('he-IL')}
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    שבוע: {new Date(submission.week_start_date).toLocaleDateString('he-IL')} - {new Date(submission.week_end_date).toLocaleDateString('he-IL')}
                  </span>
                </div>

                {submission.notes && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>הערות כלליות:</strong> {submission.notes}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium">משמרות שהוגשו ({parsedShifts.length}):</h4>
                  
                  {parsedShifts.map((shift: ShiftEntry, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <strong>תאריך:</strong> {new Date(shift.date).toLocaleDateString('he-IL')}
                        </div>
                        <div>
                          <strong>שעות:</strong> {shift.start_time} - {shift.end_time}
                        </div>
                        <div>
                          <strong>סניף:</strong> {shift.branch_preference}
                        </div>
                        {shift.role_preference && (
                          <div>
                            <strong>תפקיד:</strong> {shift.role_preference}
                          </div>
                        )}
                      </div>
                      {shift.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>הערות:</strong> {shift.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
