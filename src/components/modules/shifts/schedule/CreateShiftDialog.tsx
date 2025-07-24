
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CreateShiftData } from './types';

interface CreateShiftDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (shiftData: CreateShiftData) => Promise<void>;
}

export const CreateShiftDialog: React.FC<CreateShiftDialogProps> = ({ open, onClose, onCreate }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
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
