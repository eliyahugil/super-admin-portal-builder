
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

interface SuperAdminEmptyStateProps {
  onCreateBusiness: () => void;
}

export const SuperAdminEmptyState: React.FC<SuperAdminEmptyStateProps> = ({ onCreateBusiness }) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין עסקים</h3>
        <p className="text-gray-600 mb-4">התחל על ידי יצירת העסק הראשון שלך</p>
        <Button onClick={onCreateBusiness}>צור עסק חדש</Button>
      </CardContent>
    </Card>
  );
};
