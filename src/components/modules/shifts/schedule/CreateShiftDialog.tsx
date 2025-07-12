
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, Plus, Building, UserPlus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Employee, Branch, CreateShiftData } from './types';

interface CreateShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: CreateShiftData) => Promise<void>;
  employees: Employee[];
  branches: Branch[];
  onBranchCreated?: () => void;
}

export const CreateShiftDialog: React.FC<CreateShiftDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  branches,
  onBranchCreated
}) => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  
  // Basic shift data
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [branchId, setBranchId] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Multiple shifts
  const [isMultipleShifts, setIsMultipleShifts] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(1);
  
  // Quick create states
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');

  // Quick create functions
  const createNewRole = async () => {
    if (!newRoleName.trim()) return;
    
    setRole(newRoleName);
    setNewRoleName('');
    setIsCreatingRole(false);
    
    toast({
      title: "תפקיד נוצר",
      description: `התפקיד "${newRoleName}" נוצר בהצלחה`,
    });
  };

  const createNewBranch = async () => {
    if (!newBranchName.trim()) return;
    
    if (!businessId) {
      toast({
        title: "שגיאה",
        description: "לא נמצא מזהה עסק. אנא נסה שוב.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: newBranch, error } = await supabase
        .from('branches')
        .insert({
          name: newBranchName,
          address: newBranchAddress || null,
          business_id: businessId,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      setBranchId(newBranch.id);
      setNewBranchName('');
      setNewBranchAddress('');
      setIsCreatingBranch(false);
      
      toast({
        title: "סניף נוצר",
        description: `הסניף "${newBranchName}" נוצר בהצלחה`,
      });
      
      // Refresh branches list
      if (onBranchCreated) {
        onBranchCreated();
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה ביצירת הסניף",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "שגיאה",
        description: "אנא בחר תאריך",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
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
            shift_template_id: null
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
          shift_template_id: null
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
      setIsMultipleShifts(false);
      setNumberOfDays(1);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
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
    setShowSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {showSuccess ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                משמרת נוצרה בהצלחה!
              </>
            ) : (
              'יצירת משמרת חדשה'
            )}
          </DialogTitle>
        </DialogHeader>
        
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm">
              המשמרת נוצרה בהצלחה! ניתן ליצור משמרת נוספת או לסגור את החלון.
            </p>
          </div>
        )}
        
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

          {/* Branch Selection with Quick Create */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>סניף</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingBranch(true)}
                className="h-auto p-1"
              >
                <Plus className="h-4 w-4" />
                הוסף סניף
              </Button>
            </div>
            
            {isCreatingBranch ? (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/10">
                <Input
                  placeholder="שם הסניף"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                />
                <Input
                  placeholder="כתובת (אופציונלי)"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={createNewBranch}
                    disabled={!newBranchName.trim()}
                  >
                    <Building className="h-4 w-4 ml-1" />
                    צור סניף
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingBranch(false);
                      setNewBranchName('');
                      setNewBranchAddress('');
                    }}
                  >
                    ביטול
                  </Button>
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
          </div>

          {/* Role Input with Quick Create */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>תפקיד</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingRole(true)}
                className="h-auto p-1"
              >
                <Plus className="h-4 w-4" />
                הוסף תפקיד
              </Button>
            </div>
            
            {isCreatingRole ? (
              <div className="space-y-2 p-3 border rounded-lg bg-muted/10">
                <Input
                  placeholder="שם התפקיד"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={createNewRole}
                    disabled={!newRoleName.trim()}
                  >
                    <UserPlus className="h-4 w-4 ml-1" />
                    צור תפקיד
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCreatingRole(false);
                      setNewRoleName('');
                    }}
                  >
                    ביטול
                  </Button>
                </div>
              </div>
            ) : (
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר תפקיד (אופציונלי)" />
                </SelectTrigger>
                <SelectContent className="z-[1000] bg-popover border shadow-lg max-h-[200px] overflow-y-auto">
                  <SelectItem value="no-role">ללא תפקיד מוגדר</SelectItem>
                  <SelectItem value="cashier">קופאי</SelectItem>
                  <SelectItem value="sales">מכירות</SelectItem>
                  <SelectItem value="manager">מנהל</SelectItem>
                  <SelectItem value="security">אבטחה</SelectItem>
                  <SelectItem value="cleaner">ניקיון</SelectItem>
                </SelectContent>
              </Select>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'יוצר...' : 
               isMultipleShifts ? `צור ${numberOfDays} משמרות` : 'צור משמרת'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              {showSuccess ? 'סגור' : 'ביטול'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
