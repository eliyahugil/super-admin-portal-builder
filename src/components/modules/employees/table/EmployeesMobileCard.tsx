import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EmployeeRowActions } from './row/EmployeeRowActions';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, User, Building2, Clock } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmployeesMobileCardProps {
  employee: Employee;
  onRefetch: () => void;
  showBranch?: boolean;
  onEdit?: (employee: Employee) => void;
}

export const EmployeesMobileCard: React.FC<EmployeesMobileCardProps> = ({ 
  employee, 
  onRefetch,
  showBranch = true,
  onEdit,
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

  const getBranchName = () => {
    if (employee.main_branch?.name) {
      return employee.main_branch.name;
    }
    
    const activeBranchAssignment = employee.branch_assignments?.find(ba => ba.is_active);
    if (activeBranchAssignment?.branch?.name) {
      return activeBranchAssignment.branch.name;
    }
    
    if (employee.branch_assignments?.[0]?.branch?.name) {
      return employee.branch_assignments[0].branch.name;
    }
    
    return 'לא משויך';
  };

  const handleNameClick = () => {
    const profilePath = `/modules/employees/profile/${employee.id}`;
    navigate(profilePath);
  };

  const isActive = employee.is_active ?? true;

  return (
    <div className="w-full border-b border-border py-4 px-4 hover:bg-muted/30 transition-colors active:bg-muted/50" dir="rtl">
        {/* Header with name and status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <button
              onClick={handleNameClick}
              className="text-lg font-semibold text-primary hover:text-primary/80 hover:underline text-right block w-full truncate"
            >
              {employee.first_name} {employee.last_name}
            </button>
          </div>
          <Badge variant={isActive ? "default" : "secondary"} className="flex-shrink-0 mr-2">
            {isActive ? 'פעיל' : 'לא פעיל'}
          </Badge>
        </div>

        {/* Contact info */}
        <div className="space-y-2 mb-3">
          {employee.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span dir="ltr">{employee.phone}</span>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">סוג עובד:</span>
            <Badge variant="outline" className="text-xs">
              {getEmployeeTypeLabel(employee.employee_type)}
            </Badge>
          </div>

          {showBranch && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">סניף:</span>
              <span className="font-medium">{getBranchName()}</span>
            </div>
          )}

          {employee.weekly_hours_required && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground">שעות שבועיות:</span>
              <span className="font-medium">{employee.weekly_hours_required}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-2 border-t border-border">
          <EmployeeRowActions employee={employee} onTokenSent={onRefetch} onEdit={onEdit} />
      </div>
    </div>
  );
};