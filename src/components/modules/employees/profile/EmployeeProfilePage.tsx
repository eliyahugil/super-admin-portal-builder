
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEmployeeProfile } from './useEmployeeProfile';
import { EmployeeProfileHeader } from './EmployeeProfileHeader';
import { EmployeeProfileSidebar } from './EmployeeProfileSidebar';
import { EmployeeProfileTabs } from './EmployeeProfileTabs';

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

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">עובד לא נמצא</h1>
                <p className="text-gray-600 mb-6">
                  העובד המבוקש לא נמצא במערכת או שאין לך הרשאה לצפות בו.
                </p>
                <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm text-gray-700 text-right">
                  <p><strong>מזהה עובד:</strong> {employeeId || 'לא הוגדר'}</p>
                  <p><strong>נתיב נוכחי:</strong> {window.location.pathname}</p>
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
