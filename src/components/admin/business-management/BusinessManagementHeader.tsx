
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Archive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessManagementHeaderProps {
  totalBusinesses: number;
  onCreateBusiness: () => void;
}

export const BusinessManagementHeader: React.FC<BusinessManagementHeaderProps> = ({
  totalBusinesses,
  onCreateBusiness
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            ניהול עסקים
            <Button
              variant="ghost"
              size="sm"
              className="text-orange-800 hover:text-orange-700 px-3 py-1"
              onClick={() => navigate('/admin/businesses/archived')}
            >
              <Archive className="h-4 w-4 mr-1" />
              עסקים בארכיון
            </Button>
          </h1>
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
