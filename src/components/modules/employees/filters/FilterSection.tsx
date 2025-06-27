
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

interface FilterSectionProps {
  filters: EmployeeListFilters;
  onFiltersChange: (updates: Partial<EmployeeListFilters>) => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleTenureChange = (value: string) => {
    onFiltersChange({ tenure: value as EmployeeListFilters['tenure'] });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* סוג עובד */}
      <div>
        <Label>סוג עובד</Label>
        <Select 
          value={filters.employeeType} 
          onValueChange={(value) => onFiltersChange({ employeeType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסוגים</SelectItem>
            <SelectItem value="permanent">קבוע</SelectItem>
            <SelectItem value="temporary">זמני</SelectItem>
            <SelectItem value="contractor">קבלן</SelectItem>
            <SelectItem value="youth">נוער</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* סטטוס */}
      <div>
        <Label>סטטוס</Label>
        <Select 
          value={filters.status} 
          onValueChange={(value) => onFiltersChange({ status: value as EmployeeListFilters['status'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="active">פעיל</SelectItem>
            <SelectItem value="inactive">לא פעיל</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* וותק */}
      <div>
        <Label>וותק</Label>
        <Select value={filters.tenure} onValueChange={handleTenureChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הוותקים</SelectItem>
            <SelectItem value="new">חדשים (עד 3 חודשים)</SelectItem>
            <SelectItem value="experienced">מנוסים (3-12 חודשים)</SelectItem>
            <SelectItem value="veteran">ותיקים (מעל שנה)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* סניף */}
      <div>
        <Label>סניף</Label>
        <Select 
          value={filters.branch} 
          onValueChange={(value) => onFiltersChange({ branch: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסניפים</SelectItem>
            {/* TODO: צריך להוסיף רשימת סניפים דינמית */}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
