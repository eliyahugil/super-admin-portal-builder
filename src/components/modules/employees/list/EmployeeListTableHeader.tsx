
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

interface EmployeeListTableHeaderProps {
  sortBy: EmployeeListFilters['sortBy'];
  sortOrder: EmployeeListFilters['sortOrder'];
  onSort: (sortBy: EmployeeListFilters['sortBy']) => void;
}

export const EmployeeListTableHeader: React.FC<EmployeeListTableHeaderProps> = ({
  sortBy,
  sortOrder,
  onSort,
}) => {
  console.log('📋 TableHeader render with sortBy:', sortBy, 'sortOrder:', sortOrder);

  const getSortIcon = (field: EmployeeListFilters['sortBy']) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  const handleSort = (field: EmployeeListFilters['sortBy']) => {
    console.log('🔄 TableHeader handleSort called with:', field);
    onSort(field);
  };

  return (
    <>
      <TableHead 
        className="text-right cursor-pointer hover:bg-gray-50 select-none"
        onClick={() => handleSort('name')}
      >
        <div className="flex items-center justify-end gap-2">
          <span>שם מלא</span>
          {getSortIcon('name')}
        </div>
      </TableHead>
      <TableHead className="text-right">מספר עובד</TableHead>
      <TableHead className="text-right">טלפון</TableHead>
      <TableHead 
        className="text-right cursor-pointer hover:bg-gray-50 select-none"
        onClick={() => handleSort('employee_type')}
      >
        <div className="flex items-center justify-end gap-2">
          <span>סוג עובד</span>
          {getSortIcon('employee_type')}
        </div>
      </TableHead>
      <TableHead className="text-right">סניף ראשי</TableHead>
      <TableHead className="text-right">שעות שבועיות</TableHead>
      <TableHead className="text-right">סטטוס</TableHead>
      <TableHead 
        className="text-right cursor-pointer hover:bg-gray-50 select-none"
        onClick={() => handleSort('created_at')}
      >
        <div className="flex items-center justify-end gap-2">
          <span>תאריך הצטרפות</span>
          {getSortIcon('created_at')}
        </div>
      </TableHead>
      <TableHead className="text-right">פעולות</TableHead>
    </>
  );
};
