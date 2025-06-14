
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreateShiftFormHeader } from './CreateShiftFormHeader';
import { ShiftTemplateSelector } from './ShiftTemplateSelector';
import { ShiftDateInput } from './ShiftDateInput';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftNotesInput } from './ShiftNotesInput';
import { useCreateShiftForm } from './useCreateShiftForm';

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

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4" dir="rtl">
      <CreateShiftFormHeader />

      <form onSubmit={handleSubmit} className="space-y-4">
        <ShiftTemplateSelector
          selectedTemplateId={selectedTemplateId}
          onTemplateChange={setSelectedTemplateId}
          templates={shiftTemplates}
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
          disabled={submitting || !shiftTemplates || shiftTemplates.length === 0} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {submitting ? 'יוצר...' : 'צור משמרת'}
        </Button>
      </form>
    </div>
  );
};
