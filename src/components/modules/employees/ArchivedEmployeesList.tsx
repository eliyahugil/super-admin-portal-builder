
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Building, Archive } from 'lucide-react';
import { useArchivedEmployees } from '@/hooks/useArchivedEmployees';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { EmployeeArchiveButton } from './EmployeeArchiveButton';
import type { Employee, EmployeeType } from '@/types/employee';

export const ArchivedEmployeesList: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const { data: archivedEmployees = [], isLoading } = useArchivedEmployees(businessId);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (archivedEmployees.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center" dir="rtl">
          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">אין עובדים בארכיון</h3>
            <p>עובדים שיועברו לארכיון יופיעו כאן</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <Archive className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          עובדים בארכיון ({archivedEmployees.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {archivedEmployees.map((employee) => {
          const employeeName = `${employee.first_name} ${employee.last_name}`;
          
          return (
            <Card key={employee.id} className="border-l-4 border-l-orange-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{employeeName}</h4>
                      <Badge variant={getEmployeeTypeVariant(employee.employee_type)}>
                        {getEmployeeTypeLabel(employee.employee_type)}
                      </Badge>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        בארכיון
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {employee.employee_id && (
                        <span>מספר עובד: {employee.employee_id}</span>
                      )}
                      
                      {employee.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                      
                      {employee.main_branch && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>{employee.main_branch.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {employee.hire_date && (
                      <div className="text-xs text-gray-500 mt-1">
                        התחיל עבודה: {new Date(employee.hire_date).toLocaleDateString('he-IL')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <EmployeeArchiveButton
                      employee={employee}
                      isArchived={true}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
