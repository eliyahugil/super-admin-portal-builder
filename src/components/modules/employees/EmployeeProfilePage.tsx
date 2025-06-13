
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

  const handleGoBack = () => {
    navigate('/modules/employees');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>העובד המבוקש לא נמצא.</p>
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
