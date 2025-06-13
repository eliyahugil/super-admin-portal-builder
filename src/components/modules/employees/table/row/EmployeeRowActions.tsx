
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash, User } from 'lucide-react';
import { EmployeeTokenButton } from '../../EmployeeTokenButton';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
}

interface EmployeeRowActionsProps {
  employee: Employee;
  onTokenSent: () => void;
  onDelete?: (employee: Employee) => void;
}

export const EmployeeRowActions: React.FC<EmployeeRowActionsProps> = ({
  employee,
  onTokenSent,
  onDelete
}) => {
  const navigate = useNavigate();
  const employeeName = `${employee.first_name} ${employee.last_name}`;

  const handleViewProfile = () => {
    const profilePath = `/modules/employees/profile/${employee.id}`;
    console.log('🔗 Navigating to employee profile:', {
      employeeId: employee.id,
      employeeName,
      targetPath: profilePath
    });
    navigate(profilePath);
  };

  const handleEditEmployee = () => {
    // TODO: Implement edit functionality
    console.log('Edit employee:', employee.id);
  };

  const handleDeleteEmployee = () => {
    if (onDelete) {
      onDelete(employee);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="default"
        size="sm"
        onClick={handleViewProfile}
        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white"
      >
        <User className="h-4 w-4" />
        <span>פרופיל מלא</span>
      </Button>
      
      <EmployeeTokenButton
        employeeId={employee.id}
        employeeName={employeeName}
        phone={employee.phone}
        email={employee.email}
        onTokenSent={onTokenSent}
        size="sm"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleEditEmployee}
      >
        <Edit className="h-3 w-3" />
      </Button>

      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteEmployee}
          className="text-red-600 hover:text-red-800"
        >
          <Trash className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
