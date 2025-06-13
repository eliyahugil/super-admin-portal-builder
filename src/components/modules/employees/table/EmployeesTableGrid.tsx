
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle
} from 'lucide-react';
import { EmployeeActions } from '../EmployeeActions';
import type { Employee, EmployeeType } from '@/types/employee';

interface EmployeesTableGridProps {
  employees: Employee[];
  onTokenSent: () => void;
}

export const EmployeesTableGrid: React.FC<EmployeesTableGridProps> = ({
  employees,
  onTokenSent,
}) => {
  const getEmployeeTypeLabel = (type: EmployeeType) => {
    const types: Record<EmployeeType, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      youth: 'נוער',
      contractor: 'קבלן',
    };
    return types[type];
  };

  const getEmployeeTypeVariant = (type: EmployeeType) => {
    const variants: Record<EmployeeType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      permanent: 'default',
      temporary: 'secondary',
      youth: 'outline',
      contractor: 'destructive',
    };
    return variants[type];
  };

  const getActiveBranches = (employee: Employee) => {
    const activeBranches = employee.branch_assignments?.filter(
      assignment => assignment.is_active
    ) || [];
    
    if (activeBranches.length === 0 && employee.main_branch) {
      return [employee.main_branch.name];
    }
    
    return activeBranches.map(assignment => assignment.branch.name);
  };

  const getActiveRoles = (employee: Employee) => {
    return employee.branch_assignments
      ?.filter(assignment => assignment.is_active)
      ?.map(assignment => assignment.role_name) || [];
  };

  const getActiveToken = (employee: Employee) => {
    const activeToken = employee.weekly_tokens?.find(token => token.is_active);
    return activeToken ? {
      token: activeToken.token,
      period: `${new Date(activeToken.week_start_date).toLocaleDateString('he-IL')} - ${new Date(activeToken.week_end_date).toLocaleDateString('he-IL')}`
    } : null;
  };

  const getRecentNotes = (employee: Employee) => {
    return employee.employee_notes?.slice(0, 2) || [];
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">שם מלא</TableHead>
          <TableHead className="text-right">מספר עובד</TableHead>
          <TableHead className="text-right">טלפון</TableHead>
          <TableHead className="text-right">סוג עובד</TableHead>
          <TableHead className="text-right">סניפים</TableHead>
          <TableHead className="text-right">תפקידים</TableHead>
          <TableHead className="text-right">טוקן פעיל</TableHead>
          <TableHead className="text-right">הערות</TableHead>
          <TableHead className="text-right">סטטוס</TableHead>
          <TableHead className="text-right">פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const activeBranches = getActiveBranches(employee);
          const activeRoles = getActiveRoles(employee);
          const activeToken = getActiveToken(employee);
          const recentNotes = getRecentNotes(employee);

          return (
            <TableRow key={employee.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </div>
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
                {employee.weekly_hours_required && (
                  <div className="text-xs text-gray-500 mt-1">
                    {employee.weekly_hours_required} שעות/שבוע
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                {activeBranches.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {activeBranches.slice(0, 2).map((branchName, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        {branchName}
                      </Badge>
                    ))}
                    {activeBranches.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{activeBranches.length - 2} נוספים
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">לא שוייך</span>
                )}
              </TableCell>
              
              <TableCell>
                {activeRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {activeRoles.slice(0, 2).map((role, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                    {activeRoles.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{activeRoles.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">לא הוגדר</span>
                )}
              </TableCell>
              
              <TableCell>
                {activeToken ? (
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono text-xs">
                        {activeToken.token.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {activeToken.period}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">לא נוצר</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  {recentNotes.length > 0 ? (
                    recentNotes.map((note, index) => (
                      <div key={index} className="text-xs bg-gray-100 rounded px-2 py-1">
                        <span className="font-medium">{note.note_type}:</span>
                        <span className="ml-1">
                          {note.content.length > 30 
                            ? `${note.content.substring(0, 30)}...`
                            : note.content
                          }
                        </span>
                      </div>
                    ))
                  ) : employee.notes ? (
                    <div className="text-xs text-gray-600">
                      {employee.notes.length > 50 
                        ? `${employee.notes.substring(0, 50)}...`
                        : employee.notes
                      }
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">אין הערות</span>
                  )}
                </div>
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
                <EmployeeActions
                  employee={employee}
                  onTokenSent={onTokenSent}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
