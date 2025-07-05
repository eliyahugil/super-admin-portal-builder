
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ScheduleErrorBoundaryProps {
  error: Error | null;
  onRetry: () => void;
  businessId: string | null;
}

export const ScheduleErrorBoundary: React.FC<ScheduleErrorBoundaryProps> = ({
  error,
  onRetry,
  businessId
}) => {
  if (!error) return null;

  console.error('📋 Schedule Error Details:', {
    error: error.message,
    businessId,
    stack: error.stack
  });

  return (
    <Card className="mx-auto max-w-2xl mt-8" dir="rtl">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          שגיאה בטעינת לוח המשמרות
        </h3>
        <p className="text-gray-600 mb-4">
          {error.message || 'שגיאה לא ידועה בטעינת הנתונים'}
        </p>
        {!businessId && (
          <p className="text-sm text-red-600 mb-4">
            ⚠️ לא נמצא מזהה עסק - יש לבחור עסק תחילה
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            נסה שוב
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            רענן דף
          </Button>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-right">
          <h4 className="font-medium mb-2">מידע לפתרון בעיות:</h4>
          <ul className="space-y-1 text-gray-600">
            <li>• בדוק שהעסק קיים ופעיל במערכת</li>
            <li>• וודא שיש לך הרשאות גישה לעסק</li>
            <li>• בדוק את החיבור לאינטרנט</li>
            <li>• נסה לרענן את הדף</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
