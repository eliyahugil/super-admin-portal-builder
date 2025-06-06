
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/ui/BackButton';

export const UsersManagement: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-4">
        <BackButton to="/modules/settings" />
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול משתמשים</h1>
        <p className="text-gray-600 mt-2">הוסף ונהל משתמשי המערכת</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>משתמשים</CardTitle>
          <CardDescription>רשימת משתמשי המערכת</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">בקרוב - ניהול משתמשים מתקדם</p>
        </CardContent>
      </Card>
    </div>
  );
};
