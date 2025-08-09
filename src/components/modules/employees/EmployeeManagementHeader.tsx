
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, RefreshCw, Search, Plus } from 'lucide-react';
import { CreateEmployeeDialog } from './CreateEmployeeDialog';
import { useState } from 'react';
import type { Branch } from '@/types/branch';

interface EmployeeManagementHeaderProps {
  businessId: string;
  showArchived: boolean;
  onToggleArchived: (value: boolean) => void;
  totalActiveEmployees: number;
  totalArchivedEmployees: number;
}

export const EmployeeManagementHeader: React.FC<EmployeeManagementHeaderProps> = ({
  businessId,
  showArchived,
  onToggleArchived,
  totalActiveEmployees,
  totalArchivedEmployees,
}) => {
  const [createEmployeeOpen, setCreateEmployeeOpen] = useState(false);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">ניהול עובדים</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={showArchived ? "default" : "outline"}
              onClick={() => onToggleArchived(!showArchived)}
              data-testid="employees-toggle-archive"
            >
              {showArchived 
                ? `עובדים פעילים (${totalActiveEmployees})` 
                : `ארכיון (${totalArchivedEmployees})`
              }
            </Button>
            <Button onClick={() => setCreateEmployeeOpen(true)} data-testid="employees-add-button">
              <Plus className="h-4 w-4 ml-2" />
              הוסף עובד
            </Button>
          </div>
        </div>
      </div>

      <CreateEmployeeDialog
        open={createEmployeeOpen}
        onOpenChange={setCreateEmployeeOpen}
        onSuccess={() => {}}
        branches={[]}
      />
    </>
  );
};
