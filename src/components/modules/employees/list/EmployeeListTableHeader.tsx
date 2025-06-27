
import React from 'react';
import { TableHead } from '@/components/ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { EmployeeListFilters } from '@/hooks/useEmployeeListPreferences';

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: EmployeeListFilters['sortBy'];
  currentSortBy: EmployeeListFilters['sortBy'];
  currentSortOrder: EmployeeListFilters['sortOrder'];
  onSort: (sortBy: EmployeeListFilters['sortBy']) => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  children,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  className,
}) => {
  const isActive = currentSortBy === sortKey;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-gray-50 select-none ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1 justify-end">
        {children}
        <div className="flex flex-col w-4">
          {isActive ? (
            currentSortOrder === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-blue-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-600" />
            )
          ) : (
            <div className="h-4 w-4 opacity-30">
              <ChevronUp className="h-2 w-4 absolute" />
              <ChevronDown className="h-2 w-4 absolute mt-2" />
            </div>
          )}
        </div>
      </div>
    </TableHead>
  );
};

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
  return (
    <>
      <TableHead className="w-12 text-right">
        {/* Checkbox column - not sortable */}
      </TableHead>
      
      <SortableHeader
        sortKey="name"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
        className="text-right"
      >
        שם מלא
      </SortableHeader>
      
      <TableHead className="text-right">מספר עובד</TableHead>
      <TableHead className="text-right">טלפון</TableHead>
      
      <SortableHeader
        sortKey="employee_type"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
        className="text-right"
      >
        סוג עובד
      </SortableHeader>
      
      <TableHead className="text-right">סניף</TableHead>
      <TableHead className="text-right">שעות שבועיות</TableHead>
      <TableHead className="text-right">סטטוס</TableHead>
      
      <SortableHeader
        sortKey="created_at"
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
        onSort={onSort}
        className="text-right"
      >
        תאריך הוספה
      </SortableHeader>
      
      <TableHead className="text-right">פעולות</TableHead>
    </>
  );
};
