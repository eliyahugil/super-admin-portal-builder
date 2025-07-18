import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';
import { ShiftSubmissionsList } from '@/components/modules/shifts/ShiftSubmissionsList';

const ShiftSubmissionPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="w-full">
        {/* כותרת דף */}
        <div className="bg-card border-b border-border px-4 py-4 md:px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Send className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-foreground">הגשות משמרות</h1>
              <p className="text-sm text-muted-foreground">
                צפייה וניהול הגשות משמרות מהעובדים
              </p>
            </div>
          </div>
        </div>
        
        {/* תוכן הדף */}
        <div className="py-6 pb-20">
          <ShiftSubmissionsList />
        </div>
      </div>
    </div>
  );
};

export default ShiftSubmissionPage;