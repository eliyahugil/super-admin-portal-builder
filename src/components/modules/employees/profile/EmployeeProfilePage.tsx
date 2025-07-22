
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useEmployeeProfile } from './useEmployeeProfile';
import { EmployeeProfileHeader } from './EmployeeProfileHeader';
import { EmployeeProfileSidebar } from './EmployeeProfileSidebar';
import { EmployeeProfileTabs } from './EmployeeProfileTabs';

export const EmployeeProfilePage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { employee, loading, refetchEmployee } = useEmployeeProfile(employeeId);

  console.log('🏠 EmployeeProfilePage - State:', {
    employeeId,
    hasEmployee: !!employee,
    loading,
    employeeName: employee ? `${employee.first_name} ${employee.last_name}` : 'N/A',
    currentPath: window.location.pathname
  });

  const handleGoBack = () => {
    navigate('/modules/employees');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-4 sm:p-8">
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
                  <h3 className="text-base sm:text-lg font-medium text-foreground mt-4 mb-2">טוען פרטי עובד</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">אנא המתן...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-right">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">
                פרופיל עובד
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                העובד לא נמצא או שאין לך הרשאה לצפות בו
              </p>
            </div>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex items-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              חזרה לרשימת העובדים
            </Button>
          </div>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center py-6 sm:py-8">
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">העובד לא נמצא</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  העובד המבוקש לא נמצא במערכת או שאין לך הרשאה לצפות בו.
                </p>
                <div className="text-xs sm:text-sm text-muted-foreground mb-4">
                  <p>מזהה עובד: {employeeId || 'לא הוגדר'}</p>
                  <p>נתיב נוכחי: {window.location.pathname}</p>
                </div>
                <button
                  onClick={handleGoBack}
                  className="text-primary hover:text-primary/80 underline text-sm"
                >
                  חזרה לרשימת העובדים
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
      {/* DEBUG - בדיקה שהדף נטען */}
      <div style={{
        backgroundColor: 'green',
        color: 'white', 
        padding: '20px',
        margin: '10px',
        fontSize: '20px',
        fontWeight: 'bold',
        border: '5px solid yellow',
        textAlign: 'center'
      }}>
        DEBUG: דף פרופיל עובד נטען בהצלחה!
        <br/>
        עובד: {employee.first_name} {employee.last_name}
      </div>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-right">
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">
              פרופיל עובד - {employee.first_name} {employee.last_name}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              פרטי עובד מלאים עם כל הכרטיסיות והמידע
            </p>
          </div>
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לרשימת העובדים
          </Button>
        </div>

        {/* Main profile content */}
        <Card>
          <EmployeeProfileHeader
            employee={employee}
            onGoBack={handleGoBack}
            onEmployeeUpdated={refetchEmployee}
          />
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6" dir="rtl">
              <EmployeeProfileSidebar employee={employee} />
              <EmployeeProfileTabs employee={employee} employeeId={employeeId!} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
