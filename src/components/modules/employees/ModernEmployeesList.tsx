
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Users } from 'lucide-react';
import { EmployeesList } from './EmployeesList';
import type { Employee } from '@/hooks/useEmployees';

interface ModernEmployeesListProps {
  businessId: string;
  employees: Employee[];
  onRefetch: () => void;
}

export const ModernEmployeesList: React.FC<ModernEmployeesListProps> = ({
  businessId,
  employees,
  onRefetch,
}) => {
  console.log('📋 ModernEmployeesList - Debug info:', {
    businessId,
    employees: employees.length,
  });

  if (!employees || employees.length === 0) {
    console.log('⚠️ ModernEmployeesList - No active employees found');
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            עובדים פעילים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין עובדים פעילים</h3>
            <p className="text-muted-foreground">
              טרם נוספו עובדים פעילים למערכת.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('✅ ModernEmployeesList - Displaying active employees:', employees.length);

  return (
    <div className="space-y-4">
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">עובדים פעילים</AlertTitle>
        <AlertDescription className="text-green-700">
          יש לך {employees.length} עובדים פעילים במערכת. 
          כאן תוכל לנהל ולעדכן את פרטי העובדים שלך.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            עובדים פעילים ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <EmployeesList
            businessId={businessId}
            employees={employees}
            onRefetch={onRefetch}
            forceStatusFilter="all"
          />
        </CardContent>
      </Card>
    </div>
  );
};
