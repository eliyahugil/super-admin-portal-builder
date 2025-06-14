
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';

interface BusinessManagementHeaderProps {
  totalBusinesses: number;
  onCreateBusiness: () => void;
}

export const BusinessManagementHeader: React.FC<BusinessManagementHeaderProps> = ({
  totalBusinesses,
  onCreateBusiness
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ניהול עסקים</h1>
          <p className="text-gray-600 mt-2">נהל עסקים רשומים במערכת</p>
        </div>
        <Button onClick={onCreateBusiness}>
          <Plus className="h-4 w-4 mr-2" />
          הוסף עסק חדש
        </Button>
      </div>
    </div>
  );
};
