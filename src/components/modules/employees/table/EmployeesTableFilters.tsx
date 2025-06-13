
import React from 'react';
import { Input } from '@/components/ui/input';
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder="חיפוש לפי שם, מספר עובד או טלפון..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <select 
        value={filterType} 
        onChange={(e) => onFilterTypeChange(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
      >
        <option value="all">כל הסוגים</option>
        <option value="permanent">קבוע</option>
        <option value="temporary">זמני</option>
        <option value="youth">נוער</option>
        <option value="contractor">קבלן</option>
      </select>
      
      <select 
        value={filterStatus} 
        onChange={(e) => onFilterStatusChange(e.target.value)}
        className="border rounded-md px-3 py-2 text-sm"
      >
        <option value="all">כל הסטטוסים</option>
        <option value="active">פעיל</option>
        <option value="inactive">לא פעיל</option>
      </select>
    </div>
  );
};
