
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Clock, MapPin, Phone, Mail, Building } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmployeeOverviewTabProps {
  employee: Employee;
  employeeName: string;
}

export const EmployeeOverviewTab: React.FC<EmployeeOverviewTabProps> = ({ employee, employeeName }) => {
  const getShiftTypeLabel = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': return 'בוקר';
      case 'afternoon': return 'צהריים';
      case 'evening': return 'ערב';
      case 'night': return 'לילה';
      case 'full_day': return 'יום מלא';
      default: return shiftType;
    }
  };

  const getDayLabel = (dayIndex: number) => {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[dayIndex] || '';
  };

  const getEmployeeTypeLabel = (type: string) => {
    switch (type) {
      case 'permanent': return 'קבוע';
      case 'temporary': return 'זמני';
      case 'youth': return 'נוער';
      case 'contractor': return 'קבלן';
      default: return type;
    }
  };

  // Get shift types and available days from branch assignments
  const allShiftTypes = new Set<string>();
  const allAvailableDays = new Set<number>();

  employee.branch_assignments?.forEach(assignment => {
    if (assignment.is_active) {
      assignment.shift_types?.forEach(type => allShiftTypes.add(type));
      assignment.available_days?.forEach(day => allAvailableDays.add(day));
    }
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            פרטים בסיסיים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">שם מלא:</span>
                <span>{employeeName}</span>
              </div>
              
              {employee.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">אימייל:</span>
                  <span>{employee.email}</span>
                </div>
              )}
              
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">טלפון:</span>
                  <span>{employee.phone}</span>
                </div>
              )}
              
              {employee.id_number && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">ת.ז.:</span>
                  <span>{employee.id_number}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">סוג עובד:</span>
                <Badge variant="outline">{getEmployeeTypeLabel(employee.employee_type)}</Badge>
              </div>
              
              {employee.hire_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">תאריך התחלה:</span>
                  <span>{new Date(employee.hire_date).toLocaleDateString('he-IL')}</span>
                </div>
              )}
              
              {employee.weekly_hours_required && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">שעות שבועיות:</span>
                  <span>{employee.weekly_hours_required}</span>
                </div>
              )}
              
              {employee.main_branch && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">סניף ראשי:</span>
                  <span>{employee.main_branch.name}</span>
                </div>
              )}
            </div>
          </div>
          
          {employee.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">כתובת:</span>
              <span>{employee.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            מידע משמרות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shift Types */}
          <div>
            <h4 className="font-medium mb-2">סוגי משמרות:</h4>
            <div className="flex flex-wrap gap-2">
              {allShiftTypes.size > 0 ? (
                Array.from(allShiftTypes).map(shiftType => (
                  <Badge key={shiftType} variant="outline" className="bg-blue-50 text-blue-700">
                    {getShiftTypeLabel(shiftType)}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">לא הוגדרו סוגי משמרות</span>
              )}
            </div>
          </div>

          {/* Available Days */}
          <div>
            <h4 className="font-medium mb-2">ימים זמינים:</h4>
            <div className="flex flex-wrap gap-2">
              {allAvailableDays.size > 0 ? (
                Array.from(allAvailableDays).sort().map(day => (
                  <Badge key={day} variant="outline" className="bg-green-50 text-green-700">
                    {getDayLabel(day)}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">לא הוגדרו ימים זמינים</span>
              )}
            </div>
          </div>

          {/* Preferred Shift Information */}
          {employee.preferred_shift_type && (
            <div>
              <h4 className="font-medium mb-2">העדפת משמרת:</h4>
              <Badge variant="secondary">
                {getShiftTypeLabel(employee.preferred_shift_type)}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branch Assignments Summary */}
      {employee.branch_assignments && employee.branch_assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building className="h-5 w-5" />
              שיוכי סניפים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employee.branch_assignments
                .filter(assignment => assignment.is_active)
                .map(assignment => (
                  <div key={assignment.id} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium">{assignment.branch?.name}</span>
                        <div className="text-sm text-muted-foreground">
                          תפקיד: {assignment.role_name}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        עדיפות {assignment.priority_order}
                      </Badge>
                    </div>
                    
                    {assignment.max_weekly_hours && (
                      <div className="text-sm text-muted-foreground">
                        עד {assignment.max_weekly_hours} שעות שבועיות
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {employee.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">הערות</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{employee.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
