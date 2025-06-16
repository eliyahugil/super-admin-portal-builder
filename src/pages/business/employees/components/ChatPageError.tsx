
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ChatPageErrorProps {
  error: any;
}

export const ChatPageError: React.FC<ChatPageErrorProps> = ({ error }) => {
  return (
    <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto p-4 flex items-center justify-center" dir="rtl">
      <Card className="p-6">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">שגיאה בטעינת העובדים</span>
        </div>
        <p className="text-gray-600">לא ניתן לטעון את רשימת העובדים. אנא נסה שוב מאוחר יותר.</p>
        <p className="text-sm text-gray-500 mt-2">שגיאה: {error.message}</p>
      </Card>
    </div>
  );
};
