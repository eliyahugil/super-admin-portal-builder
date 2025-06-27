
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

interface SortSectionProps {
  filters: EmployeeListFilters;
  onFiltersChange: (updates: Partial<EmployeeListFilters>) => void;
  onResetFilters: () => void;
}

export const SortSection: React.FC<SortSectionProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
}) => {
  const handleSortChange = (field: string, value: string) => {
    if (field === 'sortBy') {
      onFiltersChange({ sortBy: value as EmployeeListFilters['sortBy'] });
    } else {
      onFiltersChange({ sortOrder: value as EmployeeListFilters['sortOrder'] });
    }
  };

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Label>מיון לפי</Label>
        <Select 
          value={filters.sortBy} 
          onValueChange={(value) => handleSortChange('sortBy', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">שם</SelectItem>
            <SelectItem value="hire_date">תאריך קבלה לעבודה</SelectItem>
            <SelectItem value="employee_type">סוג עובד</SelectItem>
            <SelectItem value="created_at">תאריך הוספה למערכת</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label>סדר</Label>
        <Select 
          value={filters.sortOrder} 
          onValueChange={(value) => handleSortChange('sortOrder', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">עולה (א-ת, ישן-חדש)</SelectItem>
            <SelectItem value="desc">יורד (ת-א, חדש-ישן)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        onClick={onResetFilters}
        className="gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        אפס פילטרים
      </Button>
    </div>
  );
};
