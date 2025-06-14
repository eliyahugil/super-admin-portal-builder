
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBranchEdit } from './hooks/useBranchEdit';
import { BranchEditForm } from './BranchEditForm';
import { Branch } from '@/types/branch';

interface BranchEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  branch: Branch | null;
}

export const BranchEditDialog: React.FC<BranchEditDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  branch,
}) => {
  const {
    formData,
    setFormData,
    handleSubmit,
    loading,
  } = useBranchEdit(branch, onSuccess, () => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>עריכת סניף</DialogTitle>
        </DialogHeader>
        
        <BranchEditForm
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
