import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, MapPin, User, FileText, X, Edit, Trash2, UserCheck, Copy, Move } from 'lucide-react';
import { useRealData } from '@/hooks/useRealData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ShiftDetailsDialogProps {
  shift: any;
  open: boolean;
  onClose: () => void;
  onUpdate?: (shiftId: string, updates: any) => Promise<void>;
  onDelete?: (shiftId: string) => Promise<void>;
  onAssignEmployee?: (employeeId: string, shiftId: string) => Promise<void>;
  onCopyShift?: (shiftData: any) => void;
  onMoveShift?: (shiftId: string, newDate: string) => Promise<void>;
}

export const ShiftDetailsDialog: React.FC<ShiftDetailsDialogProps> = ({ shift, open, onClose, onUpdate, onDelete, onAssignEmployee, onCopyShift, onMoveShift }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [newDate, setNewDate] = useState('');
  const { toast } = useToast();

  // קבלת נתונים נוספים עבור הצגה תקינה - כל ה-hooks תמיד נקראים באותו סדר
  const { data: employees = [] } = useRealData<any>({
    queryKey: ['employees-for-shift-details', shift?.business_id],
    tableName: 'employees',
    filters: { business_id: shift?.business_id, is_active: true },
    enabled: !!shift?.business_id && open
  });

  const { data: branches = [] } = useRealData<any>({
    queryKey: ['branches-for-shift-details', shift?.business_id],
    tableName: 'branches',
    filters: { business_id: shift?.business_id, is_active: true },
    enabled: !!shift?.business_id && open
  });

  const { data: roles = [] } = useRealData<any>({
    queryKey: ['roles-for-shift-details', shift?.business_id],
    tableName: 'shift_roles',
    filters: { business_id: shift?.business_id, is_active: true },
    enabled: !!shift?.business_id && open
  });

  // שליפת עובדים שהגישו בקשות למשמרת זו
  const { data: shifSubmissionsForShift = [] } = useRealData<any>({
    queryKey: ['shift-submissions-for-shift', shift?.shift_date, shift?.start_time, shift?.end_time, shift?.branch_id],
    tableName: 'shift_submissions',
    filters: { 
      status: 'submitted'
    },
    enabled: !!shift?.shift_date && open
  });

  // איפוס נתוני העריכה כשנפתח הדיאלוג
  React.useEffect(() => {
    if (open && shift) {
      setEditData({
        shift_date: shift.shift_date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        branch_id: shift.branch_id,
        employee_id: shift.employee_id,
        role: shift.role,
        notes: shift.notes || '',
        required_employees: shift.required_employees || 1,
      });
      setIsEditing(false);
    }
  }, [open, shift]);

  // רק אחרי כל ה-hooks נבדוק אם יש shift
  if (!shift) return null;

  // פונקציות עזר לקבלת שמות
  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'לא משויך';
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'לא ידוע';
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'לא משויך';
    const branch = branches.find(br => br.id === branchId);
    return branch ? branch.name : 'לא ידוע';
  };

  const getRoleName = (roleId: string | null) => {
    if (!roleId) return null;
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : null;
  };

  // פונקציה לחילוץ עובדים שהגישו למשמרת זו
  const getEmployeesWhoSubmittedForThisShift = () => {
    const submittedEmployees = [];
    
    console.log('🔍 Debug getEmployeesWhoSubmittedForThisShift:', {
      shifSubmissionsForShift: shifSubmissionsForShift.length,
      shift_date: shift.shift_date,
      start_time: shift.start_time,
      end_time: shift.end_time,
      branch_name: getBranchName(shift.branch_id)
    });
    
    shifSubmissionsForShift.forEach(submission => {
      console.log('📋 Processing submission:', {
        employee_id: submission.employee_id,
        shifts: submission.shifts
      });
      
      const shifts = submission.shifts || [];
      shifts.forEach(submittedShift => {
        console.log('🔍 Checking submitted shift:', {
          date: submittedShift.date,
          start_time: submittedShift.start_time,
          end_time: submittedShift.end_time,
          branch_preference: submittedShift.branch_preference,
          matches: {
            date: submittedShift.date === shift.shift_date,
            start_time: submittedShift.start_time === shift.start_time,
            end_time: submittedShift.end_time === shift.end_time,
            branch: submittedShift.branch_preference === getBranchName(shift.branch_id)
          }
        });
        
        // בדיקה אם המשמרת מתאימה לתאריך, שעות וסניף
        if (submittedShift.date === shift.shift_date &&
            submittedShift.start_time === shift.start_time &&
            submittedShift.end_time === shift.end_time &&
            submittedShift.branch_preference === getBranchName(shift.branch_id)) {
          
          const employee = employees.find(emp => emp.id === submission.employee_id);
          if (employee && !submittedEmployees.find(emp => emp.id === employee.id)) {
            console.log('✅ Adding employee to submitted list:', employee.first_name, employee.last_name);
            submittedEmployees.push({
              ...employee,
              submissionNotes: submittedShift.notes,
              rolePreference: submittedShift.role_preference
            });
          }
        }
      });
    });
    
    console.log('📊 Final submitted employees count:', submittedEmployees.length);
    return submittedEmployees;
  };

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

  const handleSave = async () => {
    if (!onUpdate) return;
    
    try {
      await onUpdate(shift.id, editData);
      setIsEditing(false);
      toast({
        title: "הצלחה",
        description: "המשמרת עודכנה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון המשמרת",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm('האם אתה בטוח שברצונך למחוק את המשמרת?')) {
      try {
        await onDelete(shift.id);
        onClose();
        toast({
          title: "הצלחה",  
          description: "המשמרת נמחקה בהצלחה",
        });
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "שגיאה במחיקת המשמרת",
          variant: "destructive"
        });
      }
    }
  };

  const handleCopyShift = () => {
    if (!onCopyShift) return;
    
    const shiftData = {
      ...shift,
      id: undefined, // יצירת משמרת חדשה
      created_at: undefined,
      updated_at: undefined,
    };
    
    onCopyShift(shiftData);
    toast({
      title: "הצלחה",
      description: "נתוני המשמרת הועתקו ונפתח עורך המשמרות החדש",
    });
    onClose();
  };

  const handleMoveShift = async () => {
    if (!onMoveShift || !newDate) return;
    
    try {
      await onMoveShift(shift.id, newDate);
      setShowMoveDialog(false);
      setNewDate('');
      toast({
        title: "הצלחה",
        description: "המשמרת הועברה בהצלחה לתאריך החדש",
      });
      onClose();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בהעברת המשמרת",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[95vw] !max-w-[95vw] sm:!max-w-2xl !left-[50%] !translate-x-[-50%] max-h-[95vh] overflow-y-auto p-3 sm:p-6" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEditing ? 'עריכת משמרת' : 'פרטי משמרת'}</DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing && onCopyShift && (
                <Button variant="ghost" size="sm" onClick={handleCopyShift} title="העתק משמרת">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              {!isEditing && onMoveShift && (
                <Button variant="ghost" size="sm" onClick={() => {
                  setNewDate(shift.shift_date);
                  setShowMoveDialog(true);
                }} title="העבר משמרת לתאריך אחר">
                  <Move className="h-4 w-4" />
                </Button>
              )}
              {!isEditing && onUpdate && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {!isEditing && onDelete && (
                <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {isEditing ? (
            // מצב עריכה
            <>
              {/* תאריך */}
              <div className="space-y-2">
                <Label htmlFor="shift-date">תאריך משמרת</Label>
                <Input
                  id="shift-date"
                  type="date"
                  value={editData.shift_date}
                  onChange={(e) => setEditData({...editData, shift_date: e.target.value})}
                />
              </div>

              {/* שעות */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">שעת התחלה</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={editData.start_time}
                    onChange={(e) => setEditData({...editData, start_time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">שעת סיום</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={editData.end_time}
                    onChange={(e) => setEditData({...editData, end_time: e.target.value})}
                  />
                </div>
              </div>

              {/* סניף */}
              <div className="space-y-2">
                <Label htmlFor="branch">סניף</Label>
                <Select value={editData.branch_id} onValueChange={(value) => setEditData({...editData, branch_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סניף" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* עובד */}
              <div className="space-y-2">
                <Label htmlFor="employee">עובד</Label>
                <Select value={editData.employee_id || 'none'} onValueChange={(value) => setEditData({...editData, employee_id: value === 'none' ? null : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד (אופציונלי)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">לא משויך</SelectItem>
                    
                    {/* עובדים שהגישו למשמרת זו */}
                    {getEmployeesWhoSubmittedForThisShift().length > 0 && (
                      <>
                        {getEmployeesWhoSubmittedForThisShift().map((employee) => (
                          <SelectItem key={`submitted-${employee.id}`} value={employee.id}>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">✓</span>
                              <span>{employee.first_name} {employee.last_name}</span>
                              {employee.rolePreference && (
                                <span className="text-xs text-gray-500">({employee.rolePreference})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    
                    {/* כל העובדים האחרים */}
                    {employees
                      .filter(emp => !getEmployeesWhoSubmittedForThisShift().find(submitted => submitted.id === emp.id))
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* תפקיד */}
              <div className="space-y-2">
                <Label htmlFor="role">תפקיד</Label>
                <Select value={editData.role || 'none'} onValueChange={(value) => setEditData({...editData, role: value === 'none' ? null : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תפקיד (אופציונלי)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ללא תפקיד</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* כמות עובדים נדרשת */}
              <div className="space-y-2">
                <Label htmlFor="required-employees">כמות עובדים נדרשת</Label>
                <Input
                  id="required-employees"
                  type="number"
                  min="1"
                  value={editData.required_employees}
                  onChange={(e) => setEditData({...editData, required_employees: parseInt(e.target.value)})}
                />
              </div>

              {/* הערות */}
              <div className="space-y-2">
                <Label htmlFor="notes">הערות</Label>
                <Textarea
                  id="notes"
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  placeholder="הערות על המשמרת (אופציונלי)"
                />
              </div>
            </>
          ) : (
            // מצב תצוגה
            <>
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
                    <p className="font-medium">{getEmployeeName(shift.employee_id)}</p>
                    <p className="text-sm text-gray-500">עובד משובץ</p>
                  </div>
                </div>
              )}

              {/* Branch */}
              {shift.branch_id && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{getBranchName(shift.branch_id)}</p>
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
              {shift.role && getRoleName(shift.role) && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{getRoleName(shift.role)}</p>
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

              {/* עובדים שהגישו למשמרת זו */}
              {getEmployeesWhoSubmittedForThisShift().length > 0 && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-600">עובדים שהגישו למשמרת זו</p>
                    <div className="mt-2 space-y-1">
                      {getEmployeesWhoSubmittedForThisShift().map((employee, index) => {
                        const isAssigned = shift.employee_id === employee.id;
                        return (
                          <div key={employee.id} className="text-sm bg-blue-50 p-2 rounded">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">✓</span>
                                <span className="font-medium">{employee.first_name} {employee.last_name}</span>
                                {isAssigned && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">משובץ</Badge>
                                )}
                              </div>
                              {onAssignEmployee && (
                                <Button
                                  size="sm"
                                  variant={isAssigned ? "outline" : "default"}
                                  className="h-6 px-2 text-xs"
                                  onClick={async () => {
                                    try {
                                      if (isAssigned) {
                                        // הסרת שיבוץ - העברת null
                                        await onUpdate?.(shift.id, { employee_id: null });
                                        toast({
                                          title: "הצלחה",
                                          description: "השיבוץ הוסר בהצלחה",
                                        });
                                      } else {
                                        // שיבוץ עובד
                                        await onAssignEmployee(employee.id, shift.id);
                                        toast({
                                          title: "הצלחה", 
                                          description: "העובד שובץ בהצלחה למשמרת",
                                        });
                                      }
                                    } catch (error) {
                                      toast({
                                        title: "שגיאה",
                                        description: isAssigned ? "שגיאה בהסרת השיבוץ" : "שגיאה בשיבוץ העובד",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  {isAssigned ? "הסר שיבוץ" : "שיבוץ"}
                                </Button>
                              )}
                            </div>
                            {employee.rolePreference && (
                              <p className="text-xs text-gray-600 mt-1">
                                תפקיד מועדף: {employee.rolePreference}
                              </p>
                            )}
                            {employee.submissionNotes && (
                              <p className="text-xs text-gray-600 mt-1">
                                הערות: {employee.submissionNotes}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                ביטול
              </Button>
              <Button onClick={handleSave}>
                שמור
              </Button>
            </>
          ) : (
            <Button onClick={onClose}>סגור</Button>
          )}
        </div>
        
        {/* דיאלוג העברת משמרת */}
        {showMoveDialog && (
          <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>העבר משמרת לתאריך אחר</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-date">תאריך חדש</Label>
                  <Input
                    id="new-date"
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleMoveShift} disabled={!newDate}>
                    העבר
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};