
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmployeeEditForm } from './edit/EmployeeEditForm';
import { EmployeeEditActions } from './edit/EmployeeEditActions';
import { useEmployeeEdit } from './edit/useEmployeeEdit';
import type { Employee } from '@/types/supabase';

interface EmployeeEditDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EmployeeEditDialog: React.FC<EmployeeEditDialogProps> = ({ 
  employee, 
  open, 
  onOpenChange, 
  onSuccess 
}) => {
  const { formData, setFormData, loading, handleSubmit } = useEmployeeEdit(
    employee, 
    () => {
      onOpenChange(false);
      onSuccess();
    }
  );

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>עריכת פרטי העובד</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <EmployeeEditForm 
            formData={formData} 
            setFormData={setFormData} 
          />
          <EmployeeEditActions 
            loading={loading} 
            onCancel={() => onOpenChange(false)} 
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
