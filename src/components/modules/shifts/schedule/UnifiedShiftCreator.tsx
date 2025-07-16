import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, CheckCircle, Building } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useShiftRoles } from '../templates/useShiftRoles';
import { AddRoleDialog } from '../templates/AddRoleDialog';
import { BranchDialog } from '../../branches/BranchDialog';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Employee, Branch, CreateShiftData } from './types';

interface UnifiedShiftCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: CreateShiftData) => Promise<void>;
  onBulkSubmit: (shifts: Omit<CreateShiftData, 'shift_template_id'>[]) => Promise<void>;
  employees: Employee[];
  branches: Branch[];
  onBranchCreated?: () => void;
}

export const UnifiedShiftCreator: React.FC<UnifiedShiftCreatorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onBulkSubmit,
  employees,
  branches,
  onBranchCreated
}) => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  const { roles, loading: rolesLoading, addRole } = useShiftRoles(businessId);
  
  // Unified mode - single switch for single vs multiple shifts
  const [isMultipleShifts, setIsMultipleShifts] = useState(false);
  
  // Basic shift data
  const [date, setDate] = useState<Date>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [requiredEmployees, setRequiredEmployees] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Multiple shifts (consecutive days)
  const [numberOfDays, setNumberOfDays] = useState(1);
  
  // Bulk shifts (specific days in date range)
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  
  // Dialogs
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);

  const daysOfWeek = [
    { id: 0, name: 'ראשון' },
    { id: 1, name: 'שני' },
    { id: 2, name: 'שלישי' },
    { id: 3, name: 'רביעי' },
    { id: 4, name: 'חמישי' },
    { id: 5, name: 'שישי' },
    { id: 6, name: 'שבת' }
  ];

  const handleDayToggle = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(id => id !== dayId)
        : [...prev, dayId]
    );
  };

  const generateBulkShifts = (): Omit<CreateShiftData, 'shift_template_id'>[] => {
    if (!startDate || !endDate || selectedDays.length === 0 || selectedBranches.length === 0) return [];

    const shifts: Omit<CreateShiftData, 'shift_template_id'>[] = [];
    let currentDate = new Date(startDate);

    while (!isAfter(currentDate, endDate)) {
      const dayOfWeek = currentDate.getDay();
      
      if (selectedDays.includes(dayOfWeek)) {
        selectedBranches.forEach(branchId => {
          shifts.push({
            shift_date: format(currentDate, 'yyyy-MM-dd'),
            start_time: startTime,
            end_time: endTime,
            employee_id: null,
            branch_id: branchId || null,
            role: role && role !== 'none' && role !== '' ? role : null,
            notes: null,
            status: 'pending',
            required_employees: requiredEmployees
          });
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    return shifts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on mode
    if (isMultipleShifts) {
      if (!startDate || !endDate) {
        toast({
          title: "שגיאה",
          description: "אנא בחר תאריך התחלה וסיום",
          variant: "destructive"
        });
        return;
      }

      if (selectedDays.length === 0) {
        toast({
          title: "שגיאה", 
          description: "אנא בחר לפחות יום אחד בשבוע",
          variant: "destructive"
        });
        return;
      }

      if (isAfter(startDate, endDate)) {
        toast({
          title: "שגיאה",
          description: "תאריך ההתחלה חייב להיות לפני תאריך הסיום",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!date) {
        toast({
          title: "שגיאה",
          description: "אנא בחר תאריך",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);
    setShowSuccess(false);
    
    try {
      if (isMultipleShifts) {
        // For multiple shifts, if branches are selected, use bulk logic
        if (selectedBranches.length > 0) {
          const shifts = generateBulkShifts();
          if (shifts.length === 0) {
            toast({
              title: "שגיאה",
              description: "לא נוצרו משמרות. בדוק את ההגדרות",
              variant: "destructive"
            });
            return;
          }

          if (shifts.length > 50) {
            if (!confirm(`זה יצור ${shifts.length} משמרות. האם להמשיך?`)) {
              return;
            }
          }

          await onBulkSubmit(shifts);
          
          toast({
            title: "הצלחה",
            description: `${shifts.length} משמרות נוצרו בהצלחה`,
          });
        } else {
          // Create shifts for each selected day in date range
          const shifts: CreateShiftData[] = [];
          let currentDate = new Date(startDate!);

          while (!isAfter(currentDate, endDate!)) {
            const dayOfWeek = currentDate.getDay();
            
            if (selectedDays.includes(dayOfWeek)) {
              const shiftData: CreateShiftData = {
                shift_date: format(currentDate, 'yyyy-MM-dd'),
                start_time: startTime,
                end_time: endTime,
                employee_id: employeeId === 'no-employee' ? null : employeeId || null,
                branch_id: branchId === 'no-branch' ? null : branchId || null,
                role: role === 'no-role' ? null : role || null,
                notes: notes || null,
                status: 'pending',
                shift_template_id: null,
                required_employees: requiredEmployees
              };
              shifts.push(shiftData);
            }
            
            currentDate = addDays(currentDate, 1);
          }

          for (const shift of shifts) {
            await onSubmit(shift);
          }
          
          toast({
            title: "הצלחה",
            description: `${shifts.length} משמרות נוצרו בהצלחה`,
          });
        }
      } else {
        // Create single shift
        const shiftData: CreateShiftData = {
          shift_date: format(date!, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          employee_id: employeeId === 'no-employee' ? null : employeeId || null,
          branch_id: branchId === 'no-branch' ? null : branchId || null,
          role: role === 'no-role' ? null : role || null,
          notes: notes || null,
          status: 'pending',
          shift_template_id: null,
          required_employees: requiredEmployees
        };

        await onSubmit(shiftData);
        
        toast({
          title: "הצלחה",
          description: "המשמרת נוצרה בהצלחה",
        });
      }
      
      setShowSuccess(true);
      
      // Reset form
      setDate(undefined);
      setStartDate(undefined);
      setEndDate(undefined);
      setStartTime('09:00');
      setEndTime('17:00');
      setEmployeeId('');
      setBranchId('');
      setRole('');
      setNotes('');
      setRequiredEmployees(1);
      setNumberOfDays(1);
      setSelectedDays([]);
      setSelectedBranches([]);
      setIsMultipleShifts(false);
      
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating shift:', error);
      toast({
        title: "שגיאה",
        description: 'שגיאה ביצירת המשמרת: ' + (error instanceof Error ? error.message : 'שגיאה לא ידועה'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset all states
    setDate(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('09:00');
    setEndTime('17:00');
    setEmployeeId('');
    setBranchId('');
    setRole('');
    setNotes('');
    setRequiredEmployees(1);
    setNumberOfDays(1);
    setSelectedDays([]);
    setSelectedBranches([]);
    setIsMultipleShifts(false);
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[400px]" dir="rtl">
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-700">המשמרות נוצרו בהצלחה!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                המערכת תיסגר תוך כמה שניות...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const previewShifts = isMultipleShifts && selectedBranches.length > 0 ? generateBulkShifts() : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת משמרות</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Single/Multiple Switch */}
          <div className="space-y-3">
            <Label className="text-base font-medium">יצירת משמרות</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isMultipleShifts}
                onCheckedChange={setIsMultipleShifts}
              />
              <Label className="text-sm">
                {isMultipleShifts ? 'יצירת משמרות מרובות' : 'יצירת משמרת בודדת'}
              </Label>
            </div>
          </div>

          {/* Date Selection */}
          {isMultipleShifts ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>תאריך התחלה *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {startDate ? format(startDate, 'dd/MM/yyyy') : <span>בחר תאריך</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>תאריך סיום *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon />
                      {endDate ? format(endDate, 'dd/MM/yyyy') : <span>בחר תאריך</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>תאריך *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : <span>בחר תאריך</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Days of Week for Multiple Shifts */}
          {isMultipleShifts && (
            <div className="space-y-2">
              <Label>ימים בשבוע *</Label>
              <div className="grid grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.id}`}
                      checked={selectedDays.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                    />
                    <Label
                      htmlFor={`day-${day.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שעת התחלה</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>שעת סיום</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Employee Selection - Only when not using multiple branches */}
          {!(isMultipleShifts && selectedBranches.length > 0) && (
            <div className="space-y-2">
              <Label>עובד</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עובד (אופציונלי)" />
                </SelectTrigger>
                <SelectContent className="z-[1000] bg-popover border shadow-lg max-h-[200px] overflow-y-auto">
                  <SelectItem value="no-employee">ללא עובד מוקצה</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Branch Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{isMultipleShifts ? 'סניפים (אופציונלי)' : 'סניף'}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBranchDialog(true)}
              >
                <Building className="h-4 w-4 mr-2" />
                צור סניף חדש
              </Button>
            </div>

            {isMultipleShifts ? (
              <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                <div className="space-y-2">
                  {branches.map(branch => (
                    <div key={branch.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedBranches.includes(branch.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBranches(prev => [...prev, branch.id]);
                          } else {
                            setSelectedBranches(prev => prev.filter(id => id !== branch.id));
                          }
                        }}
                      />
                      <Label className="text-sm">{branch.name}</Label>
                    </div>
                  ))}
                  {branches.length === 0 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">אין סניפים זמינים</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סניף (אופציונלי)" />
                </SelectTrigger>
                <SelectContent className="z-[1000] bg-popover border shadow-lg max-h-[200px] overflow-y-auto">
                  <SelectItem value="no-branch">ללא סניף</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {isMultipleShifts && selectedBranches.length > 0 && (
              <p className="text-xs text-muted-foreground">
                נבחרו {selectedBranches.length} סניפים
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>תפקיד</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddRoleDialog(true)}
                disabled={rolesLoading}
              >
                הוסף תפקיד חדש
              </Button>
            </div>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד (אופציונלי)" />
              </SelectTrigger>
              <SelectContent className="z-[1000] bg-popover border shadow-lg max-h-[200px] overflow-y-auto">
                <SelectItem value="no-role">ללא תפקיד מוגדר</SelectItem>
                {roles.map((roleItem) => (
                  <SelectItem key={roleItem.id} value={roleItem.name}>
                    {roleItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Required Employees */}
          <div className="space-y-2">
            <Label>מספר עובדים נדרש</Label>
            <Input
              type="number"
              min="1"
              max="50"
              value={requiredEmployees}
              onChange={(e) => setRequiredEmployees(Math.max(1, parseInt(e.target.value) || 1))}
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground">
              כמה עובדים נדרשים לכיסוי המשמרת הזו
            </p>
          </div>

          {/* Notes - Only when not using multiple branches */}
          {!(isMultipleShifts && selectedBranches.length > 0) && (
            <div className="space-y-2">
              <Label>הערות</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערות נוספות..."
                rows={3}
              />
            </div>
          )}

          {/* Preview for multiple shifts with branches */}
          {isMultipleShifts && selectedBranches.length > 0 && previewShifts.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <Label className="text-sm font-medium">תצוגה מקדימה:</Label>
              <p className="text-sm text-blue-700 mt-1">
                יווצרו {previewShifts.length} משמרות בין התאריכים שנבחרו
              </p>
              {previewShifts.length > 10 && (
                <p className="text-xs text-blue-600 mt-1">
                  מציג רק 10 ראשונות: {previewShifts.slice(0, 10).map(s => 
                    new Date(s.shift_date).toLocaleDateString('he-IL')
                  ).join(', ')}...
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'יוצר...' : 
               isMultipleShifts && selectedBranches.length > 0 ? `צור ${previewShifts.length} משמרות` :
               isMultipleShifts ? 'צור משמרות' : 
               'צור משמרת'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              ביטול
            </Button>
          </div>

          {/* Dialogs */}
          <AddRoleDialog
            open={showAddRoleDialog}
            onOpenChange={setShowAddRoleDialog}
            onRoleCreated={addRole}
            loading={rolesLoading}
          />

          <BranchDialog
            isOpen={showBranchDialog}
            onClose={() => setShowBranchDialog(false)}
            onSuccess={onBranchCreated}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};