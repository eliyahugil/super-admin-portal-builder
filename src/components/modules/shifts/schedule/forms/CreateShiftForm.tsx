import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, CheckCircle, Plus, Building } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useShiftRoles } from '../../templates/useShiftRoles';
import { AddRoleDialog } from '../../templates/AddRoleDialog';
import { BranchDialog } from '../../../branches/BranchDialog';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Employee, Branch, CreateShiftData } from '../types';

interface CreateShiftFormProps {
  onSubmit: (shift: CreateShiftData) => Promise<void>;
  employees: Employee[];
  branches: Branch[];
  onBranchCreated?: () => void;
  onClose: () => void;
}

export const CreateShiftForm: React.FC<CreateShiftFormProps> = ({
  onSubmit,
  employees,
  branches,
  onBranchCreated,
  onClose
}) => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  const { roles, loading: rolesLoading, addRole } = useShiftRoles(businessId);
  
  // Basic shift data
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [requiredEmployees, setRequiredEmployees] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Multiple shifts
  const [isMultipleShifts, setIsMultipleShifts] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(1);
  
  // Dialogs
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [showBranchDialog, setShowBranchDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      console.warn('⚠️ Form submission prevented - already submitting or submitted');
      return;
    }
    
    if (!date) {
      toast({
        title: "שגיאה",
        description: "אנא בחר תאריך",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);
    setShowSuccess(false);
    
    try {
      if (isMultipleShifts) {
        // Create multiple shifts
        for (let i = 0; i < numberOfDays; i++) {
          const shiftDate = addDays(date, i);
          const shiftData: CreateShiftData = {
            shift_date: format(shiftDate, 'yyyy-MM-dd'),
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
        }
        
        toast({
          title: "הצלחה",
          description: `${numberOfDays} משמרות נוצרו בהצלחה`,
        });
      } else {
        // Create single shift
        const shiftData: CreateShiftData = {
          shift_date: format(date, 'yyyy-MM-dd'),
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
      
      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setDate(undefined);
      setStartTime('09:00');
      setEndTime('17:00');
      setEmployeeId('');
      setBranchId('');
      setRole('');
      setNotes('');
      setRequiredEmployees(1);
      setIsMultipleShifts(false);
      setNumberOfDays(1);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setHasSubmitted(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error creating shift:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'שגיאה לא ידועה';
      toast({
        title: "שגיאה",
        description: errorMessage.includes('זהה כבר קיימת') 
          ? errorMessage 
          : 'שגיאה ביצירת המשמרת: ' + errorMessage,
        variant: "destructive"
      });
      
      // Reset hasSubmitted on error so user can try again
      setHasSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-700">המשמרת נוצרה בהצלחה!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            המערכת תיסגר תוך כמה שניות...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Multiple Shifts Toggle */}
      <div className="flex items-center justify-between space-x-2 p-3 border rounded-lg bg-muted/20">
        <div className="space-y-0.5">
          <Label className="text-base">יצירת משמרות מרובות</Label>
          <p className="text-sm text-muted-foreground">
            יצירת משמרות עוקבות במספר ימים
          </p>
        </div>
        <Switch
          checked={isMultipleShifts}
          onCheckedChange={setIsMultipleShifts}
        />
      </div>

      {/* Date Picker */}
      <div className="space-y-2">
        <Label>
          {isMultipleShifts ? 'תאריך התחלה *' : 'תאריך *'}
        </Label>
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

      {/* Number of Days for Multiple Shifts */}
      {isMultipleShifts && (
        <div className="space-y-2">
          <Label>מספר ימים</Label>
          <Input
            type="number"
            min="1"
            max="14"
            value={numberOfDays}
            onChange={(e) => setNumberOfDays(Number(e.target.value))}
            placeholder="מספר ימים רצופים"
          />
          {date && (
            <p className="text-sm text-muted-foreground">
              משמרות יווצרו מ-{format(date, 'dd/MM/yyyy')} עד {format(addDays(date, numberOfDays - 1), 'dd/MM/yyyy')}
            </p>
          )}
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

      {/* Employee Selection */}
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

      {/* Branch Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>סניף</Label>
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
        <Label>כמות עובדים נדרשים</Label>
        <Input
          type="number"
          min="1"
          max="20"
          value={requiredEmployees}
          onChange={(e) => setRequiredEmployees(Number(e.target.value))}
          placeholder="מספר עובדים נדרשים"
        />
        <p className="text-sm text-muted-foreground">
          המערכת תתן עדיפות למילוי המשרה הבסיסית לפני הוספת תגבורים
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>הערות</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="הערות נוספות..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || hasSubmitted}
          className={cn(
            isSubmitting && "animate-pulse",
            hasSubmitted && "opacity-50"
          )}
        >
          {isSubmitting ? 'יוצר...' : 
           hasSubmitted ? 'נוצר בהצלחה!' :
           isMultipleShifts ? `צור ${numberOfDays} משמרות` : 'צור משמרת'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
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
  );
};