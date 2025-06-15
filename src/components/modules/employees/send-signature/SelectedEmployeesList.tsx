
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from './types';

interface SelectedEmployeesListProps {
  selectedEmployeeIds: string[];
  employees: Employee[];
  signatureUrls: { [employeeId: string]: string };
  onEmployeeRemove: (employeeId: string) => void;
}

export const SelectedEmployeesList: React.FC<SelectedEmployeesListProps> = ({
  selectedEmployeeIds,
  employees,
  signatureUrls,
  onEmployeeRemove
}) => {
  const { toast } = useToast();

  const getEmployeeName = (employee: Employee) => {
    return `${employee.first_name} ${employee.last_name}${employee.employee_id ? ` (${employee.employee_id})` : ''}`;
  };

  const copySignatureUrl = (url: string, employeeName: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'הועתק ללוח',
      description: `קישור החתימה של ${employeeName} הועתק ללוח`,
    });
  };

  const openSignatureUrl = (url: string) => {
    window.open(url, '_blank');
  };

  if (selectedEmployeeIds.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <h4 className="font-medium mb-2">עובדים נבחרים ({selectedEmployeeIds.length}):</h4>
      <div className="flex flex-wrap gap-2">
        {selectedEmployeeIds.map((employeeId) => {
          const employee = employees.find(emp => emp.id === employeeId);
          if (!employee) return null;
          
          const employeeName = getEmployeeName(employee);
          const hasSignatureUrl = signatureUrls[employeeId];

          return (
            <div key={employeeId} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-sm text-blue-800">{employeeName}</span>
              
              {/* קישורי חתימה בתגיות */}
              {hasSignatureUrl && (
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copySignatureUrl(signatureUrls[employeeId], employeeName)}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                    title="העתק קישור"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openSignatureUrl(signatureUrls[employeeId])}
                    className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                    title="פתח קישור"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onEmployeeRemove(employeeId)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-red-600"
                title="הסר עובד"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
