
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SuperAdminHeaderProps {
  onCreateBusiness: () => void;
}

export const SuperAdminHeader: React.FC<SuperAdminHeaderProps> = ({ onCreateBusiness }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8" dir="rtl">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">ניהול עסקים</h2>
        <p className="text-sm text-gray-600 mt-1">נהל את כל העסקים במערכת</p>
      </div>
      <Button 
        onClick={onCreateBusiness} 
        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
        size="lg"
      >
        <Plus className="h-4 w-4" />
        <span>צור עסק חדש</span>
      </Button>
    </div>
  );
};
