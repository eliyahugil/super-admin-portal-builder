
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateShiftFormHeader } from './CreateShiftFormHeader';
import { ShiftTemplateSelector } from './ShiftTemplateSelector';
import { ShiftDateInput } from './ShiftDateInput';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftNotesInput } from './ShiftNotesInput';
import { useCreateShiftForm } from './useCreateShiftForm';
import { QuickShiftTemplateCreatorDialog } from './QuickShiftTemplateCreatorDialog';
import { BranchSelector } from './BranchSelector';
import { useBranchesData } from '@/hooks/useBranchesData';
import { WeekdaySelector } from './WeekdaySelector';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id?: string;
}

interface ShiftTemplate {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface CreateShiftFormViewProps {
  businessId: string;
  employees: Employee[] | undefined;
  shiftTemplates: ShiftTemplate[] | undefined;
}

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

  const { data: branches, isLoading: branchesLoading } = useBranchesData(businessId);

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
  } = useCreateShiftForm(businessId, branches);

  React.useEffect(() => {
    if (!selectedTemplateId && templates.length === 1) {
      setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId, setSelectedTemplateId]);

  const handleBranchChange = (val: string | string[]) => {
    if (Array.isArray(val)) {
      setSelectedBranchId(val);
    } else {
      setSelectedBranchId(val ? [val] : []);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4" dir="rtl">
      <CreateShiftFormHeader />
      <form onSubmit={handleSubmit} className="space-y-4">
        <ShiftTemplateSelector
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={setSelectedTemplateId}
          templates={templates}
          onOpenCreator={() => setShowTemplateDialog(true)}
        />

        {/* בחירת תאריכים מרובים בודדים */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">
            תאריך משמרת (ניתן לבחור מספר תאריכים) *
          </label>
          <input
            type="date"
            className="border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            value=""
            onChange={e => {
              if (!e.target.value) return;
              if (!shiftDates.includes(e.target.value))
                setShiftDates([...shiftDates, e.target.value]);
            }}
            disabled={submitting}
          />
          <div className="flex flex-wrap gap-2">
            {shiftDates.map(date => (
              <span
                key={date}
                className="bg-blue-100 text-blue-700 rounded px-3 py-1 flex items-center gap-1"
              >
                {date}
                <button type="button" onClick={() => setShiftDates(shiftDates.filter(d => d !== date))} className="ml-1 text-gray-400 hover:text-red-400">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* מבנה חדש: ימים + טווח */}
        <div className="space-y-2 bg-blue-50 rounded-xl p-3">
          <WeekdaySelector
            selectedWeekdays={selectedWeekdays}
            onChange={setSelectedWeekdays}
            disabled={submitting}
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div>
              <label className="text-xs text-gray-600">מתאריך</label>
              <input
                type="date"
                value={weekdayRange.start}
                onChange={e => setWeekdayRange({...weekdayRange, start: e.target.value})}
                className="border rounded-xl p-2 ml-2"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">עד תאריך</label>
              <input
                type="date"
                value={weekdayRange.end}
                onChange={e => setWeekdayRange({...weekdayRange, end: e.target.value})}
                className="border rounded-xl p-2"
                disabled={submitting}
              />
            </div>
            {selectedWeekdays.length === 0 && (weekdayRange.start || weekdayRange.end) && (
              <span className="text-xs text-red-400 mr-4">יש לבחור לפחות יום אחד</span>
            )}
          </div>
        </div>

        <BranchSelector
          selectedBranchId={selectedBranchId}
          onBranchChange={handleBranchChange}
          branches={branches}
          multiple={true}
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

        <Button 
          type="submit" 
          disabled={submitting || !templates || templates.length === 0 || (branches && branches.length === 0)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
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
