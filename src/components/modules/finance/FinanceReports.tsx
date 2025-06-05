
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const FinanceReports: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">דוחות כספיים</h1>
        <p className="text-gray-600 mt-2">אנליטיקה ודוחות פיננסיים מתקדמים</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>דוחות</CardTitle>
          <CardDescription>דוחות כספיים ואנליטיקה</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">בקרוב - דוחות כספיים מתקדמים</p>
        </CardContent>
      </Card>
    </div>
  );
};
