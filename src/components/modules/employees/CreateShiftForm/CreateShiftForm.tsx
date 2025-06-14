
import React from 'react';
import { Button } from '@/components/ui/button';
import { useRealData } from '@/hooks/useRealData';
import { CreateShiftFormHeader } from './CreateShiftFormHeader';
import { ShiftTemplateSelector } from './ShiftTemplateSelector';
import { ShiftDateInput } from './ShiftDateInput';
import { EmployeeSelector } from './EmployeeSelector';
import { ShiftNotesInput } from './ShiftNotesInput';
import { useCreateShiftForm } from './useCreateShiftForm';

interface CreateShiftFormProps {
  businessId?: string;
}

export const CreateShiftForm: React.FC<CreateShiftFormProps> = ({ businessId }) => {
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

  const { data: employees } = useRealData<any>({
    queryKey: ['employees-for-shift', businessId],
    tableName: 'employees',
    filters: businessId ? { is_active: true, business_id: businessId } : { is_active: true },
    enabled: !!businessId
  });

  const { data: shiftTemplates } = useRealData<any>({
    queryKey: ['shift-templates', businessId],
    tableName: 'shift_templates',
    filters: businessId ? { is_active: true, business_id: businessId } : { is_active: true },
    enabled: !!businessId
  });

  console.log('🔧 CreateShiftForm - Current state:', {
    businessId,
    employeesCount: employees?.length,
    templatesCount: shiftTemplates?.length
  });

  if (!businessId) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6" dir="rtl">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">לא נבחר עסק</h3>
          <p className="text-gray-600">יש לבחור עסק כדי ליצור משמרות</p>
        </div>
      </div>
    );
  }

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
