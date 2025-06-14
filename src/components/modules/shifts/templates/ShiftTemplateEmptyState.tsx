
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus } from 'lucide-react';

interface ShiftTemplateEmptyStateProps {
  onCreateTemplate: () => void;
}

export const ShiftTemplateEmptyState: React.FC<ShiftTemplateEmptyStateProps> = ({
  onCreateTemplate
}) => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין תבניות משמרות</h3>
        <p className="text-gray-600 mb-4">צור תבנית משמרת ראשונה כדי להתחיל</p>
        <Button onClick={onCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          צור תבנית ראשונה
        </Button>
      </CardContent>
    </Card>
  );
};
