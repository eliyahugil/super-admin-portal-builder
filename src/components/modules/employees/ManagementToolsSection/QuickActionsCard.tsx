
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2 } from 'lucide-react';
import { QuickActionsCardProps } from './types';

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onCreateEmployee,
  onCreateBranch
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">פעולות מהירות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4" dir="rtl">
          <Button onClick={onCreateEmployee} className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            הוסף עובד
          </Button>
          <Button onClick={onCreateBranch} variant="outline" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            הוסף סניף
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
