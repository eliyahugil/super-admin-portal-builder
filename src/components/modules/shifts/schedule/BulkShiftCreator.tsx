
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
    role_preference: ''
  });
  const [currentDate, setCurrentDate] = useState('');

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

  const generateShifts = () => {
    const shifts: Omit<ShiftScheduleData, 'id' | 'created_at'>[] = [];
    
    selectedDates.forEach(date => {
      selectedBranches.forEach(branchId => {
        const branch = branches.find(b => b.id === branchId);
        
        // Create multiple shifts if required_employees > 1
        for (let i = 0; i < shiftTemplate.required_employees; i++) {
          shifts.push({
            employee_id: '', // Unassigned initially
            shift_date: date,
            start_time: shiftTemplate.start_time,
            end_time: shiftTemplate.end_time,
            status: 'pending',
            branch_id: branchId,
            branch_name: branch?.name,
            role_preference: shiftTemplate.role_preference,
            notes: `משמרת ${i + 1} מתוך ${shiftTemplate.required_employees}`
          });
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
      role_preference: ''
    });
    onClose();
  };

  const previewCount = selectedDates.length * selectedBranches.length * shiftTemplate.required_employees;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
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
                    onCheckedChange={() => toggleBranch(branch.id)}
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
                  onChange={(e) => setShiftTemplate({
                    ...shiftTemplate,
                    start_time: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end_time">שעת סיום</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={shiftTemplate.end_time}
                  onChange={(e) => setShiftTemplate({
                    ...shiftTemplate,
                    end_time: e.target.value
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_employees">עובדים נדרשים</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShiftTemplate({
                      ...shiftTemplate,
                      required_employees: Math.max(1, shiftTemplate.required_employees - 1)
                    })}
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
                    onClick={() => setShiftTemplate({
                      ...shiftTemplate,
                      required_employees: shiftTemplate.required_employees + 1
                    })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">תפקיד</Label>
                <Select
                  value={shiftTemplate.role_preference}
                  onValueChange={(value) => setShiftTemplate({
                    ...shiftTemplate,
                    role_preference: value
                  })}
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
          </div>

          {/* Preview */}
          {previewCount > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">תצוגה מקדימה</h3>
              <p className="text-blue-800">
                יתווספו <strong className="text-blue-900">{previewCount}</strong> משמרות חדשות
              </p>
              <div className="text-sm text-blue-700 mt-1">
                {selectedDates.length} תאריכים × {selectedBranches.length} סניפים × {shiftTemplate.required_employees} עובדים = {previewCount} משמרות
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
              disabled={selectedDates.length === 0 || selectedBranches.length === 0}
            >
              צור {previewCount} משמרות
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
