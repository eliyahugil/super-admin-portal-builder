
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface EmployeeManagementEmptyStateProps {
  onRefetch: () => void;
}

export const EmployeeManagementEmptyState: React.FC<EmployeeManagementEmptyStateProps> = ({ onRefetch }) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Users className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין עובדים במערכת</h3>
        <p className="text-gray-600 text-center mb-4">
          התחל בהוספת העובד הראשון שלך כדי לנהל את הצוות
        </p>
        <Button onClick={onRefetch} variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          רענן רשימה
        </Button>
      </CardContent>
    </Card>
  );
};
