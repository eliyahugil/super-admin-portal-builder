
import React from 'react';
import { User } from 'lucide-react';

interface EmployeeBasicInfoProps {
  firstName: string;
  lastName: string;
  employeeId?: string | null;
}

export const EmployeeBasicInfo: React.FC<EmployeeBasicInfoProps> = ({
  firstName,
  lastName,
  employeeId
}) => {
  const employeeName = `${firstName} ${lastName}`;

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="h-5 w-5 text-gray-500" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {employeeName}
        </p>
        {employeeId && (
          <p className="text-sm text-gray-500 truncate">
            מזהה: {employeeId}
          </p>
        )}
      </div>
    </div>
  );
};
