
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateShiftFormView } from '@/components/modules/employees/CreateShiftForm/CreateShiftFormView';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useRealData } from '@/hooks/useRealData';
import type { CreateShiftData } from './types';

interface CreateShiftDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (shiftData: CreateShiftData) => Promise<void>;
}

export const CreateShiftDialog: React.FC<CreateShiftDialogProps> = ({ open, onClose, onCreate }) => {
  const { businessId } = useCurrentBusiness();
  
  const { data: shiftTemplates } = useRealData<any>({
    queryKey: ['shift-templates', businessId],
    tableName: 'shift_templates',
    filters: { business_id: businessId },
    enabled: !!businessId && open,
  });

  const { data: employees } = useRealData<any>({
    queryKey: ['employees', businessId],
    tableName: 'employees',
    filters: { 
      business_id: businessId,
      is_active: true,
      is_archived: false 
    },
    enabled: !!businessId && open,
  });

  const handleFormSubmit = async (shiftData: any) => {
    try {
      await onCreate(shiftData);
      onClose();
    } catch (error) {
      console.error('Error creating shift:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[95vw] !max-w-[95vw] sm:!max-w-2xl !left-[50%] !translate-x-[-50%] max-h-[95vh] overflow-y-auto p-3 sm:p-6" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת משמרת חדשה</DialogTitle>
        </DialogHeader>
        
        {businessId ? (
          <div className="overflow-y-auto max-h-[85vh] px-1">
            <CreateShiftFormView 
              businessId={businessId}
              employees={employees || []}
              shiftTemplates={shiftTemplates || []}
            />
          </div>
        ) : (
          <div className="p-4 text-center">
            <p>שגיאה: לא נמצא מזהה עסק</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
