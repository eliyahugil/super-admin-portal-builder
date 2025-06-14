
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface EmployeesTableFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
}

export const EmployeesTableFilters: React.FC<EmployeesTableFiltersProps> = ({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4" dir="rtl">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="חיפוש לפי שם, מספר עובד או טלפון..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          dir="rtl"
        />
      </div>
      
      <Select value={filterType || "all"} onValueChange={(value) => onFilterTypeChange(value === "all" ? "" : value)}>
        <SelectTrigger>
          <SelectValue placeholder="כל הסוגים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסוגים</SelectItem>
          <SelectItem value="permanent">קבוע</SelectItem>
          <SelectItem value="temporary">זמני</SelectItem>
          <SelectItem value="youth">נוער</SelectItem>
          <SelectItem value="contractor">קבלן</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={filterStatus || "all"} onValueChange={(value) => onFilterStatusChange(value === "all" ? "" : value)}>
        <SelectTrigger>
          <SelectValue placeholder="כל הסטטוסים" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל הסטטוסים</SelectItem>
          <SelectItem value="active">פעיל</SelectItem>
          <SelectItem value="inactive">לא פעיל</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
