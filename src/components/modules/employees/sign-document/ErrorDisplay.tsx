
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  title: string;
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ title, message }) => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4" dir="rtl">
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};
