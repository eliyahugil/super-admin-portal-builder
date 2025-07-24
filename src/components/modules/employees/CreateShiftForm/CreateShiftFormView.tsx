
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreateShiftFormHeader } from './CreateShiftFormHeader';
import { ShiftTemplateSelector } from './ShiftTemplateSelector';
import { ShiftDatesSelector } from './ShiftDatesSelector';
import { WeeklyRecurringSelector } from './WeeklyRecurringSelector';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftNotesInput } from './ShiftNotesInput';
import { ShiftTimeSelector } from './ShiftTimeSelector';
import { RequiredEmployeesSelector } from './RequiredEmployeesSelector';
import { useCreateShiftForm } from './useCreateShiftForm';
import { QuickShiftTemplateCreatorDialog } from './QuickShiftTemplateCreatorDialog';
import { BranchMultiSelect } from './BranchMultiSelect';
import { useBranchesData } from '@/hooks/useBranchesData';
import { CreateShiftFormViewProps, ShiftTemplate } from './types';

export const CreateShiftFormView: React.FC<CreateShiftFormViewProps> = ({
  businessId,
  employees,
  shiftTemplates
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
  } = useCreateShiftForm(businessId, branches);

  React.useEffect(() => {
    if (!selectedTemplateId && templates.length === 1) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId, setSelectedTemplateId]);

  const isFormDisabled = submitting || (branches && branches.length === 0);

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 space-y-4 max-w-full" dir="rtl">
      <CreateShiftFormHeader />
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

        <Button 
          type="submit" 
          disabled={isFormDisabled}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-base"
        >
          {submitting ? 'יוצר...' : 'צור משמרות'}
        </Button>
      </form>

      <QuickShiftTemplateCreatorDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        businessId={businessId}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
};
