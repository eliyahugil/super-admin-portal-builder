
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import type { EmployeeData } from '../types';

interface ShiftTemplate {
  start_time: string;
  end_time: string;
  required_employees: number;
  role_preference: string;
  assign_employees: boolean;
  selected_employees: string[];
}

interface BulkShiftCreatorShiftTemplateProps {
  shiftTemplate: ShiftTemplate;
  setShiftTemplate: React.Dispatch<React.SetStateAction<ShiftTemplate>>;
  employees: EmployeeData[];
  toggleEmployee: (employeeId: string) => void;
}

export const BulkShiftCreatorShiftTemplate: React.FC<BulkShiftCreatorShiftTemplateProps> = ({
  shiftTemplate,
  setShiftTemplate,
  employees,
  toggleEmployee
}) => {
  return (
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
  );
};
