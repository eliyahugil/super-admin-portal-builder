
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { EmployeeEditDialog } from '../EmployeeEditDialog';
import type { Employee } from '@/types/supabase';

interface EmployeeEditButtonProps {
  employee: Employee;
  onSuccess: () => void;
}

export const EmployeeEditButton: React.FC<EmployeeEditButtonProps> = ({
  employee,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Edit className="h-3 w-3" />
      </Button>
      <EmployeeEditDialog
        employee={employee}
        open={open}
        onOpenChange={setOpen}
        onSuccess={onSuccess}
      />
    </>
  );
};
