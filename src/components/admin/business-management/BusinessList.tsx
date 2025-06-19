
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { BusinessCard } from './BusinessCard';

interface EnrichedBusiness {
  id: string;
  name: string;
  contact_email?: string;  // Optional to match database schema
  admin_email?: string;    // Optional to match database schema
  contact_phone?: string;  // Optional to match database schema
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  employee_count?: number;
  branches_count?: number;
  last_activity?: string;
}

interface BusinessListProps {
  businesses: EnrichedBusiness[];
  totalBusinesses: number;
  onView: (businessId: string) => void;
  onSettings: (businessId: string) => void;
  onEdit: (businessId: string) => void;
  onDelete: (businessId: string) => void;
}

export const BusinessList: React.FC<BusinessListProps> = ({
  businesses,
  totalBusinesses,
  onView,
  onSettings,
  onEdit,
  onDelete
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>רשימת עסקים</CardTitle>
        <CardDescription>
          {businesses.length} עסקים מתוך {totalBusinesses}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {businesses.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                לא נמצאו עסקים
              </h3>
              <p className="text-gray-600">
                נסה לשנות את החיפוש
              </p>
            </div>
          ) : (
            businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onView={onView}
                onSettings={onSettings}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
