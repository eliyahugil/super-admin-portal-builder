
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Building2 } from 'lucide-react';
import { ShiftsAdminTable } from './ShiftsAdminTable';
import { CreateShiftForm } from './CreateShiftForm';
import { useBusiness } from '@/hooks/useBusiness';

interface ManagementToolsSectionProps {
  onCreateEmployee: () => void;
  onCreateBranch: () => void;
}

export const ManagementToolsSection: React.FC<ManagementToolsSectionProps> = ({
  onCreateEmployee,
  onCreateBranch
}) => {
  const { businessId } = useBusiness();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
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

      {/* Management Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ShiftsAdminTable businessId={businessId} />
        <CreateShiftForm businessId={businessId} />
      </div>
    </div>
  );
};
