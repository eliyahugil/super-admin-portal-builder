
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Eye } from 'lucide-react';

interface DashboardHeaderProps {
  businessName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ businessName }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {businessName || 'דשבורד עסקי'}
          </h1>
          <p className="text-muted-foreground mt-2">דשבורד ניהול העסק - נתונים אמיתיים</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 me-2" />
            הגדרות
          </Button>
          <Button>
            <Eye className="h-4 w-4 me-2" />
            תצוגת לקוח
          </Button>
        </div>
      </div>
    </div>
  );
};
