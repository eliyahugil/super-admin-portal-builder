
import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeEditButton } from "../edit/EmployeeEditButton";

import { EmployeeArchiveButton } from "../EmployeeArchiveButton";
import type { Employee } from "@/types/employee";
import { useNavigate } from "react-router-dom";

interface ActionsCellProps {
  employee: Employee;
  onDeleteEmployee?: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
}

export const EmployeeListActionsCell: React.FC<ActionsCellProps> = ({
  employee,
  onRefetch,
  loading,
}) => {
  const navigate = useNavigate();
  const employeeName = `${employee.first_name} ${employee.last_name}`;

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const profilePath = `/modules/employees/profile/${employee.id}`;
    console.log('🔗 Navigating to employee profile:', {
      employeeId: employee.id,
      employeeName,
      targetPath: profilePath,
      currentPath: window.location.pathname
    });
    navigate(profilePath);
  };

  const handleArchiveSuccess = () => {
    console.log('📁 Employee archived successfully, refetching data...');
    onRefetch();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Button
        variant="default"
        size="sm"
        onClick={handleViewProfile}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base px-4 py-2 w-full sm:w-auto"
        type="button"
      >
        <Eye className="h-4 w-4" />
        <span>פרופיל</span>
      </Button>
      
      
      <EmployeeEditButton
        employee={employee}
        onSuccess={onRefetch}
      />

      <EmployeeArchiveButton
        employee={employee}
        isArchived={false}
        variant="outline"
        size="sm"
        onSuccess={handleArchiveSuccess}
      />
    </div>
  );
};
