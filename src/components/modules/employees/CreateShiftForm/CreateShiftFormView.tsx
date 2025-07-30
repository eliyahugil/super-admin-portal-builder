
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateShiftFormHeader } from './CreateShiftFormHeader';
import { ShiftTemplateSelector } from './ShiftTemplateSelector';
import { ShiftDatesSelector } from './ShiftDatesSelector';
import { WeeklyRecurringSelector } from './WeeklyRecurringSelector';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftNotesInput } from './ShiftNotesInput';
import { ShiftTimeSelector } from './ShiftTimeSelector';
import { RequiredEmployeesSelector } from './RequiredEmployeesSelector';
import { RoleSelector } from './RoleSelector';
import { useCreateShiftForm } from './useCreateShiftForm';
import { QuickShiftTemplateCreatorDialog } from './QuickShiftTemplateCreatorDialog';
import { QuickShiftCreationOptions } from './QuickShiftCreationOptions';
import { BranchMultiSelect } from './BranchMultiSelect';
import { useBranchesData } from '@/hooks/useBranchesData';
import { useRealData } from '@/hooks/useRealData';
import { CreateShiftFormViewProps, ShiftTemplate } from './types';
import { toast } from '@/hooks/use-toast';
import { addDays, startOfWeek } from 'date-fns';

export const CreateShiftFormView: React.FC<CreateShiftFormViewProps> = ({
  businessId,
  employees,
  shiftTemplates,
  onSuccess,
  onCreate
}) => {
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templates, setTemplates] = useState<ShiftTemplate[]>(shiftTemplates || []);

  React.useEffect(() => {
    setTemplates(shiftTemplates || []);
  }, [shiftTemplates]);

  const handleTemplateCreated = (template: ShiftTemplate) => {
    setTemplates(prev => [...prev, template]);
  };

  const { data: branches } = useBranchesData(businessId);
  
  // טעינת תפקידים
  const { data: roles = [] } = useRealData<any>({
    queryKey: ['shift-roles', businessId],
    tableName: 'shift_roles',
    filters: { business_id: businessId, is_active: true },
    enabled: !!businessId,
  });

  const {
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedTemplateId,
    setSelectedTemplateId,
    selectedBranchId,
    setSelectedBranchId,
    shiftDates,
    setShiftDates,
    notes,
    setNotes,
    submitting,
    handleSubmit,
    weekdayRange,
    setWeekdayRange,
    selectedWeekdays,
    setSelectedWeekdays,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    useCustomTime,
    setUseCustomTime,
    requiredEmployees,
    setRequiredEmployees,
    selectedRoleId,
    setSelectedRoleId,
  } = useCreateShiftForm(businessId, branches, onSuccess, onCreate);

  // פונקציות טיפול בהעתקת משמרות
  const handleCopyShifts = (copiedShifts: any[]) => {
    if (copiedShifts.length === 0) return;

    // אם יש תאריכים נבחרים, נשתמש בהם
    if (shiftDates.length > 0) {
      // מיפוי המשמרות לתאריכים הנבחרים
      const shiftsToCreate = shiftDates.flatMap(date => 
        copiedShifts.map(shift => ({
          ...shift,
          shift_date: date,
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
        }))
      );
      
      toast({
        title: 'משמרות הועתקו',
        description: `הועתקו ${shiftsToCreate.length} משמרות לתאריכים שנבחרו`,
      });
    } else {
      // אם אין תאריכים, נשתמש בשבוע הנוכחי
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
      const weekDates = Array.from({ length: 7 }, (_, i) => 
        addDays(currentWeekStart, i).toISOString().split('T')[0]
      );
      
      setShiftDates(weekDates);
      
      toast({
        title: 'משמרות הועתקו',
        description: `הועתקו ${copiedShifts.length} משמרות לשבוע הנוכחי`,
      });
    }
  };

  const handleCreateFromTemplate = (template: any) => {
    setSelectedTemplateId(template.id);
    setStartTime(template.start_time);
    setEndTime(template.end_time);
    setUseCustomTime(false);
    
    toast({
      title: 'תבנית נטענה',
      description: `נטענה תבנית: ${template.name}`,
    });
  };

  React.useEffect(() => {
    if (!selectedTemplateId && templates.length === 1) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId, setSelectedTemplateId]);

  const isFormDisabled = submitting || (branches && branches.length === 0);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 space-y-4 max-w-full" dir="rtl">
      <CreateShiftFormHeader />
      
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">יצירה מהירה</TabsTrigger>
          <TabsTrigger value="manual">יצירה ידנית</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick" className="space-y-4">
          <QuickShiftCreationOptions
            businessId={businessId}
            onCopyShifts={handleCopyShifts}
            onCreateFromTemplate={handleCreateFromTemplate}
          />
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Toggle between template and custom time */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="custom-time-switch" className="text-sm font-medium">
                השתמש בשעות מותאמות אישית
              </Label>
              <Switch
                id="custom-time-switch"
                checked={useCustomTime}
                onCheckedChange={setUseCustomTime}
              />
            </div>

            {!useCustomTime ? (
              <ShiftTemplateSelector
                selectedTemplateId={selectedTemplateId}
                onTemplateChange={setSelectedTemplateId}
                templates={templates}
                onOpenCreator={() => setShowTemplateDialog(true)}
              />
            ) : (
              <div className="space-y-4">
                <ShiftTimeSelector
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                  disabled={submitting}
                />
              </div>
            )}

            <ShiftDatesSelector
              shiftDates={shiftDates}
              onShiftDatesChange={setShiftDates}
              submitting={submitting}
            />

            <WeeklyRecurringSelector
              weekdayRange={weekdayRange}
              selectedWeekdays={selectedWeekdays}
              onWeekdayRangeChange={setWeekdayRange}
              onSelectedWeekdaysChange={setSelectedWeekdays}
              submitting={submitting}
            />

            <BranchMultiSelect
              branches={branches}
              selectedBranchIds={Array.isArray(selectedBranchId) ? selectedBranchId : []}
              onChange={setSelectedBranchId}
              disabled={submitting || !branches || branches.length === 0}
            />

            <EmployeeSelector
              selectedEmployeeId={selectedEmployeeId}
              onEmployeeChange={setSelectedEmployeeId}
              employees={employees}
            />

            <ShiftNotesInput
              notes={notes}
              onNotesChange={setNotes}
            />

            <RequiredEmployeesSelector
              requiredEmployees={requiredEmployees}
              onRequiredEmployeesChange={setRequiredEmployees}
              disabled={submitting}
            />

            <RoleSelector
              selectedRoleId={selectedRoleId}
              onRoleChange={setSelectedRoleId}
              roles={roles}
              disabled={submitting}
            />

            <Button 
              type="submit" 
              disabled={isFormDisabled}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-base"
            >
              {submitting ? 'יוצר...' : 'צור משמרות'}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      <QuickShiftTemplateCreatorDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        businessId={businessId}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
};
