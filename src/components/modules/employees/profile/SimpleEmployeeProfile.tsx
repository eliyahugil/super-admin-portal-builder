import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Mail, Building, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  employee_type: string;
  hire_date?: string;
  business_id: string;
  employee_id?: string;
}

export const SimpleEmployeeProfile: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!employeeId) return;

      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', employeeId)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching employee:', error);
          setEmployee(null);
        } else {
          setEmployee(data);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleLogout = () => {
    localStorage.removeItem('employee_session');
    window.location.href = '/employee-login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <h3 className="text-lg font-medium text-foreground mt-4 mb-2">טוען פרטי עובד</h3>
              <p className="text-base text-muted-foreground">אנא המתן...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-6" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-foreground mb-2">העובד לא נמצא</h3>
                <p className="text-base text-muted-foreground mb-4">
                  העובד המבוקש לא נמצא במערכת.
                </p>
                <Button onClick={handleLogout} variant="outline">
                  חזרה להתחברות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-base text-muted-foreground mt-1">
              פרופיל עובד אישי
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            התנתק
          </Button>
        </div>

        {/* Main Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              פרטים אישיים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">שם מלא</p>
                    <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">טלפון</p>
                    <p className="font-medium">{employee.phone}</p>
                  </div>
                </div>

                {employee.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">דוא"ל</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">סוג עובד</p>
                    <p className="font-medium">{employee.employee_type}</p>
                  </div>
                </div>

                {employee.employee_id && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Building className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">מספר עובד</p>
                      <p className="font-medium">{employee.employee_id}</p>
                    </div>
                  </div>
                )}

                {employee.hire_date && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">תاריך התחלת עבודה</p>
                      <p className="font-medium">{new Date(employee.hire_date).toLocaleDateString('he-IL')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h3 className="text-2xl font-bold text-primary mb-4">ברוך הבא לפרופיל האישי שלך!</h3>
              <p className="text-lg text-muted-foreground">
                כאן תוכל לראות את כל הפרטים האישיים שלך במערכת
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};