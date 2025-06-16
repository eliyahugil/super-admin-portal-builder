
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar,
  Briefcase
} from 'lucide-react';
import type { Employee } from '@/types/employee';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onOpenChange,
  employee,
}) => {
  if (!employee) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getEmployeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      permanent: 'קבוע',
      temporary: 'זמני',
      contractor: 'קבלן',
      youth: 'נוער',
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'לא צוין';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg font-bold">
                {getInitials(employee.first_name, employee.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {employee.first_name} {employee.last_name}
              </h3>
              <Badge variant="outline">
                {getEmployeeTypeLabel(employee.employee_type)}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                פרטים אישיים
              </h4>
              
              {employee.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{employee.phone}</span>
                </div>
              )}
              
              {employee.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{employee.email}</span>
                </div>
              )}
              
              {employee.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{employee.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4" />
                פרטי עבודה
              </h4>
              
              {employee.main_branch && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>סניף ראשי: {employee.main_branch.name}</span>
                </div>
              )}
              
              {employee.hire_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>תאריך התחלה: {formatDate(employee.hire_date)}</span>
                </div>
              )}
              
              {employee.weekly_hours_required && (
                <div className="text-sm">
                  <span className="text-gray-500">שעות שבועיות נדרשות: </span>
                  <span className="font-medium">{employee.weekly_hours_required}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branch Assignments */}
          {employee.branch_assignments && employee.branch_assignments.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-sm">הקצאות סניפים</h4>
                <div className="space-y-2">
                  {employee.branch_assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{assignment.branch.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {assignment.role_name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {employee.notes && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">הערות</h4>
                <p className="text-sm text-gray-600">{employee.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
