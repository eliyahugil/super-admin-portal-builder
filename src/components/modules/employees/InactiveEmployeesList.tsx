import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Users, UserX } from 'lucide-react';
import { EmployeesList } from './EmployeesList';
import { useInactiveEmployees } from '@/hooks/useInactiveEmployees';
import { useEmployeeListPreferences } from '@/hooks/useEmployeeListPreferences';
import type { Employee } from '@/hooks/useEmployees';

interface InactiveEmployeesListProps {
  businessId: string;
  employees?: Employee[];
  onRefetch: () => void;
}

export const InactiveEmployeesList: React.FC<InactiveEmployeesListProps> = ({
  businessId,
  employees: propEmployees,
  onRefetch,
}) => {
  const { 
    data: inactiveEmployees = [], 
    isLoading, 
    error,
    refetch 
  } = useInactiveEmployees(businessId);

  const { updateFilters } = useEmployeeListPreferences(businessId);
  
  const employees = propEmployees || inactiveEmployees;

  // וידוא שהפילטר מוגדר להציג עובדים לא פעילים
  useEffect(() => {
    updateFilters({ status: 'inactive' });
  }, [updateFilters]);

  const handleRefetch = async () => {
    await refetch();
    onRefetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>שגיאה</AlertTitle>
            <AlertDescription>
              אירעה שגיאה בטעינת העובדים הלא פעילים. אנא נסה שוב.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            עובדים לא פעילים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">אין עובדים לא פעילים</h3>
            <p className="text-muted-foreground">
              כל העובדים שלך פעילים כרגע.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">עובדים לא פעילים שדורשים טיפול</AlertTitle>
        <AlertDescription className="text-orange-700">
          יש לך {employees.length} עובדים לא פעילים שעשויים לדרוש טיפול. 
          בדוק את הסטטוס שלהם ועדכן לפי הצורך.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            עובדים לא פעילים ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <EmployeesList
            businessId={businessId}
            employees={employees}
            onRefetch={handleRefetch}
          />
        </CardContent>
      </Card>
    </div>
  );
};