import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, User, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShiftSubmission {
  id: string;
  employee_id: string;
  shifts: Array<{
    date: string;
    start_time: string;
    end_time: string;
    branch_preference: string;
    role_preference?: string;
  }>;
  status: string;
  submitted_at: string;
  employee?: {
    first_name: string;
    last_name: string;
  };
}

interface SubmissionApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: ShiftSubmission[];
  selectedDate: Date;
  employees: Array<{ id: string; first_name: string; last_name: string }>;
  onApprovalComplete: () => void;
}

export const SubmissionApprovalDialog: React.FC<SubmissionApprovalDialogProps> = ({
  isOpen,
  onClose,
  submissions,
  selectedDate,
  employees,
  onApprovalComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  
  // Filter submissions that have shifts for the selected date
  const relevantSubmissions = submissions.filter(submission => {
    const shifts = typeof submission.shifts === 'string' 
      ? JSON.parse(submission.shifts) 
      : submission.shifts || [];
    return shifts.some((shift: any) => shift.date === selectedDateStr);
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא ידוע';
  };

  const approveShift = async (submission: ShiftSubmission, shiftIndex: number) => {
    setLoading(true);
    try {
      const shifts = typeof submission.shifts === 'string' 
        ? JSON.parse(submission.shifts) 
        : submission.shifts || [];
      const shift = shifts[shiftIndex];

      // Get business_id from employee
      const { data: employeeData } = await supabase
        .from('employees')
        .select('business_id')
        .eq('id', submission.employee_id)
        .single();

      // Create approved shift in scheduled_shifts table
      const { error: createError } = await supabase
        .from('scheduled_shifts')
        .insert({
          business_id: employeeData?.business_id,
          employee_id: submission.employee_id,
          shift_date: shift.date,
          start_time: shift.start_time,
          end_time: shift.end_time,
          branch_id: shift.branch_preference, // Assuming this is branch ID
          role: shift.role_preference || '',
          status: 'approved',
          is_assigned: true,
          is_archived: false,
        });

      if (createError) throw createError;

      // Update submission status to approved
      const { error: updateError } = await supabase
        .from('shift_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      toast.success('המשמרת אושרה בהצלחה');
      onApprovalComplete();
    } catch (error) {
      console.error('Error approving shift:', error);
      toast.error('שגיאה באישור המשמרת');
    } finally {
      setLoading(false);
    }
  };

  const rejectSubmission = async (submissionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('shift_submissions')
        .update({ status: 'rejected' })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('ההגשה נדחתה');
      onApprovalComplete();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast.error('שגיאה בדחיית ההגשה');
    } finally {
      setLoading(false);
    }
  };

  if (relevantSubmissions.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>אין הגשות לתאריך זה</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>לא נמצאו הגשות משמרות עבור {selectedDate.toLocaleDateString('he-IL')}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            אישור הגשות משמרות - {selectedDate.toLocaleDateString('he-IL')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {relevantSubmissions.map((submission) => {
            const shifts = typeof submission.shifts === 'string' 
              ? JSON.parse(submission.shifts) 
              : submission.shifts || [];
            const shiftsForDate = shifts.filter((shift: any) => shift.date === selectedDateStr);

            return (
              <Card key={submission.id} className="border-l-4 border-l-yellow-400">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">
                        {getEmployeeName(submission.employee_id)}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      ממתין לאישור
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {shiftsForDate.map((shift: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{shift.start_time} - {shift.end_time}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{shift.branch_preference}</span>
                          </div>
                          
                          {shift.role_preference && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">תפקיד: {shift.role_preference}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectSubmission(submission.id)}
                            disabled={loading}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 ml-1" />
                            דחה
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveShift(submission, shifts.indexOf(shift))}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 ml-1" />
                            אשר משמרת
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-gray-500 mt-3">
                    הוגש ב: {new Date(submission.submitted_at).toLocaleString('he-IL')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            סגור
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};