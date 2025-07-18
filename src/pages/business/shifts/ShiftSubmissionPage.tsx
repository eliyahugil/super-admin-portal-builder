import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { ShiftSubmissionsList } from '@/components/modules/shifts/ShiftSubmissionsList';

const ShiftSubmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="px-3 py-4 sm:px-6 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
              הגשות משמרות
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              צפייה וניהול הגשות משמרות שהתקבלו מהעובדים
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <ShiftSubmissionsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShiftSubmissionPage;