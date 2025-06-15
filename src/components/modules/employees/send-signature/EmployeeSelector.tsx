
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface ExistingSignature {
  employee_id: string;
  status: string;
  employee?: Employee;
}

interface EmployeeSelectorProps {
  employees: Employee[];
  employeesLoading: boolean;
  selectedEmployeeIds: string[];
  existingSignatures: ExistingSignature[];
  onEmployeeToggle: (employeeId: string) => void;
  onEmployeeRemove: (employeeId: string) => void;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  employees,
  employeesLoading,
  selectedEmployeeIds,
  existingSignatures,
  onEmployeeToggle,
  onEmployeeRemove
}) => {
  console.log('👥 EmployeeSelector rendered:', {
    employeesCount: employees.length,
    employeesLoading,
    selectedEmployeeIds,
    existingSignaturesCount: existingSignatures.length
  });

  const getEmployeeSignatureStatus = (employeeId: string) => {
    return existingSignatures.find(sig => sig.employee_id === employeeId);
  };

  const selectedEmployees = employees.filter(emp => selectedEmployeeIds.includes(emp.id));

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">בחר עובדים לחתימה:</label>
        
        {/* רשימת העובדים הנבחרים */}
        {selectedEmployees.length > 0 && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-2">עובדים נבחרים ({selectedEmployees.length}):</p>
            <div className="flex flex-wrap gap-1">
              {selectedEmployees.map((employee) => (
                <Badge key={employee.id} variant="secondary" className="flex items-center gap-1">
                  {employee.first_name} {employee.last_name}
                  {employee.employee_id && ` (${employee.employee_id})`}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onEmployeeRemove(employee.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* רשימת כל העובדים */}
        <div className="border rounded-lg max-h-60 overflow-y-auto">
          {employeesLoading ? (
            <div className="p-4 text-center text-gray-500">טוען עובדים...</div>
          ) : employees.length === 0 ? (
            <div className="p-4 text-center text-gray-500">לא נמצאו עובדים פעילים</div>
          ) : (
            <div className="space-y-1 p-2">
              {employees.map((employee) => {
                const isSelected = selectedEmployeeIds.includes(employee.id);
                const existingSignature = getEmployeeSignatureStatus(employee.id);
                
                return (
                  <div
                    key={employee.id}
                    className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onEmployeeToggle(employee.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onEmployeeToggle(employee.id)}
                      className="ml-2"
                    />
                    <div className="flex-1">
                      <span className="text-sm">
                        {employee.first_name} {employee.last_name}
                        {employee.employee_id && ` (${employee.employee_id})`}
                      </span>
                      {existingSignature && (
                        <div className="mt-1">
                          <Badge 
                            variant={existingSignature.status === 'signed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {existingSignature.status === 'signed' ? 'נחתם' : 'ממתין לחתימה'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
