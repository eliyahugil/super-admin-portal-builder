
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy } from 'lucide-react';
import { BulkShiftCreatorDateSelection } from './components/BulkShiftCreatorDateSelection';
import { BulkShiftCreatorShiftTemplate } from './components/BulkShiftCreatorShiftTemplate';
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
    role_preference: 'none',
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
          shiftTemplate.selected_employees.forEach(employeeId => {
            shifts.push({
              employee_id: employeeId,
              shift_date: date,
              start_time: shiftTemplate.start_time,
              end_time: shiftTemplate.end_time,
              status: 'pending',
              branch_id: branchId,
              branch_name: branch?.name,
              role_preference: shiftTemplate.role_preference === 'none' ? '' : shiftTemplate.role_preference,
              notes: `משמרת שנוצרה דרך יצירה בכמות`
            });
          });
        } else {
          for (let i = 0; i < shiftTemplate.required_employees; i++) {
            shifts.push({
              employee_id: '',
              shift_date: date,
              start_time: shiftTemplate.start_time,
              end_time: shiftTemplate.end_time,
              status: 'pending',
              branch_id: branchId,
              branch_name: branch?.name,
              role_preference: shiftTemplate.role_preference === 'none' ? '' : shiftTemplate.role_preference,
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
    console.log('📝 Bulk creating shifts:', shifts);
    onSubmit(shifts);
    
    // Reset form
    setSelectedDates([]);
    setSelectedBranches([]);
    setShiftTemplate({
      start_time: '09:00',
      end_time: '17:00',
      required_employees: 1,
      role_preference: 'none',
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
          <BulkShiftCreatorDateSelection
            useWeekdayRange={useWeekdayRange}
            setUseWeekdayRange={setUseWeekdayRange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDates={selectedDates}
            addDate={addDate}
            removeDate={removeDate}
            dateRange={dateRange}
            setDateRange={setDateRange}
            toggleWeekday={toggleWeekday}
          />

          {/* Branch Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">בחירת סניפים</Label>
            {branches.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                אין סניפים זמינים. יש ליצור סניף לפני יצירת משמרות.
              </div>
            ) : (
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
            )}
          </div>

          {/* Shift Template */}
          <BulkShiftCreatorShiftTemplate
            shiftTemplate={shiftTemplate}
            setShiftTemplate={setShiftTemplate}
            employees={employees}
            toggleEmployee={toggleEmployee}
          />

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
