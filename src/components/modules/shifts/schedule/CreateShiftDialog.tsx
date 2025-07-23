
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CreateShiftData } from './types';

interface CreateShiftDialogProps {
  onCreate: (shiftData: CreateShiftData) => Promise<void>;
}

export const CreateShiftDialog: React.FC<CreateShiftDialogProps> = ({ onCreate }) => {
  return (
    <Dialog open={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>יצירת משמרת חדשה</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>פיתוח בתהליך...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
