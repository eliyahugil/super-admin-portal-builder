
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmployeeEditActionsProps {
  loading: boolean;
  onCancel: () => void;
}

export const EmployeeEditActions: React.FC<EmployeeEditActionsProps> = ({
  loading,
  onCancel,
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        ביטול
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'שומר...' : 'שמור שינויים'}
      </Button>
    </div>
  );
};
