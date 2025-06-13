
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Building, Calendar, Eye, Edit, Trash } from 'lucide-react';
import { EmployeeTokenButton } from '../EmployeeTokenButton';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

interface Employee {
  id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  employee_type: string;
  is_active: boolean;
  hire_date: string | null;
  weekly_hours_required: number | null;
  notes: string | null;
  main_branch?: { name: string } | null;
  branch_assignments?: Array<{
    branch: { name: string };
    role_name: string;
    is_active: boolean;
  }>;
  weekly_tokens?: Array<{
    token: string;
    week_start_date: string;
    week_end_date: string;
    is_active: boolean;
  }>;
  employee_notes?: Array<{
    content: string;
    note_type: string;
    created_at: string;
  }>;
}

interface EmployeesTableRowProps {
  employee: Employee;
  onTokenSent: () => void;
  onDelete?: (employee: Employee) => void;
}

const getEmployeeTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    permanent: 'קבוע',
    temporary: 'זמני',
    youth: 'נוער',
    contractor: 'קבלן',
  };
  return types[type] || type;
};

const getEmployeeTypeVariant = (type: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    permanent: 'default',
    temporary: 'secondary',
    youth: 'outline',
    contractor: 'destructive',
  };
  return variants[type] || 'default';
};

export const EmployeesTableRow: React.FC<EmployeesTableRowProps> = ({
  employee,
  onTokenSent,
  onDelete
}) => {
  const navigate = useNavigate();
  const { businessId } = useCurrentBusiness();

  const handleViewProfile = () => {
    navigate(`/modules/employees/profile/${employee.id}`);
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

  const employeeName = `${employee.first_name} ${employee.last_name}`;
  const activeBranches = employee.branch_assignments?.filter(ba => ba.is_active) || [];
  const recentNotes = employee.employee_notes?.slice(0, 2) || [];
  const activeTokensCount = employee.weekly_tokens?.filter(t => t.is_active).length || 0;

  return (
    <tr className="hover:bg-gray-50 border-b">
      {/* Employee Basic Info */}
      <td className="px-4 py-3">
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
            {employee.employee_id && (
              <p className="text-sm text-gray-500 truncate">
                מזהה: {employee.employee_id}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Contact Info */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          {employee.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-3 w-3 mr-1" />
              {employee.phone}
            </div>
          )}
          {employee.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-3 w-3 mr-1" />
              {employee.email}
            </div>
          )}
        </div>
      </td>

      {/* Status & Type */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <Badge variant={employee.is_active ? 'default' : 'destructive'}>
            {employee.is_active ? 'פעיל' : 'לא פעיל'}
          </Badge>
          <Badge variant={getEmployeeTypeVariant(employee.employee_type)}>
            {getEmployeeTypeLabel(employee.employee_type)}
          </Badge>
        </div>
      </td>

      {/* Branch Info */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          {employee.main_branch && (
            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-3 w-3 mr-1" />
              {employee.main_branch.name}
            </div>
          )}
          {activeBranches.length > 0 && (
            <div className="text-xs text-gray-500">
              +{activeBranches.length} הקצאות פעילות
            </div>
          )}
        </div>
      </td>

      {/* Work Info */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          {employee.hire_date && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(employee.hire_date).toLocaleDateString('he-IL')}
            </div>
          )}
          {employee.weekly_hours_required && (
            <div className="text-xs text-gray-500">
              {employee.weekly_hours_required} שעות/שבוע
            </div>
          )}
        </div>
      </td>

      {/* Quick Stats */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">
            {activeTokensCount} טוקנים פעילים
          </div>
          <div className="text-xs text-gray-500">
            {recentNotes.length} הערות
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewProfile}
            className="flex items-center space-x-1"
          >
            <Eye className="h-3 w-3" />
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
      </td>
    </tr>
  );
};
