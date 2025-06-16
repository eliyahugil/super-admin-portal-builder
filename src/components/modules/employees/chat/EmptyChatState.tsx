
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmptyChatStateProps {
  employees: Employee[];
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = ({ employees }) => {
  return (
    <Card className="flex-1 flex items-center justify-center">
      <CardContent className="text-center">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          בחר קבוצה או עובד כדי להתחיל צ'אט
        </h3>
        <p className="text-gray-600">
          בחר קבוצה מהרשימה לשיחת קבוצה או עובד לשיחה אישית
        </p>
        {employees.length === 0 && (
          <p className="text-orange-600 mt-2">
            לא נמצאו עובדים פעילים בעסק זה
          </p>
        )}
      </CardContent>
    </Card>
  );
};
