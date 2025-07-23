
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScheduleFiltersType, Employee, Branch } from './types';

interface ScheduleFiltersProps {
  filters: ScheduleFiltersType;
  onFiltersChange: (filters: Partial<ScheduleFiltersType>) => void;
  employees: Employee[];
  branches: Branch[];
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  filters,
  onFiltersChange,
  employees,
  branches
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">סינון משמרות</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">סטטוס</label>
          <Select
            value={filters.status}
            onValueChange={(value) => onFiltersChange({ status: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              <SelectItem value="pending">ממתין</SelectItem>
              <SelectItem value="approved">מאושר</SelectItem>
              <SelectItem value="rejected">נדחה</SelectItem>
              <SelectItem value="completed">הושלם</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">עובד</label>
          <Select
            value={filters.employee}
            onValueChange={(value) => onFiltersChange({ employee: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל העובדים</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">סניף</label>
          <Select
            value={filters.branch}
            onValueChange={(value) => onFiltersChange({ branch: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסניפים</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
