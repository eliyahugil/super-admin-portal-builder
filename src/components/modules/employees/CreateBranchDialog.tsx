
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateBranchDialog } from './hooks/useCreateBranchDialog';
import { CreateBranchForm } from './CreateBranchForm';

interface CreateBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateBranchDialog: React.FC<CreateBranchDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const {
    formData,
    setFormData,
    handleSubmit,
    loading,
  } = useCreateBranchDialog(onSuccess, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>הוסף סניף חדש</DialogTitle>
        </DialogHeader>
        
        <CreateBranchForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};
