import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, CalendarDays } from 'lucide-react';
import { CreateShiftForm } from './forms/CreateShiftForm';
import { BulkShiftForm } from './forms/BulkShiftForm';
import type { Employee, Branch, CreateShiftData } from './types';

interface UnifiedShiftCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shift: CreateShiftData) => Promise<void>;
  onBulkSubmit: (shifts: Omit<CreateShiftData, 'shift_template_id'>[]) => Promise<void>;
  employees: Employee[];
  branches: Branch[];
  onBranchCreated?: () => void;
}

export const UnifiedShiftCreator: React.FC<UnifiedShiftCreatorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onBulkSubmit,
  employees,
  branches,
  onBranchCreated
}) => {
  const [activeTab, setActiveTab] = useState('single');

  const handleClose = () => {
    setActiveTab('single');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>יצירת משמרות</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              משמרת בודדת / מרובה
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              יצירה בכמות גדולה
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <CreateShiftForm
              onSubmit={onSubmit}
              employees={employees}
              branches={branches}
              onBranchCreated={onBranchCreated}
              onClose={handleClose}
            />
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <BulkShiftForm
              onSubmit={onBulkSubmit}
              employees={employees}
              branches={branches}
              onBranchCreated={onBranchCreated}
              onClose={handleClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};