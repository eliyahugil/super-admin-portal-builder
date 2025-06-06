
import React from 'react';
import { useShiftSubmissions } from './hooks/useShiftSubmissions';
import { ShiftStatsCards } from './dashboard/ShiftStatsCards';
import { ShiftSearch } from './dashboard/ShiftSearch';
import { SendReminderButton } from './dashboard/SendReminderButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, Eye, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusiness } from '@/hooks/useBusiness';

export const ShiftSubmissionsDashboard: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    dashboardData,
    isLoading,
    sendReminder,
    refetch
  } = useShiftSubmissions();

  const { business } = useBusiness();
  const { settings } = useBusinessSettings(business?.id);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8" dir="rtl">טוען...</div>;
  }

  const submittedCount = dashboardData.filter(emp => emp.hasSubmitted).length;
  const pendingCount = dashboardData.filter(emp => !emp.hasSubmitted).length;

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">דשבורד הגשות משמרות</h1>
        <p className="text-gray-600">מעקב אחר הגשות משמרות שבועיות מעובדים</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Badge className="bg-green-500 text-white">✓</Badge>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">הוגשו</p>
                <p className="text-2xl font-bold text-green-600">{submittedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Badge className="bg-orange-500 text-white">⏳</Badge>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">ממתינים</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Badge className="bg-blue-500 text-white">👥</Badge>
              </div>
              <div className="mr-4">
                <p className="text-sm font-medium text-gray-600">סה"כ עובדים</p>
                <p className="text-2xl font-bold text-blue-600">{dashboardData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminder Settings Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            הגדרות תזכורות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {settings?.auto_shift_reminders ? (
                <div className="text-green-600">
                  <p className="font-medium">תזכורות אוטומטיות פעילות</p>
                  <p className="text-sm text-gray-600">
                    תזכורות נשלחות בכל יום {settings.reminder_day} בשעה {settings.reminder_hour.toString().padStart(2, '0')}:00
                  </p>
                </div>
              ) : (
                <div className="text-orange-600">
                  <p className="font-medium">תזכורות אוטומטיות כבויות</p>
                  <p className="text-sm text-gray-600">
                    ניתן לשלוח תזכורות ידנית או להפעיל תזכורות אוטומטיות בהגדרות
                  </p>
                </div>
              )}
            </div>
            <Link to="/modules/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                הגדרות
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <ShiftSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>רשימת עובדים - הגשות שבוע נוכחי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-4">עובד</th>
                  <th className="text-right p-4">מספר עובד</th>
                  <th className="text-right p-4">סטטוס</th>
                  <th className="text-right p-4">תאריך הגשה</th>
                  <th className="text-right p-4">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </div>
                        {employee.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-600">{employee.employee_id || '—'}</span>
                    </td>
                    <td className="p-4">
                      {employee.hasSubmitted ? (
                        <Badge className="bg-green-100 text-green-800">הוגש</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">ממתין</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {employee.submissionDate ? (
                        <span className="text-sm">
                          {new Date(employee.submissionDate).toLocaleDateString('he-IL')}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!employee.hasSubmitted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendReminder(employee)}
                            className="flex items-center gap-1"
                          >
                            <MessageCircle className="h-3 w-3" />
                            שלח תזכורת
                          </Button>
                        )}
                        {employee.hasSubmitted && employee.submissionId && (
                          <Link to={`/modules/shifts/submission/${employee.submissionId}`}>
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              צפייה
                            </Button>
                          </Link>
                        )}
                        <Link to={`/modules/employees/profile/${employee.id}`}>
                          <Button size="sm" variant="ghost">
                            פרופיל
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {dashboardData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              לא נמצאו עובדים
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
