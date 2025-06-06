
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SuperAdminAccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600">אין הרשאה</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            אין לך הרשאות לגשת לפורטל Super Admin
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
