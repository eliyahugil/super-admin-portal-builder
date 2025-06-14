
import React from 'react';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardStats } from './dashboard/DashboardStats';
import { ManagementToolsSection } from './dashboard/ManagementToolsSection';
import { RecentActivityCard } from './dashboard/RecentActivityCard';
import { EmployeeRequestForm } from '@/components/modules/employees/EmployeeRequestForm';
import { EmployeeRequestsApproval } from '@/components/modules/employees/EmployeeRequestsApproval';
import { useDashboardData } from './dashboard/useDashboardData';
import { useBusinessModuleEnabled } from '@/hooks/useBusinessModuleEnabled';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Settings,
  Building,
  Clock,
  UserCheck
} from 'lucide-react';

export const BusinessDashboard: React.FC = () => {
  const {
    business,
    businessLoading,
    activeEmployees,
    shifts,
    todayAttendance,
    requests,
    userRole,
    isSuperAdmin,
    recentActivity
  } = useDashboardData();

  const { isModuleEnabled } = useBusinessModuleEnabled();
  const navigate = useNavigate();
  const isAdmin = userRole === 'business_admin' || isSuperAdmin;

  // Show welcome message based on role
  const getWelcomeMessage = () => {
    if (isSuperAdmin) {
      return 'שלום, מנהל ראשי';
    }
    if (userRole === 'business_admin') {
      return `שלום, מנהל עסק${business?.name ? ` - ${business.name}` : ''}`;
    }
    return `שלום${business?.name ? ` - ${business.name}` : ''}`;
  };

  // Enhanced stats with more detailed information
  const enhancedStats = [
    {
      title: 'עובדים פעילים',
      value: activeEmployees.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      path: '/modules/employees'
    },
    {
      title: 'נוכחות היום',
      value: todayAttendance.length,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      path: '/modules/employees/attendance',
      enabled: isModuleEnabled('employee_attendance')
    },
    {
      title: 'משמרות השבוע',
      value: shifts?.length || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      path: '/modules/shifts',
      enabled: isModuleEnabled('shift_management')
    },
    {
      title: 'בקשות פתוחות',
      value: requests?.length || 0,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      path: '/modules/employees/employee-requests',
      enabled: isModuleEnabled('employee_requests')
    }
  ];

  // Quick action buttons based on enabled modules
  const quickActions = [
    {
      title: 'ניהול עובדים',
      description: 'הוסף, ערוך וחפש עובדים',
      icon: Users,
      path: '/modules/employees',
      enabled: true
    },
    {
      title: 'ניהול סניפים',
      description: 'הגדר סניפים ומיקומים',
      icon: Building,
      path: '/modules/branches',
      enabled: isModuleEnabled('branch_management')
    },
    {
      title: 'משמרות וטוקנים',
      description: 'צפה במשמרות ושלח טוקנים',
      icon: Clock,
      path: '/modules/shifts',
      enabled: isModuleEnabled('shift_management')
    },
    {
      title: 'מסמכים',
      description: 'ניהול מסמכי עובדים',
      icon: FileText,
      path: '/modules/employees/employee-docs',
      enabled: isModuleEnabled('employee_documents')
    },
    {
      title: 'הגדרות מערכת',
      description: 'הגדרות עסק ומודולים',
      icon: Settings,
      path: '/modules/settings',
      enabled: true
    }
  ];

  if (businessLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6" dir="rtl">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  // If no business found for non-super-admin users
  if (!isSuperAdmin && !business?.id) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center" dir="rtl">
        <h2 className="text-xl font-semibold mb-4">לא נמצא עסק</h2>
        <p className="text-gray-600 mb-4">נראה שאתה לא משויך לשום עסק במערכת</p>
        <p className="text-sm text-gray-500">אנא פנה למנהל המערכת להוספת הרשאות</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      {/* Welcome Message */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{getWelcomeMessage()}</h1>
        {business?.name && !isSuperAdmin && (
          <p className="text-gray-600 mt-2">ברוך הבא לדשבורד ניהול העסק</p>
        )}
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {enhancedStats
          .filter(stat => stat.enabled !== false)
          .map((stat, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(stat.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="mr-4">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Quick Actions Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>פעולות מהירות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions
              .filter(action => action.enabled)
              .map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => navigate(action.path)}
                >
                  <div className="flex items-center space-x-2">
                    <action.icon className="h-5 w-5" />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 text-right">{action.description}</p>
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      <ManagementToolsSection />

      {/* Employee Requests Approval Section - Only for Admins */}
      {isAdmin && (
        <section className="mb-8">
          <EmployeeRequestsApproval />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityCard activities={recentActivity} />
        <EmployeeRequestForm employeeId={activeEmployees[0]?.id} />
      </div>
    </div>
  );
};
