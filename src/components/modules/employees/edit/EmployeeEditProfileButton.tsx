
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { EmployeeEditDialog } from '../EmployeeEditDialog';
import type { Employee } from '@/types/supabase';

interface EmployeeEditProfileButtonProps {
  employee: Employee;
  onUpdate: () => void;
}

export const EmployeeEditProfileButton: React.FC<EmployeeEditProfileButtonProps> = ({
  employee,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Edit className="h-4 w-4" />
        ערוך פרטים
      </Button>
      <EmployeeEditDialog
        employee={employee}
        open={open}
        onOpenChange={setOpen}
        onSuccess={onUpdate}
      />
    </>
  );
};
