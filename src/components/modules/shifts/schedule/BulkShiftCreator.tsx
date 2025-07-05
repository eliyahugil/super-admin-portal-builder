
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Copy, Plus, Minus, Calendar } from 'lucide-react';
import type { EmployeeData, BranchData, ShiftScheduleData } from './types';

interface BulkShiftCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shifts: Omit<ShiftScheduleData, 'id' | 'created_at'>[]) => void;
  employees: EmployeeData[];
  branches: BranchData[];
}

export const BulkShiftCreator: React.FC<BulkShiftCreatorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  branches
}) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [shiftTemplate, setShiftTemplate] = useState({
    start_time: '09:00',
    end_time: '17:00',
    required_employees: 1,
    role_preference: '',
    assign_employees: false,
    selected_employees: [] as string[]
  });
  const [currentDate, setCurrentDate] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
    selectedWeekdays: [] as number[]
  });
  const [useWeekdayRange, setUseWeekdayRange] = useState(false);

  const weekdays = [
    { value: 0, label: 'ראשון' },
    { value: 1, label: 'שני' },
    { value: 2, label: 'שלישי' },
    { value: 3, label: 'רביעי' },
    { value: 4, label: 'חמישי' },
    { value: 5, label: 'שישי' },
    { value: 6, label: 'שבת' }
  ];

  const addDate = () => {
    if (currentDate && !selectedDates.includes(currentDate)) {
      setSelectedDates([...selectedDates, currentDate]);
      setCurrentDate('');
    }
  };

  const removeDate = (date: string) => {
    setSelectedDates(selectedDates.filter(d => d !== date));
  };

  const toggleBranch = (branchId: string) => {
    if (selectedBranches.includes(branchId)) {
      setSelectedBranches(selectedBranches.filter(id => id !== branchId));
    } else {
      setSelectedBranches([...selectedBranches, branchId]);
    }
  };

  const toggleEmployee = (employeeId: string) => {
    const newSelected = shiftTemplate.selected_employees.includes(employeeId)
      ? shiftTemplate.selected_employees.filter(id => id !== employeeId)
      : [...shiftTemplate.selected_employees, employeeId];
    
    setShiftTemplate(prev => ({
      ...prev,
      selected_employees: newSelected
    }));
  };

  const toggleWeekday = (weekday: number) => {
    const newWeekdays = dateRange.selectedWeekdays.includes(weekday)
      ? dateRange.selectedWeekdays.filter(w => w !== weekday)
      : [...dateRange.selectedWeekdays, weekday];
    
    setDateRange(prev => ({
      ...prev,
      selectedWeekdays: newWeekdays
    }));
  };

  const generateDatesFromRange = () => {
    if (!dateRange.start || !dateRange.end || dateRange.selectedWeekdays.length === 0) {
      return [];
    }

    const dates: string[] = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (dateRange.selectedWeekdays.includes(d.getDay())) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    
    return dates;
  };

  const getAllDates = () => {
    const manualDates = selectedDates;
    const rangeDates = useWeekdayRange ? generateDatesFromRange() : [];
    return Array.from(new Set([...manualDates, ...rangeDates]));
  };

  const generateShifts = () => {
    const shifts: Omit<ShiftScheduleData, 'id' | 'created_at'>[] = [];
    const allDates = getAllDates();
    
    allDates.forEach(date => {
      selectedBranches.forEach(branchId => {
        const branch = branches.find(b => b.id === branchId);
        
        if (shiftTemplate.assign_employees && shiftTemplate.selected_employees.length > 0) {
          // Create shifts for selected employees
          shiftTemplate.selected_employees.forEach(employeeId => {
            shifts.push({
              employee_id: employeeId,
              shift_date: date,
              start_time: shiftTemplate.start_time,
              end_time: shiftTemplate.end_time,
              status: 'pending',
              branch_id: branchId,
              branch_name: branch?.name,
              role_preference: shiftTemplate.role_preference,
              notes: `משמרת שנוצרה דרך יצירה בכמות`
            });
          });
        } else {
          // Create unassigned shifts
          for (let i = 0; i < shiftTemplate.required_employees; i++) {
            shifts.push({
              employee_id: '',
              shift_date: date,
              start_time: shiftTemplate.start_time,
              end_time: shiftTemplate.end_time,
              status: 'pending',
              branch_id: branchId,
              branch_name: branch?.name,
              role_preference: shiftTemplate.role_preference,
              notes: `משמרת ${i + 1} מתוך ${shiftTemplate.required_employees} - לא מוקצית`
            });
          }
        }
      });
    });

    return shifts;
  };

  const handleSubmit = () => {
    const shifts = generateShifts();
    onSubmit(shifts);
    
    // Reset form
    setSelectedDates([]);
    setSelectedBranches([]);
    setShiftTemplate({
      start_time: '09:00',
      end_time: '17:00',
      required_employees: 1,
      role_preference: '',
      assign_employees: false,
      selected_employees: []
    });
    setDateRange({
      start: '',
      end: '',
      selectedWeekdays: []
    });
    setUseWeekdayRange(false);
    onClose();
  };

  const previewCount = generateShifts().length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            יצירת משמרות בכמות גדולה
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">בחירת תאריכים</Label>
            
            {/* Toggle between manual and range selection */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-range"
                checked={useWeekdayRange}
                onCheckedChange={(checked) => setUseWeekdayRange(checked === true)}
              />
              <Label htmlFor="use-range">השתמש בטווח תאריכים עם ימי שבוע</Label>
            </div>

            {!useWeekdayRange ? (
              // Manual date selection
              <>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addDate} disabled={!currentDate}>
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {selectedDates.map(date => (
                    <Badge key={date} variant="secondary" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(date).toLocaleDateString('he-IL')}
                      <button
                        onClick={() => removeDate(date)}
                        className="ml-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </>
            ) : (
              // Range selection with weekdays
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>תאריך התחלה</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>תאריך סיום</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>ימי השבוע</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekdays.map(weekday => (
                      <div key={weekday.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`weekday-${weekday.value}`}
                          checked={dateRange.selectedWeekdays.includes(weekday.value)}
                          onCheckedChange={(checked) => checked === true && toggleWeekday(weekday.value)}
                        />
                        <Label htmlFor={`weekday-${weekday.value}`}>
                          {weekday.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Branch Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">בחירת סניפים</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {branches.map(branch => (
                <div key={branch.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`branch-${branch.id}`}
                    checked={selectedBranches.includes(branch.id)}
                    onCheckedChange={(checked) => checked === true && toggleBranch(branch.id)}
                  />
                  <Label htmlFor={`branch-${branch.id}`} className="flex-1 cursor-pointer">
                    {branch.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Shift Template */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">תבנית משמרת</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">שעת התחלה</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={shiftTemplate.start_time}
                  onChange={(e) => setShiftTemplate(prev => ({
                    ...prev,
                    start_time: e.target.value
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_time">שעת סיום</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={shiftTemplate.end_time}
                  onChange={(e) => setShiftTemplate(prev => ({
                    ...prev,
                    end_time: e.target.value
                  }))}
                />
              </div>

              {!shiftTemplate.assign_employees && (
                <div className="space-y-2">
                  <Label htmlFor="required_employees">עובדים נדרשים</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShiftTemplate(prev => ({
                        ...prev,
                        required_employees: Math.max(1, prev.required_employees - 1)
                      }))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">
                      {shiftTemplate.required_employees}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShiftTemplate(prev => ({
                        ...prev,
                        required_employees: prev.required_employees + 1
                      }))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">תפקיד</Label>
                <Select
                  value={shiftTemplate.role_preference}
                  onValueChange={(value) => setShiftTemplate(prev => ({
                    ...prev,
                    role_preference: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תפקיד" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">כל התפקידים</SelectItem>
                    <SelectItem value="cashier">קופאי</SelectItem>
                    <SelectItem value="sales">מכירות</SelectItem>
                    <SelectItem value="manager">מנהל</SelectItem>
                    <SelectItem value="security">אבטחה</SelectItem>
                    <SelectItem value="cleaner">ניקיון</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Employee Assignment */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="assign-employees"
                  checked={shiftTemplate.assign_employees}
                  onCheckedChange={(checked) => setShiftTemplate(prev => ({
                    ...prev,
                    assign_employees: checked === true,
                    selected_employees: []
                  }))}
                />
                <Label htmlFor="assign-employees">הקצה עובדים למשמרות</Label>
              </div>

              {shiftTemplate.assign_employees && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto border rounded p-3">
                  {employees.map(employee => (
                    <div key={employee.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={shiftTemplate.selected_employees.includes(employee.id)}
                        onCheckedChange={(checked) => checked === true && toggleEmployee(employee.id)}
                      />
                      <Label htmlFor={`employee-${employee.id}`} className="flex-1 cursor-pointer text-sm">
                        {employee.first_name} {employee.last_name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {previewCount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">תצוגה מקדימה</h3>
              <p className="text-blue-800">
                יתווספו <strong className="text-blue-900">{previewCount}</strong> משמרות חדשות
              </p>
              <div className="text-sm text-blue-700 mt-1">
                {getAllDates().length} תאריכים × {selectedBranches.length} סניפים × {
                  shiftTemplate.assign_employees 
                    ? shiftTemplate.selected_employees.length 
                    : shiftTemplate.required_employees
                } עובדים = {previewCount} משמרות
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={getAllDates().length === 0 || selectedBranches.length === 0}
            >
              צור {previewCount} משמרות
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
