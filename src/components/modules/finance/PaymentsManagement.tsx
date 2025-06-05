
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const PaymentsManagement: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">מעקב תשלומים</h1>
        <p className="text-gray-600 mt-2">נהל תשלומים נכנסים ויוצאים</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>תשלומים</CardTitle>
          <CardDescription>מעקב אחר כל התשלומים</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">בקרוב - מעקב תשלומים מתקדם</p>
        </CardContent>
      </Card>
    </div>
  );
};
