import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  UserPlus, 
  UserX, 
  User,
  Settings,
  Calendar,
  FileText,
  Shield,
  Building,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { useActivityLog, ActivityLogEntry } from '@/hooks/useActivityLog';

export const ActivityPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activities, isLoading } = useActivityLog();

  const getActivityIcon = (action: string, targetType: string) => {
    switch (action) {
      case 'create':
        if (targetType === 'employee') return <UserPlus className="h-4 w-4 text-green-600" />;
        if (targetType === 'business') return <Building className="h-4 w-4 text-blue-600" />;
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'update':
        if (targetType === 'employee') return <User className="h-4 w-4 text-orange-600" />;
        return <Settings className="h-4 w-4 text-orange-600" />;
      case 'delete':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'approve':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'reject':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'schedule':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'archive_employee_cleanup':
        return <UserX className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-50 border-l-green-500';
      case 'update':
        return 'bg-orange-50 border-l-orange-500';
      case 'delete':
        return 'bg-red-50 border-l-red-500';
      case 'approve':
        return 'bg-green-50 border-l-green-500';
      case 'reject':
        return 'bg-red-50 border-l-red-500';
      case 'schedule':
        return 'bg-purple-50 border-l-purple-500';
      default:
        return 'bg-gray-50 border-l-gray-500';
    }
  };

  const getActivityText = (activity: ActivityLogEntry) => {
    const { action, target_type, details } = activity;
    
    switch (action) {
      case 'create':
        if (target_type === 'employee') {
          const employeeName = details?.employee_name || 'עובד';
          return `נוצר עובד חדש: ${employeeName}`;
        }
        if (target_type === 'business') {
          const businessName = details?.business_name || 'עסק';
          return `נוצר עסק חדש: ${businessName}`;
        }
        return `נוצר ${target_type} חדש`;
      case 'update':
        if (target_type === 'employee') {
          const employeeName = details?.employee_name || 'עובד';
          return `עודכן עובד: ${employeeName}`;
        }
        return `עודכן ${target_type}`;
      case 'delete':
        if (target_type === 'employee') {
          const employeeName = details?.employee_name || 'עובד';
          return `נמחק עובד: ${employeeName}`;
        }
        return `נמחק ${target_type}`;
      case 'approve':
        return `אושר ${target_type}`;
      case 'reject':
        return `נדחה ${target_type}`;
      case 'schedule':
        return `נוצרה משמרת חדשה`;
      case 'archive_employee_cleanup':
        const employeeName = details?.employee_name || 'עובד';
        return `עובד הועבר לארכיון: ${employeeName}`;
      default:
        return `פעולה: ${action} על ${target_type}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: he 
      });
    } catch {
      return 'זמן לא ידוע';
    }
  };

  const recentActivities = activities.slice(0, 20); // הצגת 20 הפעילויות האחרונות

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-gray-100 transition-colors"
        >
          <Activity className="h-5 w-5" />
          {recentActivities.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-blue-500 text-white border-white"
            >
              {recentActivities.length > 9 ? '9+' : recentActivities.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0 bg-white border shadow-lg" align="end" dir="rtl">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                פעילות אחרונה
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                  {recentActivities.length} פעולות
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p className="text-sm">טוען פעילויות...</p>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">אין פעילויות להצגה</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 border-b hover:bg-gray-50 transition-colors border-l-4 ${
                        getActivityColor(activity.action)
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getActivityIcon(activity.action, activity.target_type)}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {getActivityText(activity)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(activity.created_at)}
                            </span>
                          </div>
                          
                          {activity.details && Object.keys(activity.details).length > 0 && (
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                              {JSON.stringify(activity.details, null, 2).slice(0, 100)}
                              {JSON.stringify(activity.details).length > 100 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};