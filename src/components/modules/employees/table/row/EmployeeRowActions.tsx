
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash } from 'lucide-react';
import { EmployeeTokenButton } from '../../EmployeeTokenButton';
import type { Employee } from '@/types/employee';

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
      targetPath: profilePath,
      currentPath: window.location.pathname
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
    <div className="flex items-center gap-2">
      {/* Profile Button - Main CTA */}
      <Button
        variant="default"
        size="sm"
        onClick={handleViewProfile}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        <Eye className="h-4 w-4" />
        <span>פרופיל מלא</span>
      </Button>
      
      {/* Token Button */}
      <EmployeeTokenButton
        employeeId={employee.id}
        employeeName={employeeName}
        phone={employee.phone}
        email={employee.email}
        onTokenSent={onTokenSent}
        size="sm"
      />

      {/* Edit Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleEditEmployee}
        className="flex items-center gap-1"
      >
        <Edit className="h-3 w-3" />
        <span className="sr-only">עריכה</span>
      </Button>

      {/* Delete Button */}
      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteEmployee}
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash className="h-3 w-3" />
          <span className="sr-only">מחיקה</span>
        </Button>
      )}
    </div>
  );
};
