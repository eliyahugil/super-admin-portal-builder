
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar,
  Briefcase,
  MessageCircle,
  Users,
  Clock,
  Shield
} from 'lucide-react';
import type { Employee } from '@/types/employee';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onStartChat?: (employeeId: string) => void;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  open,
  onOpenChange,
  employee,
  onStartChat,
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

  const getEmployeeTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      permanent: 'bg-green-100 text-green-800',
      temporary: 'bg-yellow-100 text-yellow-800',
      contractor: 'bg-blue-100 text-blue-800',
      youth: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'לא צוין';
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const handleStartChat = () => {
    if (onStartChat) {
      onStartChat(employee.id);
      onOpenChange(false);
    }
  };

  const isActive = employee.is_active;
  const lastSeen = 'פעיל עכשיו'; // TODO: implement real last seen

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(employee.first_name, employee.last_name)}
                </AvatarFallback>
              </Avatar>
              {/* Online status indicator */}
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                isActive ? 'bg-green-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold mb-1">
                {employee.first_name} {employee.last_name}
              </DialogTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getEmployeeTypeColor(employee.employee_type)}>
                  {getEmployeeTypeLabel(employee.employee_type)}
                </Badge>
                {!isActive && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    לא פעיל
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lastSeen}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleStartChat} 
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              שלח הודעה
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              התקשר
            </Button>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                פרטי יצירת קשר
              </h4>
              
              {employee.phone && (
                <div className="flex items-center gap-3 text-sm group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">טלפון</p>
                    <p className="text-gray-600">{employee.phone}</p>
                  </div>
                </div>
              )}
              
              {employee.email && (
                <div className="flex items-center gap-3 text-sm group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">אימייל</p>
                    <p className="text-gray-600">{employee.email}</p>
                  </div>
                </div>
              )}
              
              {employee.address && (
                <div className="flex items-center gap-3 text-sm group cursor-pointer hover:bg-gray-50 p-2 rounded-lg -m-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium">כתובת</p>
                    <p className="text-gray-600">{employee.address}</p>
                  </div>
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
                <div className="flex items-center gap-3 text-sm">
                  <Building className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium">סניף ראשי</p>
                    <p className="text-gray-600">{employee.main_branch.name}</p>
                  </div>
                </div>
              )}
              
              {employee.hire_date && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium">תאריך התחלה</p>
                    <p className="text-gray-600">{formatDate(employee.hire_date)}</p>
                  </div>
                </div>
              )}
              
              {employee.weekly_hours_required && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">שעות שבועיות נדרשות</p>
                    <p className="text-gray-600">{employee.weekly_hours_required} שעות</p>
                  </div>
                </div>
              )}

              {employee.employee_id && (
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="font-medium">מספר עובד</p>
                    <p className="text-gray-600">{employee.employee_id}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Branch Assignments */}
          {employee.branch_assignments && employee.branch_assignments.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  הקצאות סניפים
                </h4>
                <div className="space-y-2">
                  {employee.branch_assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.branch.name}</p>
                        <p className="text-gray-600 text-xs">{assignment.role_name}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {assignment.is_active ? 'פעיל' : 'לא פעיל'}
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
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{employee.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
