
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ShiftTemplatesHeaderProps {
  onCreateTemplate: () => void;
}

export const ShiftTemplatesHeader: React.FC<ShiftTemplatesHeaderProps> = ({
  onCreateTemplate
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">תבניות משמרות</h2>
        <p className="text-gray-600">נהל תבניות משמרות לעסק</p>
      </div>
      <Button onClick={onCreateTemplate}>
        <Plus className="h-4 w-4 mr-2" />
        הוסף תבנית חדשה
      </Button>
    </div>
  );
};
