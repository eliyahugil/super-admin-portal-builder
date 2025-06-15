
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_id: string;
}

interface EmployeeFilesControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedEmployee: string;
  onEmployeeChange: (value: string) => void;
  employees: Employee[] | undefined;
  onUploadClick: () => void;
}

export const EmployeeFilesControls: React.FC<EmployeeFilesControlsProps> = ({
  searchTerm,
  onSearchChange,
  selectedEmployee,
  onEmployeeChange,
  employees,
  onUploadClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="חפש קבצים..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <select
        value={selectedEmployee}
        onChange={(e) => onEmployeeChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">כל העובדים</option>
        {employees?.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.first_name} {employee.last_name} ({employee.employee_id})
          </option>
        ))}
      </select>

      <Button 
        className="flex items-center gap-2"
        onClick={onUploadClick}
      >
        <Plus className="h-4 w-4" />
        העלה קובץ
      </Button>
    </div>
  );
};
