
import React from 'react';
import { useRealData } from '@/hooks/useRealData';
import { CreateShiftFormView } from './CreateShiftFormView';

interface CreateShiftFormContainerProps {
  businessId?: string;
}

export const CreateShiftFormContainer: React.FC<CreateShiftFormContainerProps> = ({ businessId }) => {
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

  console.log('🔧 CreateShiftFormContainer - Current state:', {
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
    <CreateShiftFormView 
      businessId={businessId}
      employees={employees}
      shiftTemplates={shiftTemplates}
    />
  );
};
