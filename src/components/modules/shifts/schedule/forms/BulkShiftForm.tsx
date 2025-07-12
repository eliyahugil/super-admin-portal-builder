import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Building, CheckCircle } from 'lucide-react';
import { format, addDays, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useShiftRoles } from '../../templates/useShiftRoles';
import { AddRoleDialog } from '../../templates/AddRoleDialog';
import { BranchDialog } from '../../../branches/BranchDialog';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import type { Employee, Branch, CreateShiftData } from '../types';

interface BulkShiftFormProps {
  onSubmit: (shifts: Omit<CreateShiftData, 'shift_template_id'>[]) => Promise<void>;
  employees: Employee[];
  branches: Branch[];
  onBranchCreated?: () => void;
  onClose: () => void;
}

export const BulkShiftForm: React.FC<BulkShiftFormProps> = ({
  onSubmit,
  employees,
  branches,
  onBranchCreated,
  onClose
}) => {
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();
  const { roles, loading: rolesLoading, addRole } = useShiftRoles(businessId);
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [role, setRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
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

  const generateShifts = (): Omit<CreateShiftData, 'shift_template_id'>[] => {
    if (!startDate || !endDate || selectedDays.length === 0 || selectedBranches.length === 0) return [];

    const shifts: Omit<CreateShiftData, 'shift_template_id'>[] = [];
    let currentDate = new Date(startDate);

    while (!isAfter(currentDate, endDate)) {
      const dayOfWeek = currentDate.getDay();
      
      if (selectedDays.includes(dayOfWeek)) {
        // Create a shift for each selected branch
        selectedBranches.forEach(branchId => {
          shifts.push({
            shift_date: format(currentDate, 'yyyy-MM-dd'),
            start_time: startTime,
            end_time: endTime,
            employee_id: null,
            branch_id: branchId || null,
            role: role && role !== 'none' && role !== '' ? role : null,
            notes: null,
            status: 'pending'
          });
        });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    return shifts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    if (selectedBranches.length === 0) {
      toast({
        title: "שגיאה",
        description: "אנא בחר לפחות סניף אחד",
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

    const shifts = generateShifts();
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

    setIsSubmitting(true);
    try {
      await onSubmit(shifts);
      
      toast({
        title: "הצלחה",
        description: `${shifts.length} משמרות נוצרו בהצלחה`,
      });
      
      setShowSuccess(true);
      
      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setStartTime('09:00');
      setEndTime('17:00');
      setSelectedDays([]);
      setSelectedBranches([]);
      setRole('');
      
      // Close after success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error creating bulk shifts:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה ביצירת המשמרות",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewShifts = generateShifts();

  if (showSuccess) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-700">
            {previewShifts.length} משמרות נוצרו בהצלחה!
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            המערכת תיסגר תוך כמה שניות...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date Range */}
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

      {/* Days of Week */}
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

      {/* Branch Selection */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>סניפים *</Label>
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
        {selectedBranches.length > 0 && (
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
          <SelectContent>
            <SelectItem value="none">ללא תפקיד מוגדר</SelectItem>
            {roles.map((roleItem) => (
              <SelectItem key={roleItem.id} value={roleItem.name}>
                {roleItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preview */}
      {previewShifts.length > 0 && (
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
        <Button type="submit" disabled={isSubmitting || previewShifts.length === 0}>
          {isSubmitting ? 'יוצר...' : `צור ${previewShifts.length} משמרות`}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
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