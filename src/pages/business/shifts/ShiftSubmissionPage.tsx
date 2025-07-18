import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { ShiftSubmissionsList } from '@/components/modules/shifts/ShiftSubmissionsList';

const ShiftSubmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-6 w-6" />
              הגשות משמרות
            </CardTitle>
            <CardDescription>
              צפייה וניהול הגשות משמרות שהתקבלו מהעובדים
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShiftSubmissionsList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShiftSubmissionPage;