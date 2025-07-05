
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ScheduleErrorBoundaryProps {
  error: Error;
  onRetry: () => void;
  businessId?: string | null;
}

export const ScheduleErrorBoundary: React.FC<ScheduleErrorBoundaryProps> = ({
  error,
  onRetry,
  businessId
}) => {
  const errorMessage = error?.message || 'אירעה שגיאה לא צפויה';
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">שגיאה בטעינת לוח המשמרות</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">פרטי השגיאה:</p>
            <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700 text-right">
              {errorMessage}
            </div>
          </div>
          
          {!businessId && (
            <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
              <p className="font-medium mb-1">לא נמצא מזהה עסק</p>
              <p>ודא שאתה מחובר לעסק המתאים</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Button 
              onClick={onRetry} 
              className="w-full"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              נסה שוב
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="w-full"
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              חזור לדף הבית
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>אם השגיאה נמשכת, צור קשר עם התמיכה הטכנית</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
