import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeTokensTab } from '@/components/modules/employees/profile/tabs/EmployeeTokensTab';
import type { Employee } from '@/types/employee';
import { normalizeEmployee } from '@/types/employee';

export const EmployeeTokenPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();

  // שליפת נתוני העובד
  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async (): Promise<Employee | null> => {
      if (!employeeId) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        throw error;
      }

      return normalizeEmployee(data);
    },
    enabled: !!employeeId,
  });

  const handleBackToProfile = () => {
    navigate(`/modules/employees/profile/${employeeId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען נתוני עובד...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center" dir="rtl">
        <h2 className="text-xl font-semibold mb-4">עובד לא נמצא</h2>
        <p className="text-gray-600 mb-4">לא ניתן למצוא את העובד המבוקש</p>
        <Button onClick={() => navigate('/modules/employees')}>
          חזרה לרשימת עובדים
        </Button>
      </div>
    );
  }

  const employeeName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* כותרת עם כפתור חזרה */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBackToProfile}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לפרופיל עובד
        </Button>
        
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            טוקן אישי - {employeeName}
          </h1>
          <p className="text-gray-600 mt-2">
            ניהול טוקן אישי להגשת משמרות עבור העובד
          </p>
        </div>
      </div>

      {/* תוכן הטוקן */}
      <EmployeeTokensTab
        employee={employee}
        employeeId={employeeId!}
        employeeName={employeeName}
      />
    </div>
  );
};

export default EmployeeTokenPage;