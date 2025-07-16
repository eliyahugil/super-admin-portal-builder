
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, User, MapPin, Edit, Trash2, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ShiftScheduleData, Employee, Branch } from './types';

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

interface ShiftDetailsDialogProps {
  shift: ShiftScheduleData;
  employees: Employee[];
  branches: Branch[];
  shifts?: ShiftScheduleData[]; // Add shifts for conflict checking
  pendingSubmissions?: ShiftSubmission[];
  onClose: () => void;
  onUpdate: (shiftId: string, updates: Partial<ShiftScheduleData>) => Promise<void>;
  onDelete: (shiftId: string) => Promise<void>;
  onAssignEmployee: (shift: ShiftScheduleData) => void;
  onSubmissionUpdate?: () => void;
}

export const ShiftDetailsDialog: React.FC<ShiftDetailsDialogProps> = ({
  shift,
  employees,
  branches,
  shifts = [],
  pendingSubmissions = [],
  onClose,
  onUpdate,
  onDelete,
  onAssignEmployee,
  onSubmissionUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    start_time: shift.start_time,
    end_time: shift.end_time,
    notes: shift.notes || '',
    status: shift.status || 'pending',
    role: shift.role || '',
    branch_id: shift.branch_id || '',
    employee_id: shift.employee_id || '',
    required_employees: shift.required_employees || 1
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvailableEmployees, setShowAvailableEmployees] = useState(false);

  const employee = employees.find(emp => emp.id === shift.employee_id);
  const branch = branches.find(br => br.id === shift.branch_id);

  // Get submissions for this specific shift
  const getSubmissionsForShift = () => {
    const dateStr = shift.shift_date;
    return pendingSubmissions.filter(submission => {
      const shifts = typeof submission.shifts === 'string' 
        ? JSON.parse(submission.shifts) 
        : submission.shifts || [];
      return shifts.some((s: any) => 
        s.date === dateStr && 
        s.start_time === shift.start_time && 
        s.end_time === shift.end_time &&
        s.branch_preference === (branch?.name || shift.branch_name)
      );
    }).map(submission => {
      const shifts = typeof submission.shifts === 'string' 
        ? JSON.parse(submission.shifts) 
        : submission.shifts || [];
      const relevantShift = shifts.find((s: any) => 
        s.date === dateStr && 
        s.start_time === shift.start_time && 
        s.end_time === shift.end_time &&
        s.branch_preference === (branch?.name || shift.branch_name)
      );
      return {
        ...submission,
        employeeName: getEmployeeName(submission.employee_id),
        role: relevantShift?.role_preference || 'ללא תפקיד',
        isCurrentlyAssigned: shift.employee_id === submission.employee_id
      };
    });
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא ידוע';
  };

  const shiftSubmissions = getSubmissionsForShift();

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(shift.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating shift:', error);
      alert('שגיאה בעדכון המשמרת');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המשמרת?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(shift.id);
      onClose();
    } catch (error) {
      console.error('Error deleting shift:', error);
      alert('שגיאה במחיקת המשמרת');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'מאושר';
      case 'pending': return 'ממתין';
      case 'rejected': return 'נדחה';
      case 'completed': return 'הושלם';
      default: return 'לא ידוע';
    }
  };

  const approveShift = async (submission: ShiftSubmission, shiftData: any) => {
    setLoading(true);
    try {
      // Get business_id from employee
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('business_id')
        .eq('id', submission.employee_id)
        .single();

      if (employeeError) {
        console.error('Error fetching employee:', employeeError);
        throw employeeError;
      }

      // Find branch_id by name
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('id')
        .eq('name', shiftData.branch_preference)
        .eq('business_id', employeeData.business_id)
        .maybeSingle();

      if (branchError) {
        console.error('Error fetching branch:', branchError);
        throw branchError;
      }

      // Create approved shift in scheduled_shifts table
      const { error: createError } = await supabase
        .from('scheduled_shifts')
        .insert({
          business_id: employeeData.business_id,
          employee_id: submission.employee_id,
          shift_date: shiftData.date,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          branch_id: branchData?.id || null,
          role: shiftData.role_preference || '',
          status: 'approved',
          is_assigned: true,
          is_archived: false,
        });

      if (createError) {
        console.error('Error creating scheduled shift:', createError);
        throw createError;
      }

      // Update submission status to approved
      const { error: updateError } = await supabase
        .from('employee_shift_requests')
        .update({ status: 'approved' })
        .eq('id', submission.id);

      if (updateError) {
        console.error('Error updating submission:', updateError);
        throw updateError;
      }

      toast.success('המשמרת אושרה בהצלחה');
      onSubmissionUpdate?.();
    } catch (error) {
      console.error('Error approving shift:', error);
      toast.error('שגיאה באישור המשמרת: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const rejectShift = async (submissionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('employee_shift_requests')
        .update({ status: 'rejected' })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('המשמרת נדחתה');
      onSubmissionUpdate?.();
    } catch (error) {
      console.error('Error rejecting shift:', error);
      toast.error('שגיאה בדחיית המשמרת');
    } finally {
      setLoading(false);
    }
  };

  const assignEmployee = async (submissionEmployeeId: string) => {
    // Check for conflicts before assigning
    const conflicts = checkShiftConflicts(submissionEmployeeId);
    
    if (conflicts.length > 0) {
      const conflictTexts = conflicts.map(c => 
        `${c.branch_name} (${c.start_time}-${c.end_time})`
      ).join(', ');
      
      const shouldProceed = confirm(
        `⚠️ אזהרה: לעובד יש התנגשות עם משמרות אחרות:\n${conflictTexts}\n\nהאם להמשיך בכל זאת?`
      );
      
      if (!shouldProceed) {
        return;
      }
    }

    try {
      await onUpdate(shift.id, {
        ...shift,
        employee_id: submissionEmployeeId
      });
      toast.success('העובד הוקצה בהצלחה');
      onSubmissionUpdate?.();
    } catch (error) {
      console.error('Error assigning employee:', error);
      toast.error('שגיאה בהקצאת העובד');
    }
  };

  // Check for conflicts when assigning an employee
  const checkShiftConflicts = (employeeId: string) => {
    return shifts.filter(otherShift => 
      otherShift.employee_id === employeeId &&
      otherShift.shift_date === shift.shift_date &&
      otherShift.status === 'approved' &&
      otherShift.id !== shift.id &&
      // Check time overlap
      (() => {
        const shiftStart = new Date(`${shift.shift_date}T${shift.start_time}`);
        const shiftEnd = new Date(`${shift.shift_date}T${shift.end_time}`);
        const otherStart = new Date(`${otherShift.shift_date}T${otherShift.start_time}`);
        const otherEnd = new Date(`${otherShift.shift_date}T${otherShift.end_time}`);
        return (shiftStart < otherEnd && shiftEnd > otherStart);
      })()
    );
  };

  // Get available employees from other branches without submissions
  const getAvailableEmployeesFromOtherBranches = () => {
    // Get all employees that are not currently assigned to this shift's branch
    // or employees that don't have any branch assignment
    const otherBranchEmployees = employees.filter(emp => {
      // Check if employee has worked in other branches or is generally available
      const hasWorkedInOtherBranches = shifts.some(s => 
        s.employee_id === emp.id && 
        s.branch_id !== shift.branch_id &&
        s.branch_id !== null
      );
      
      // Include employees who worked in other branches or have no specific branch tie
      return hasWorkedInOtherBranches || !shift.branch_id;
    });

    // Filter out employees who have submissions for this date/time
    const availableEmployees = otherBranchEmployees.filter(emp => {
      const hasSubmission = pendingSubmissions.some(submission => {
        if (submission.employee_id !== emp.id) return false;
        
        const shifts = typeof submission.shifts === 'string' 
          ? JSON.parse(submission.shifts) 
          : submission.shifts || [];
        
        return shifts.some((s: any) => 
          s.date === shift.shift_date && 
          s.start_time === shift.start_time && 
          s.end_time === shift.end_time
        );
      });
      
      return !hasSubmission;
    });

    return availableEmployees;
  };

  // Get shifts from branches without submissions
  const getShiftsFromBranchesWithoutSubmissions = () => {
    const branchesWithSubmissions = new Set();
    
    // Find branches that have submissions for this shift time
    pendingSubmissions.forEach(submission => {
      const shifts = typeof submission.shifts === 'string' 
        ? JSON.parse(submission.shifts) 
        : submission.shifts || [];
      
      shifts.forEach((s: any) => {
        if (s.date === shift.shift_date && 
            s.start_time === shift.start_time && 
            s.end_time === shift.end_time) {
          const branchName = s.branch_preference;
          const branch = branches.find(b => b.name === branchName);
          if (branch) branchesWithSubmissions.add(branch.id);
        }
      });
    });

    // Find shifts from branches without submissions
    return shifts.filter(s => 
      s.shift_date === shift.shift_date &&
      s.start_time === shift.start_time &&
      s.end_time === shift.end_time &&
      s.id !== shift.id &&
      s.branch_id &&
      !branchesWithSubmissions.has(s.branch_id) &&
      !s.employee_id // Only unassigned shifts
    );
  };

  const availableEmployees = getAvailableEmployeesFromOtherBranches();
  const shiftsWithoutSubmissions = getShiftsFromBranchesWithoutSubmissions();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>פרטי משמרת</span>
            <Badge className={getStatusColor(shift.status || 'pending')}>
              {getStatusText(shift.status || 'pending')}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Shift Date */}
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Clock className="h-4 w-4 text-gray-600" />
            <div>
              <div className="font-medium">
                {new Date(shift.shift_date).toLocaleDateString('he-IL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {/* Edit Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>שעת התחלה</Label>
                  <Input
                    type="time"
                    value={editData.start_time}
                    onChange={(e) => setEditData(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>שעת סיום</Label>
                  <Input
                    type="time"
                    value={editData.end_time}
                    onChange={(e) => setEditData(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Edit Role */}
              <div className="space-y-2">
                <Label>תפקיד</Label>
                <Input
                  value={editData.role}
                  onChange={(e) => setEditData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="הכנס תפקיד..."
                />
              </div>

              {/* Edit Employee Assignment */}
              <div className="space-y-2">
                <Label>עובד מוקצה</Label>
                <Select 
                  value={editData.employee_id} 
                  onValueChange={(value) => 
                    setEditData(prev => ({ ...prev, employee_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא עובד מוקצה</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Edit Branch */}
              <div className="space-y-2">
                <Label>סניף</Label>
                <Select 
                  value={editData.branch_id} 
                  onValueChange={(value) => 
                    setEditData(prev => ({ ...prev, branch_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סניף..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">ללא סניף</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Edit Required Employees */}
              <div className="space-y-2">
                <Label>כמות עובדים נדרשים</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={editData.required_employees}
                  onChange={(e) => setEditData(prev => ({ ...prev, required_employees: Number(e.target.value) }))}
                  placeholder="מספר עובדים נדרשים"
                />
              </div>

              {/* Edit Status */}
              <div className="space-y-2">
                <Label>סטטוס</Label>
                <Select 
                  value={editData.status} 
                  onValueChange={(value: 'pending' | 'approved' | 'rejected' | 'completed') => 
                    setEditData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="approved">מאושר</SelectItem>
                    <SelectItem value="rejected">נדחה</SelectItem>
                    <SelectItem value="completed">הושלם</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Edit Notes */}
              <div className="space-y-2">
                <Label>הערות</Label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="הערות נוספות..."
                  rows={3}
                />
              </div>

              {/* Edit Actions */}
              <div className="flex gap-2">
                <Button onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? 'שומר...' : 'שמור שינויים'}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  ביטול
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Time Display */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span>{shift.start_time} - {shift.end_time}</span>
              </div>

              {/* Employee Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span>
                    {employee ? `${employee.first_name} ${employee.last_name}` : 'לא מוקצה עובד'}
                  </span>
                </div>
                {!employee && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssignEmployee(shift)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    הקצה עובד
                  </Button>
                )}
              </div>

              {/* Branch Display - Enhanced with full information */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>{branch ? branch.name : 'ללא סניף'}</span>
                  {branch?.address && (
                    <span className="text-sm text-gray-500">({branch.address})</span>
                  )}
                </div>
                {branch && (
                  <Badge variant="outline" className="text-xs">
                    {branch.is_active ? 'פעיל' : 'לא פעיל'}
                  </Badge>
                )}
              </div>

              {/* Role Display - Enhanced with editing capability */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">תפקיד:</span>
                  {shift.role ? (
                    <Badge variant="secondary">{shift.role}</Badge>
                  ) : (
                    <span className="text-sm text-gray-500">ללא תפקיד מוגדר</span>
                  )}
                </div>
              </div>

              {/* Required Employees Display */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">עובדים נדרשים:</span>
                <Badge variant="outline">{shift.required_employees || 1}</Badge>
              </div>

              {/* Notes Display */}
              {shift.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium">הערות:</Label>
                  <p className="text-sm text-gray-700 mt-1">{shift.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  ערוך
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isDeleting ? 'מוחק...' : 'מחק'}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  סגור
                </Button>
                {/* Show Available Employees Button */}
                {(availableEmployees.length > 0 || shiftsWithoutSubmissions.length > 0) && (
                  <Button 
                    variant="outline"
                    onClick={() => setShowAvailableEmployees(!showAvailableEmployees)}
                  >
                    {showAvailableEmployees ? 'הסתר' : 'הצג'} עובדים פנויים
                  </Button>
                )}
              </div>

              {/* Available Employees from Other Branches */}
              {showAvailableEmployees && availableEmployees.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <h4 className="font-medium text-sm">עובדים פנויים מסניפים אחרים ({availableEmployees.length})</h4>
                    <p className="text-xs text-gray-600">העובדים יוקצו למשמרת בסניף: <span className="font-medium text-purple-700">{branch?.name || 'לא ידוע'}</span></p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {availableEmployees.map((emp) => {
                      // Find the most recent branch this employee worked at
                      const recentShift = shifts
                        .filter(s => s.employee_id === emp.id && s.branch_id)
                        .sort((a, b) => new Date(b.shift_date).getTime() - new Date(a.shift_date).getTime())[0];
                      const empBranch = recentShift ? branches.find(b => b.id === recentShift.branch_id) : null;
                      
                      return (
                        <div key={emp.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{emp.first_name} {emp.last_name}</span>
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                              מסניף: {empBranch?.name || 'ללא סניף'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-purple-50 text-purple-700">
                              יוקצה לסניף: {branch?.name || 'לא ידוע'}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => assignEmployee(emp.id)}
                            className="text-green-700 hover:bg-green-100"
                          >
                            הקצה
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Shifts from Branches Without Submissions */}
              {showAvailableEmployees && shiftsWithoutSubmissions.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <h4 className="font-medium text-sm">משמרות זמינות מסניפים ללא הגשות ({shiftsWithoutSubmissions.length})</h4>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {shiftsWithoutSubmissions.map((shiftItem) => {
                      const shiftBranch = branches.find(b => b.id === shiftItem.branch_id);
                      return (
                        <div key={shiftItem.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>{shiftBranch?.name || 'ללא סניף'}</span>
                            <Badge variant="outline" className="text-xs">
                              {shiftItem.start_time} - {shiftItem.end_time}
                            </Badge>
                            {shiftItem.role && (
                              <Badge variant="secondary" className="text-xs">
                                {shiftItem.role}
                              </Badge>
                            )}
                          </div>
                          <Badge className={getStatusColor(shiftItem.status || 'pending')}>
                            {getStatusText(shiftItem.status || 'pending')}
                          </Badge>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Submissions Section */}
          {shiftSubmissions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">בקשות למשמרת ({shiftSubmissions.length})</h4>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {shiftSubmissions.length} בקשות
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {shiftSubmissions.map((submission, index) => {
                  const shifts = typeof submission.shifts === 'string' 
                    ? JSON.parse(submission.shifts) 
                    : submission.shifts || [];
                  const relevantShift = shifts.find((s: any) => 
                    s.date === shift.shift_date && 
                    s.start_time === shift.start_time && 
                    s.end_time === shift.end_time &&
                    s.branch_preference === (branch?.name || shift.branch_name)
                  );

                  return (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">
                            {submission.employeeName}
                            {submission.isCurrentlyAssigned && (
                              <span className="text-green-600 mr-1">✓ מוקצה</span>
                            )}
                          </span>
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            סניף: {relevantShift?.branch_preference || 'לא צוין'}
                          </Badge>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {submission.role}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        {!submission.isCurrentlyAssigned && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs"
                            onClick={() => assignEmployee(submission.employee_id)}
                            disabled={loading}
                          >
                            שייך למשמרת
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
                          onClick={() => approveShift(submission, relevantShift)}
                          disabled={loading}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          אושר
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs"
                          onClick={() => rejectShift(submission.id)}
                          disabled={loading}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          דחה
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
