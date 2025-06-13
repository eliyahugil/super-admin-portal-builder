
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Building, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmployeeEditButton } from '../edit/EmployeeEditButton';
import { EmployeeTokenButton } from '../EmployeeTokenButton';
import type { Employee, EmployeeType } from '@/types/supabase';

interface EmployeeListTableProps {
  employees: Employee[];
  selectedEmployees: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
}

export const EmployeeListTable: React.FC<EmployeeListTableProps> = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onDeleteEmployee,
  onRefetch,
  loading,
}) => {
  const navigate = useNavigate();

  const getEmployeeTypeLabel = (type: EmployeeType) => {
    const types: Record<EmployeeType, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type] || type;
  };

  const getEmployeeTypeVariant = (type: EmployeeType) => {
    const variants: Record<EmployeeType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      permanent: 'default',
      temporary: 'secondary',
      youth: 'outline',
      contractor: 'destructive',
    };
    return variants[type] || 'default';
  };

  const handleViewProfile = (employeeId: string, employeeName: string) => {
    const profilePath = `/modules/employees/profile/${employeeId}`;
    console.log('🔗 Navigating to employee profile from list:', {
      employeeId,
      employeeName,
      targetPath: profilePath,
      currentPath: window.location.pathname
    });
    navigate(profilePath);
  };

  const allFilteredSelected = employees.length > 0 && 
    employees.every(emp => selectedEmployees.has(emp.id));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-right">
            <Checkbox
              checked={allFilteredSelected}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead className="text-right">שם מלא</TableHead>
          <TableHead className="text-right">מספר עובד</TableHead>
          <TableHead className="text-right">טלפון</TableHead>
          <TableHead className="text-right">סוג עובד</TableHead>
          <TableHead className="text-right">סניף</TableHead>
          <TableHead className="text-right">שעות שבועיות</TableHead>
          <TableHead className="text-right">סטטוס</TableHead>
          <TableHead className="text-right">פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const employeeName = `${employee.first_name} ${employee.last_name}`;
          
          return (
            <TableRow key={employee.id} className="hover:bg-gray-50">
              <TableCell>
                <Checkbox
                  checked={selectedEmployees.has(employee.id)}
                  onCheckedChange={(checked) => 
                    onSelectEmployee(employee.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <div>{employeeName}</div>
                  {employee.email && (
                    <div className="text-xs text-gray-500 mt-1">
                      {employee.email}
                    </div>
                  )}
                  {employee.hire_date && (
                    <div className="text-xs text-gray-500">
                      התחיל: {new Date(employee.hire_date).toLocaleDateString('he-IL')}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {employee.employee_id || (
                  <span className="text-gray-400 text-sm">לא הוגדר</span>
                )}
              </TableCell>
              <TableCell>
                {employee.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-500" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">לא הוגדר</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getEmployeeTypeVariant(employee.employee_type)}>
                  {getEmployeeTypeLabel(employee.employee_type)}
                </Badge>
              </TableCell>
              <TableCell>
                {employee.main_branch ? (
                  <div className="flex items-center gap-2">
                    <Building className="h-3 w-3 text-gray-500" />
                    <span className="text-sm">{employee.main_branch.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">לא שוייך</span>
                )}
              </TableCell>
              <TableCell>
                {employee.weekly_hours_required || (
                  <span className="text-gray-400 text-sm">לא הוגדר</span>
                )}
              </TableCell>
              <TableCell>
                {employee.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    פעיל
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    לא פעיל
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {/* Profile Button - Primary Action */}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleViewProfile(employee.id, employeeName)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
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
                    onTokenSent={onRefetch}
                    size="sm"
                  />

                  {/* Edit Button */}
                  <EmployeeEditButton
                    employee={employee}
                    onSuccess={onRefetch}
                  />

                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteEmployee(employee)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
