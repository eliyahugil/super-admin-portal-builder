import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Copy, Plus, Building } from 'lucide-react';
import { format, addDays, addWeeks, addMonths, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { BranchDialog } from '../../branches/BranchDialog';
import type { Employee, Branch, CreateShiftData } from './types';

interface QuickMultipleShiftsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shifts: CreateShiftData[]) => Promise<void>;
  employees: Employee[];
  branches: Branch[];
  prefilledShift?: Partial<CreateShiftData>;
  onBranchCreated?: () => void;
}

export const QuickMultipleShiftsDialog: React.FC<QuickMultipleShiftsDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  branches,
  prefilledShift,
  onBranchCreated
}) => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  
  // Basic shift template
  const [startTime, setStartTime] = useState(prefilledShift?.start_time || '09:00');
  const [endTime, setEndTime] = useState(prefilledShift?.end_time || '17:00');
  const [employeeId, setEmployeeId] = useState(prefilledShift?.employee_id || '');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(
    prefilledShift?.branch_id ? [prefilledShift.branch_id] : []
  );
  const [role, setRole] = useState(prefilledShift?.role || '');
  
  // Creation options
  const [creationType, setCreationType] = useState<'daily' | 'weekly' | 'dates'>('daily');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [numberOfShifts, setNumberOfShifts] = useState(5);
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Monday to Friday
  const [specificDates, setSpecificDates] = useState<Date[]>([]);
  const [showBranchDialog, setShowBranchDialog] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  const generateShiftDates = (): Date[] => {
    const dates: Date[] = [];
    
    if (!startDate) return dates;

    switch (creationType) {
      case 'daily':
        let currentDate = new Date(startDate);
        let count = 0;
        
        while (count < numberOfShifts) {
          const dayOfWeek = currentDate.getDay();
          
          if (!skipWeekends || (dayOfWeek !== 5 && dayOfWeek !== 6)) { // Skip Friday and Saturday if needed
            dates.push(new Date(currentDate));
            count++;
          }
          
          currentDate = addDays(currentDate, 1);
        }
        break;
        
      case 'weekly':
        if (!endDate) break;
        
        let weekStart = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(endDate, { weekStartsOn: 0 });
        
        while (weekStart <= weekEnd) {
          const weekDates = eachDayOfInterval({
            start: weekStart,
            end: endOfWeek(weekStart, { weekStartsOn: 0 })
          });
          
          weekDates.forEach(date => {
            const dayOfWeek = date.getDay();
            if (selectedDays.includes(dayOfWeek)) {
              dates.push(date);
            }
          });
          
          weekStart = addWeeks(weekStart, 1);
        }
        break;
        
      case 'dates':
        dates.push(...specificDates);
        break;
    }
    
    return dates.sort((a, b) => a.getTime() - b.getTime());
  };

  const previewDates = generateShiftDates();

  const handleSubmit = async () => {
    console.log('🎯 QuickMultipleShiftsDialog: handleSubmit called');
    const dates = generateShiftDates();
    console.log('🎯 Generated dates:', dates);
    
    if (dates.length === 0) {
      console.log('❌ No dates generated');
      toast({
        title: "שגיאה",
        description: "אנא בחר לפחות תאריך אחד",
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

    setIsSubmitting(true);
    
    try {
      const shifts: CreateShiftData[] = [];
      
      // Create shifts for each combination of date and branch
      dates.forEach(date => {
        selectedBranches.forEach(branchId => {
          shifts.push({
            shift_date: format(date, 'yyyy-MM-dd'),
            start_time: startTime,
            end_time: endTime,
            employee_id: employeeId === 'no-employee' ? null : employeeId || null,
            branch_id: branchId,
            role: role === 'no-role' ? null : role || null,
            notes: null,
            status: 'pending',
            shift_template_id: null,
            required_employees: 1,
            priority: 'normal'
          });
        });
      });

      console.log('🎯 About to call onSubmit with shifts:', shifts);
      await onSubmit(shifts);
      console.log('✅ onSubmit completed successfully');
      
      toast({
        title: "הצלחה",
        description: `${shifts.length} משמרות נוצרו בהצלחה (${dates.length} תאריכים × ${selectedBranches.length} סניפים)`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating multiple shifts:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה ביצירת המשמרות",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const addSpecificDate = (date: Date | undefined) => {
    if (date && !specificDates.some(d => d.getTime() === date.getTime())) {
      setSpecificDates(prev => [...prev, date].sort((a, b) => a.getTime() - b.getTime()));
    }
  };

  const removeSpecificDate = (dateToRemove: Date) => {
    setSpecificDates(prev => prev.filter(d => d.getTime() !== dateToRemove.getTime()));
  };

  const handleCreateBranch = () => {
    setShowBranchDialog(true);
  };

  const handleBranchCreated = () => {
    // רענן את רשימת הסניפים
    if (onBranchCreated) {
      onBranchCreated();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            יצירת משמרות מרובות
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Shift Template */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold">תבנית משמרת</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שעת התחלה</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>שעת סיום</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>עובד</Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר עובד" />
                  </SelectTrigger>
                  <SelectContent className="z-[1000]">
                    <SelectItem value="no-employee">ללא עובד</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>סניפים</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateBranch}
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
            </div>

            <div className="space-y-2">
              <Label>תפקיד</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר תפקיד" />
                </SelectTrigger>
                <SelectContent className="z-[1000]">
                  <SelectItem value="no-role">ללא תפקיד</SelectItem>
                  <SelectItem value="cashier">קופאי</SelectItem>
                  <SelectItem value="sales">מכירות</SelectItem>
                  <SelectItem value="manager">מנהל</SelectItem>
                  <SelectItem value="security">אבטחה</SelectItem>
                  <SelectItem value="cleaner">ניקיון</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Creation Type */}
          <div className="space-y-4">
            <Label>סוג יצירה</Label>
            <Select value={creationType} onValueChange={(value: any) => setCreationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">ימים רצופים</SelectItem>
                <SelectItem value="weekly">בחירת ימים בשבוע</SelectItem>
                <SelectItem value="dates">תאריכים ספציפיים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Creation Options */}
          {creationType === 'daily' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>תאריך התחלה</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'dd/MM/yyyy') : 'בחר תאריך'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>מספר משמרות</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={numberOfShifts}
                  onChange={(e) => setNumberOfShifts(Number(e.target.value))}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={skipWeekends}
                  onCheckedChange={setSkipWeekends}
                />
                <Label>דלג על סופי שבוע</Label>
              </div>
            </div>
          )}

          {creationType === 'weekly' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>מתאריך</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'בחר תאריך'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>עד תאריך</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'בחר תאריך'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>ימים בשבוע</Label>
                <div className="grid grid-cols-4 gap-2">
                  {dayNames.map((day, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedDays.includes(index)}
                        onCheckedChange={() => handleDayToggle(index)}
                      />
                      <Label className="text-sm">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {creationType === 'dates' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>הוסף תאריך</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      הוסף תאריך
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      onSelect={addSpecificDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {specificDates.length > 0 && (
                <div className="space-y-2">
                  <Label>תאריכים נבחרים:</Label>
                  <div className="space-y-1">
                    {specificDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span>{format(date, 'dd/MM/yyyy')}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSpecificDate(date)}
                        >
                          הסר
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {previewDates.length > 0 && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <Label className="font-semibold">תצוגה מקדימה:</Label>
              <p className="text-sm text-muted-foreground mt-1">
                יווצרו {previewDates.length} משמרות בתאריכים הבאים:
              </p>
              <div className="mt-2 text-sm">
                {previewDates.slice(0, 5).map(date => format(date, 'dd/MM/yyyy')).join(', ')}
                {previewDates.length > 5 && ` ועוד ${previewDates.length - 5}...`}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || previewDates.length === 0}
            >
              {isSubmitting ? 'יוצר...' : `צור ${previewDates.length} משמרות`}
            </Button>
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
          </div>
        </div>

        <BranchDialog
          isOpen={showBranchDialog}
          onClose={() => setShowBranchDialog(false)}
          onSuccess={handleBranchCreated}
        />
      </DialogContent>
    </Dialog>
  );
};