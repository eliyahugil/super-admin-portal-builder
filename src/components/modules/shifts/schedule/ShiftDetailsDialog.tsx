
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const ShiftDetailsDialog: React.FC = () => {
  return (
    <Dialog open={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>פרטי משמרת</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>פיתוח בתהליך...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
