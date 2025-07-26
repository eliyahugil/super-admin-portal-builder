
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2 } from 'lucide-react';
import { QuickActionsCardProps } from './types';

export const QuickActionsCard: React.FC<QuickActionsCardProps> = ({
  onCreateEmployee,
  onCreateBranch,
  selectedBusinessId
}) => {
  const handleCreateEmployee = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🚀 Create employee button clicked', { selectedBusinessId });
    if (onCreateEmployee) {
      onCreateEmployee();
    }
  };

  const handleCreateBranch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🏢 Create branch button clicked', { selectedBusinessId });
    if (onCreateBranch) {
      onCreateBranch();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">פעולות מהירות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4" dir="rtl">
          <Button 
            onClick={handleCreateEmployee} 
            className="flex items-center gap-2 w-full sm:w-auto"
            type="button"
          >
            <Users className="h-4 w-4" />
            הוסף עובד
          </Button>
          <Button 
            onClick={handleCreateBranch} 
            variant="outline" 
            className="flex items-center gap-2 w-full sm:w-auto"
            type="button"
          >
            <Building2 className="h-4 w-4" />
            הוסף סניף
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
