
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
