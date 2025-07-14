
import React from 'react';
import { BusinessCard } from './BusinessCard';

interface Business {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  contact_email?: string;
  is_active: boolean;
  created_at: string;
}

interface BusinessesGridProps {
  businesses: Business[];
  onManage: (businessId: string) => void;
  onEdit: (business: Business) => void;
}

export const BusinessesGrid: React.FC<BusinessesGridProps> = ({ 
  businesses, 
  onManage, 
  onEdit 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" dir="rtl">
      {businesses.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          onManage={onManage}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
