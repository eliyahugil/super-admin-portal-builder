import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { ShiftSubmissionsList } from '@/components/modules/shifts/ShiftSubmissionsList';

const ShiftSubmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="w-full">
        {/* כותרת דף */}
        <div className="bg-card border-b px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <h1 className="text-lg md:text-xl font-semibold">הגשות משמרות</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            צפייה וניהול הגשות משמרות מהעובדים
          </p>
        </div>
        
        {/* תוכן הדף */}
        <div className="py-4 md:px-6 pb-20">
          <ShiftSubmissionsList />
        </div>
      </div>
    </div>
  );
};

export default ShiftSubmissionPage;