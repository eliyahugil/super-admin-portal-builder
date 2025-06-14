import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEmployeeProfile } from './useEmployeeProfile';
import { EmployeeProfileHeader } from './EmployeeProfileHeader';
import { EmployeeProfileSidebar } from './EmployeeProfileSidebar';
import { EmployeeProfileTabs } from './EmployeeProfileTabs';
import type { Employee } from '@/types/supabase';

const placeholderEmployee: Employee = {
  id: '00000000-0000-0000-0000-000000000000',
  business_id: '00000000-0000-0000-0000-000000000000',
  employee_id: null,
  first_name: 'ישראל',
  last_name: 'ישראלי',
  email: 'placeholder@email.com',
  phone: '050-0000000',
  address: 'רחוב הדוגמה 1, תל אביב',
  id_number: null,
  employee_type: 'permanent',
  hire_date: '2023-01-01',
  termination_date: null,
  is_active: true,
  is_archived: false,
  main_branch_id: null,
  preferred_shift_type: null,
  weekly_hours_required: 42,
  notes: 'זהו עובד דמה לתצוגה בלבד',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  username: null,
  password_hash: null,
  is_system_user: false,
  main_branch: { name: 'סניף מרכזי' },
  employee_notes: [],
  employee_documents: [],
  branch_assignments: [],
  weekly_tokens: [],
};

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { employee, loading, refetchEmployee } = useEmployeeProfile(employeeId);

  console.log('🏠 EmployeeProfilePage - State:', {
    employeeId,
    hasEmployee: !!employee,
    loading,
    employeeName: employee ? `${employee.first_name} ${employee.last_name}` : 'N/A',
    currentPath: window.location.pathname
  });

  const handleGoBack = () => {
    navigate('/modules/employees');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <h3 className="text-lg font-medium text-gray-900 mt-4 mb-2">טוען פרטי עובד</h3>
                  <p className="text-gray-600">אנא המתן...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // אם לא נמצא עובד – נציג placeholder מאובטח ורגיש, ללא נתונים אמיתיים
  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900">
                פרופיל עובד
              </h1>
              <p className="text-gray-600 mt-1">
                תצוגה לדוגמה בלבד (אין פרטי עובד אמיתיים)
              </p>
            </div>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              חזרה לרשימת העובדים
            </Button>
          </div>
          <Card>
            <EmployeeProfileHeader
              employee={placeholderEmployee}
              onGoBack={handleGoBack}
              onEmployeeUpdated={() => {}}
            />
            <CardContent className="p-6">
              <div className="md:flex gap-6" dir="rtl">
                <EmployeeProfileSidebar employee={placeholderEmployee} />
                <div className="flex-1 flex items-center justify-center text-gray-400 select-none" style={{ minHeight: 175 }}>
                  {/* אפשר להציג אילוסטרציה או טקסט – כאן טקסט */}
                  <span className="text-lg font-semibold">אין נתונים אמיתיים להצגה – זו תצוגה בלבד</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">
              פרופיל עובד - {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-gray-600 mt-1">
              פרטי עובד מלאים עם כל הכרטיסיות והמידע
            </p>
          </div>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לרשימת העובדים
          </Button>
        </div>

        {/* Main profile content */}
        <Card>
          <EmployeeProfileHeader
            employee={employee}
            onGoBack={handleGoBack}
            onEmployeeUpdated={refetchEmployee}
          />
          <CardContent className="p-6">
            <div className="md:flex gap-6" dir="rtl">
              <EmployeeProfileSidebar employee={employee} />
              <EmployeeProfileTabs employee={employee} employeeId={employeeId!} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
