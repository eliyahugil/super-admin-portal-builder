
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const ShiftSubmissionEmpty: React.FC = () => {
  return (
    <Card>
      <CardContent className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין הגשות משמרות</h3>
        <p className="text-gray-500">העובד עדיין לא הגיש משמרות במערכת</p>
      </CardContent>
    </Card>
  );
};
