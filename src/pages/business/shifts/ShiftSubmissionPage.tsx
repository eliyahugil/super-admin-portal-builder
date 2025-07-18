import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { ShiftSubmissionsList } from '@/components/modules/shifts/ShiftSubmissionsList';

const ShiftSubmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* כותרת דף קומפקטית למובייל */}
      <div className="bg-card border-b sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">הגשות משמרות</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          צפייה וניהול הגשות משמרות
        </p>
      </div>
      
      {/* תוכן הדף */}
      <div className="pb-20">
        <ShiftSubmissionsList />
      </div>
    </div>
  );
};

export default ShiftSubmissionPage;