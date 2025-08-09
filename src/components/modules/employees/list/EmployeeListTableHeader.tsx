
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
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-primary" />
      : <ArrowDown className="h-4 w-4 text-primary" />;
  };

  const handleSort = (field: EmployeeListFilters['sortBy']) => {
    console.log('🔄 TableHeader handleSort called with:', field);
    onSort(field);
  };

  return (
    <>
      <TableHead 
        className="text-start cursor-pointer hover:bg-accent/50 select-none sticky top-0 z-10 bg-card"
        onClick={() => handleSort('name')}
      >
        <div className="flex items-center justify-start gap-2">
          <span>שם מלא</span>
          {getSortIcon('name')}
        </div>
      </TableHead>
      <TableHead className="text-start sticky top-0 bg-card z-10">מספר עובד</TableHead>
      <TableHead className="text-start sticky top-0 bg-card z-10">טלפון</TableHead>
      <TableHead 
        className="text-start cursor-pointer hover:bg-accent/50 select-none sticky top-0 z-10 bg-card"
        onClick={() => handleSort('employee_type')}
      >
        <div className="flex items-center justify-start gap-2">
          <span>סוג עובד</span>
          {getSortIcon('employee_type')}
        </div>
      </TableHead>
      <TableHead className="text-start sticky top-0 bg-card z-10">סניף ראשי</TableHead>
      <TableHead className="text-start sticky top-0 bg-card z-10">שעות שבועיות</TableHead>
      <TableHead className="text-start sticky top-0 bg-card z-10">סטטוס</TableHead>
      <TableHead 
        className="text-start cursor-pointer hover:bg-accent/50 select-none sticky top-0 z-10 bg-card"
        onClick={() => handleSort('created_at')}
      >
        <div className="flex items-center justify-start gap-2">
          <span>תאריך הצטרפות</span>
          {getSortIcon('created_at')}
        </div>
      </TableHead>
      <TableHead className="text-start sticky top-0 bg-card z-10">פעולות</TableHead>
    </>
  );
};
