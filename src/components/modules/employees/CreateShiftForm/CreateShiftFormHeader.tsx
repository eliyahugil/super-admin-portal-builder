
import React from 'react';
import { Plus } from 'lucide-react';

export const CreateShiftFormHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <Plus className="h-6 w-6 text-green-600" />
      <h2 className="text-xl font-semibold text-gray-800">יצירת משמרת חדשה</h2>
    </div>
  );
};
