
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, CheckSquare, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useAuth } from '@/components/auth/AuthContext';
import { useProjectsData } from './hooks/useProjectsData';

export const ProjectsManagement: React.FC = () => {
  const { isSuperAdmin, businessId } = useCurrentBusiness();
  const { profile } = useAuth();
  const { data: projectsData = [], isLoading } = useProjectsData(businessId);

  console.log('🎯 ProjectsManagement - Current state:', {
    businessId,
    isSuperAdmin,
    userRole: profile?.role,
    dataCount: projectsData.length
  });

  // Calculate real statistics from data
  const activeProjects = projectsData.filter(p => p.status === 'active').length;
  const onTimeProjects = projectsData.filter(p => p.progress_percentage >= 50 && p.status === 'active').length;

  const stats = [
    { label: 'פרויקטים פעילים', value: activeProjects.toString(), icon: Target, color: 'text-blue-600' },
    { label: 'משימות פתוחות', value: '0', icon: CheckSquare, color: 'text-orange-600' },
    { label: 'תוך לוח זמנים', value: onTimeProjects.toString(), icon: Calendar, color: 'text-green-600' },
    { label: 'סה"כ פרויקטים', value: projectsData.length.toString(), icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול פרויקטים</h1>
        <p className="text-gray-600 mt-2">עקוב ונהל פרויקטים ומשימות</p>
      </div>

      {/* Show content only if business is selected (for super admin) or user has business context */}
      {(businessId || !isSuperAdmin) && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Projects List */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>פרויקטים</CardTitle>
                  <CardDescription>רשימת הפרויקטים</CardDescription>
                </div>
                <Button variant="outline">
                  הוסף פרויקט
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">טוען נתונים...</div>
              ) : projectsData.length > 0 ? (
                <div className="space-y-4">
                  {projectsData.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{project.project_name}</p>
                          <p className="text-sm text-gray-500">{project.description || 'אין תיאור'}</p>
                          <p className="text-sm text-gray-500">
                            סטטוס: {project.status === 'active' ? 'פעיל' : 
                                   project.status === 'completed' ? 'הושלם' : 
                                   project.status === 'on_hold' ? 'בהמתנה' : 'בוטל'}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">התקדמות: {project.progress_percentage}%</div>
                        {project.budget && (
                          <div className="text-sm text-gray-500">
                            תקציב: ₪{project.budget.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  אין פרויקטים עדיין
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Show business selection prompt for super admin */}
      {isSuperAdmin && !businessId && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">בחר עסק לניהול פרויקטים</h2>
          <p className="text-gray-600">יש לבחור עסק ספציפי כדי לצפות בנתוני הפרויקטים</p>
        </div>
      )}
    </div>
  );
};
