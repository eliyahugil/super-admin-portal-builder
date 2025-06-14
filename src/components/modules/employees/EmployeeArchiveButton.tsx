
import React from 'react';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveRestore, Loader2 } from 'lucide-react';
import { useEmployeeArchive } from '@/hooks/useEmployeeArchive';
import type { Employee } from '@/types/employee';

interface EmployeeArchiveButtonProps {
  employee: Employee;
  isArchived?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
}

export const EmployeeArchiveButton: React.FC<EmployeeArchiveButtonProps> = ({
  employee,
  isArchived = false,
  variant = 'outline',
  size = 'sm'
}) => {
  const { archiveEmployee, restoreEmployee, isArchiving, isRestoring } = useEmployeeArchive();

  const handleClick = () => {
    if (isArchived) {
      restoreEmployee(employee);
    } else {
      if (confirm(`האם אתה בטוח שברצונך להעביר את ${employee.first_name} ${employee.last_name} לארכיון?`)) {
        archiveEmployee(employee);
      }
    }
  };

  const isLoading = isArchiving || isRestoring;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={isArchived ? 'text-green-600 hover:text-green-800' : 'text-orange-600 hover:text-orange-800'}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isArchived ? (
        <>
          <ArchiveRestore className="h-4 w-4" />
          <span className="mr-2">שחזר</span>
        </>
      ) : (
        <>
          <Archive className="h-4 w-4" />
          <span className="mr-2">ארכיון</span>
        </>
      )}
    </Button>
  );
};
