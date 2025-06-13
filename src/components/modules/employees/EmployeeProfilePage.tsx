
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useEmployeeProfile } from './profile/useEmployeeProfile';
import { EmployeeProfileHeader } from './profile/EmployeeProfileHeader';
import { EmployeeProfileSidebar } from './profile/EmployeeProfileSidebar';
import { EmployeeProfileTabs } from './profile/EmployeeProfileTabs';

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { employee, loading, refetchEmployee } = useEmployeeProfile(employeeId);

  console.log('🏠 EmployeeProfilePage - State:', {
    employeeId,
    hasEmployee: !!employee,
    loading,
    employeeName: employee ? `${employee.first_name} ${employee.last_name}` : 'N/A'
  });

  const handleGoBack = () => {
    navigate('/modules/employees');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="mr-3">טוען פרטי עובד...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">העובד לא נמצא</h3>
            <p className="text-gray-600 mb-4">
              העובד המבוקש לא נמצא במערכת או שאין לך הרשאה לצפות בו.
            </p>
            <button
              onClick={handleGoBack}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              חזרה לרשימת העובדים
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <EmployeeProfileHeader
        employee={employee}
        onGoBack={handleGoBack}
        onEmployeeUpdated={refetchEmployee}
      />
      <CardContent>
        <div className="md:flex gap-4">
          <EmployeeProfileSidebar employee={employee} />
          <EmployeeProfileTabs employee={employee} employeeId={employeeId!} />
        </div>
      </CardContent>
    </Card>
  );
};
