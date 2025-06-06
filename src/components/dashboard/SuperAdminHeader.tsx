
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SuperAdminHeaderProps {
  onCreateBusiness: () => void;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onCreateBusiness }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">ניהול עסקים</h2>
      <Button onClick={onCreateBusiness} className="flex items-center space-x-2 space-x-reverse">
        <Plus className="h-4 w-4" />
        <span>צור עסק חדש</span>
      </Button>
    </div>
  );
};
