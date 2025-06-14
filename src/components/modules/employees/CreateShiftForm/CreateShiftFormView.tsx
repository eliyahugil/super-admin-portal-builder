
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateShiftFormHeader } from './CreateShiftFormHeader';
import { ShiftTemplateSelector } from './ShiftTemplateSelector';
import { ShiftDateInput } from './ShiftDateInput';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftNotesInput } from './ShiftNotesInput';
import { useCreateShiftForm } from './useCreateShiftForm';
import { QuickShiftTemplateCreatorDialog } from './QuickShiftTemplateCreatorDialog';

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
  // מנהלים תבניות ב-state על מנת לרענן ישירות אחרי יצירה חדשה
  const [templates, setTemplates] = useState<ShiftTemplate[]>(shiftTemplates || []);

  React.useEffect(() => {
    setTemplates(shiftTemplates || []);
  }, [shiftTemplates]);

  const handleTemplateCreated = (template: ShiftTemplate) => {
    setTemplates(prev => [...prev, template]);
  };

  const {
    selectedEmployeeId,
    setSelectedEmployeeId,
    selectedTemplateId,
    setSelectedTemplateId,
    shiftDate,
    setShiftDate,
    notes,
    setNotes,
    submitting,
    handleSubmit
  } = useCreateShiftForm(businessId);

  React.useEffect(() => {
    // בוחרים אוטומטית תבנית חדשה במידה ויש אחת חדשה והיו 0 לפני כן
    if (!selectedTemplateId && templates.length === 1) {
      setSelectedTemplateId(templates[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

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

        <ShiftDateInput
          shiftDate={shiftDate}
          onDateChange={setShiftDate}
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
          disabled={submitting || !templates || templates.length === 0} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {submitting ? 'יוצר...' : 'צור משמרת'}
        </Button>
      </form>

      {/* Dialog ליצירה מהירה של תבנית */}
      <QuickShiftTemplateCreatorDialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
        businessId={businessId}
        onTemplateCreated={handleTemplateCreated}
      />
    </div>
  );
};
