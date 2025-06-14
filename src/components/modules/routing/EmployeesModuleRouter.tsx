
import React from 'react';
import { EmployeeProfilePage } from '../employees/profile/EmployeeProfilePage';
import { EmployeeManagement } from '../employees/EmployeeManagement';
import { ShiftManagement } from '../employees/ShiftManagement';
import { AttendanceManagement } from '../employees/AttendanceManagement';
import { EmployeeFilesManagement } from '../employees/EmployeeFilesManagement';
import { EmployeeRequestsList } from '../employees/EmployeeRequestsList';
import { EmployeeDocuments } from '../employees/EmployeeDocuments';

interface Props {
  route: string;
  employeeId?: string;
  businessId?: string;
}

export const EmployeesModuleRouter: React.FC<Props> = ({ route, employeeId, businessId }) => {
  if (route === 'profile' || (!route && employeeId)) {
    return <EmployeeProfilePage />;
  }
  switch (route) {
    case '':
      return <EmployeeManagement />;
    case 'attendance':
      return <AttendanceManagement />;
    case 'employee-files':
      return <EmployeeFilesManagement />;
    case 'employee-requests':
      return <EmployeeRequestsList businessId={businessId} />;
    case 'employee-docs':
      return (
        <div className="max-w-4xl mx-auto py-8" dir="rtl">
          <h2 className="text-2xl font-bold mb-4">מסמכים לחתימה</h2>
          <p className="bg-purple-50 rounded-lg p-4 mb-4 text-purple-700">
            כאן ניתן להעלות מסמכים, לשלוח לעובדים לחתימה ולעקוב אחרי סטטוס המסמכים.
          </p>
          <EmployeeDocuments
            employeeId={employeeId || ''}
            employeeName="(כל העובדים)"
            canEdit={true}
          />
        </div>
      );
    case 'shifts':
      return <ShiftManagement />;
    case 'import':
      return <EmployeeManagement />;
    default:
      return null;
  }
};
