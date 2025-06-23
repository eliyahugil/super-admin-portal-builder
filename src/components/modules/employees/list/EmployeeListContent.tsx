
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Users, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EmployeeListPagination } from './EmployeeListPagination';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '@/types/employee';
import type { PageSize } from './useEmployeeListPagination';

interface EmployeeListContentProps {
  employees: Employee[];
  searchTerm: string;
  selectedEmployees: Set<string>;
  onSelectEmployee: (employeeId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDeleteEmployee: (employee: Employee) => void;
  onRefetch: () => void;
  loading: boolean;
  totalEmployees: number;
  // Pagination props
  currentPage: number;
  totalPages: number;
  pageSize: PageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

export const EmployeeListContent: React.FC<EmployeeListContentProps> = ({
  employees,
  searchTerm,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onDeleteEmployee,
  loading,
  totalEmployees,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const navigate = useNavigate();

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      contractor: 'קבלן',
      youth: 'נוער',
    };
    return types[type] || type;
  };

  const getBranchName = (employee: Employee) => {
    if (employee.main_branch?.name) {
      return employee.main_branch.name;
    }
    if (employee.branch_assignments?.[0]?.branch?.name) {
      return employee.branch_assignments[0].branch.name;
    }
    return 'לא משויך';
  };

  const getDisplayName = (employee: Employee) => {
    const firstName = employee.first_name?.trim() || '';
    const lastName = employee.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return 'לא הוגדר שם';
    }
  };

  const handleViewProfile = (employee: Employee) => {
    const profilePath = `/modules/employees/profile/${employee.id}`;
    console.log('🔗 Navigating to employee profile:', {
      employeeId: employee.id,
      employeeName: getDisplayName(employee),
      targetPath: profilePath,
      currentPath: window.location.pathname
    });
    navigate(profilePath);
  };

  const handleNameClick = (employee: Employee) => {
    const profilePath = `/modules/employees/profile/${employee.id}`;
    console.log('🔗 Navigating to employee profile from name click:', {
      employeeId: employee.id,
      employeeName: getDisplayName(employee),
      targetPath: profilePath,
      currentPath: window.location.pathname
    });
    navigate(profilePath);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'לא נמצאו תוצאות' : 'אין עובדים במערכת'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'נסה לשנות את החיפוש' : 'התחל בהוספת עובדים למערכת'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Employees List */}
      <Card>
        <CardContent className="p-0">
          {/* Select All Header */}
          <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
            <Checkbox
              checked={employees.length > 0 && selectedEmployees.size === employees.length}
              onCheckedChange={onSelectAll}
            />
            <span className="text-sm font-medium">
              בחר הכל ({employees.length} עובדים בעמוד זה)
            </span>
          </div>

          {/* Employee Cards */}
          <div className="divide-y">
            {employees.map((employee) => (
              <div key={employee.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedEmployees.has(employee.id)}
                    onCheckedChange={(checked) => onSelectEmployee(employee.id, checked as boolean)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <button
                          onClick={() => handleNameClick(employee)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-right font-medium cursor-pointer bg-transparent border-none p-0"
                        >
                          <h3 className="font-medium text-gray-900">
                            {getDisplayName(employee)}
                          </h3>
                        </button>
                        <div className="text-sm text-gray-600 space-y-1">
                          {employee.email && (
                            <div>📧 {employee.email}</div>
                          )}
                          {employee.phone && (
                            <div>📱 {employee.phone}</div>
                          )}
                          {employee.employee_id && (
                            <div>🆔 {employee.employee_id}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {getEmployeeTypeLabel(employee.employee_type)}
                        </Badge>
                        <Badge variant={employee.is_active ? "default" : "secondary"}>
                          {employee.is_active ? 'פעיל' : 'לא פעיל'}
                        </Badge>
                        <Badge variant="secondary">
                          {getBranchName(employee)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewProfile(employee)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Eye className="h-4 w-4" />
                      <span>פרופיל</span>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewProfile(employee)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          פתח פרופיל מלא
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteEmployee(employee)}
                          className="text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          מחק עובד
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <EmployeeListPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalEmployees={totalEmployees}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};
