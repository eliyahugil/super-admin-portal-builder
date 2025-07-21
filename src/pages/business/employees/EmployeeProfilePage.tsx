
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { SimpleEmployeeProfile } from '@/components/modules/employees/profile/SimpleEmployeeProfile';
import { EmployeeProfilePage } from '@/components/modules/employees/profile/EmployeeProfilePage';

const BusinessEmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { session } = useEmployeeAuth();
  
  // If this is the logged-in employee viewing their own profile, use SimpleEmployeeProfile
  if (session && session.employee.id === employeeId) {
    return <SimpleEmployeeProfile />;
  }
  
  // Otherwise, use the manager version (for managers viewing employee profiles)
  return (
    <div className="max-w-7xl mx-auto py-10" dir="rtl">
      <EmployeeProfilePage />
    </div>
  );
};

export default BusinessEmployeeProfilePage;
