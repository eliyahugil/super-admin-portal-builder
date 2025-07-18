import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const ShiftSubmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6" />
              הגשת משמרות
            </CardTitle>
            <CardDescription>
              מערכת הגשת משמרות שבועיות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                מערכת הגשת המשמרות השבועיות הוסרה מהמערכת. 
                כעת ניהול המשמרות מתבצע דרך לוח המשמרות הראשי.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShiftSubmissionPage;