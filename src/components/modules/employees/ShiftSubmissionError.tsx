
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, AlertCircle } from 'lucide-react';

interface ShiftSubmissionErrorProps {
  error: Error;
}

export const ShiftSubmissionError: React.FC<ShiftSubmissionErrorProps> = ({ error }) => {
  console.error('❌ ShiftSubmissionError - Error state:', error);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold">שגיאה בטעינת הגשות משמרות</h3>
      </div>
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">שגיאה בטעינת הנתונים</h3>
          <p className="text-gray-500">לא ניתן לטעון את הגשות המשמרות. נסה לרענן את הדף.</p>
          <p className="text-sm text-gray-400 mt-2">שגיאה: {error.message}</p>
        </CardContent>
      </Card>
    </div>
  );
};
