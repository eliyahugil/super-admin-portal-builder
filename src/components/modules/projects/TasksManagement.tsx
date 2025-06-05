
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const TasksManagement: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול משימות</h1>
        <p className="text-gray-600 mt-2">נהל משימות ופעילויות פרויקטים</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>משימות</CardTitle>
          <CardDescription>רשימת כל המשימות</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">בקרוב - ניהול משימות מתקדם</p>
        </CardContent>
      </Card>
    </div>
  );
};
