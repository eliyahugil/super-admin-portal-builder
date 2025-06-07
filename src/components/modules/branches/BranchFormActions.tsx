
import React from 'react';
import { Button } from '@/components/ui/button';

interface BranchFormActionsProps {
  onCancel: () => void;
  loading: boolean;
  submitText?: string;
  cancelText?: string;
}

export const BranchFormActions: React.FC<BranchFormActionsProps> = ({
  onCancel,
  loading,
  submitText = 'צור סניף',
  cancelText = 'ביטול',
}) => {
  return (
    <div className="flex justify-end space-x-2 space-x-reverse pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelText}
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'יוצר...' : submitText}
      </Button>
    </div>
  );
};
