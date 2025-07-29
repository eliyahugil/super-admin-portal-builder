import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Clock, User, MapPin, Calendar, CheckCircle, X, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'shift_submission' | 'shift_approval' | 'shift_rejection' | 'employee_registration' | 'general';
  title: string;
  message: string;
  employeeName?: string;
  submissionTime?: string;
  shiftDate?: string;
  shiftTime?: string;
  branchName?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shift_submission':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'shift_approval':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shift_rejection':
        return <X className="h-4 w-4 text-red-600" />;
      case 'employee_registration':
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseClasses = isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-l-4';
    
    switch (type) {
      case 'shift_submission':
        return `${baseClasses} ${!isRead ? 'border-l-blue-500' : ''}`;
      case 'shift_approval':
        return `${baseClasses} ${!isRead ? 'border-l-green-500' : ''}`;
      case 'shift_rejection':
        return `${baseClasses} ${!isRead ? 'border-l-red-500' : ''}`;
      case 'employee_registration':
        return `${baseClasses} ${!isRead ? 'border-l-purple-500' : ''}`;
      default:
        return `${baseClasses} ${!isRead ? 'border-l-gray-500' : ''}`;
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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-gray-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white border-white animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0 bg-white border shadow-lg" align="end" dir="rtl">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                התראות
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-300">
                    {unreadCount} חדשות
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-700 text-xs"
                >
                  סמן הכל כנקרא
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">אין התראות חדשות</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                        getNotificationColor(notification.type, notification.isRead)
                      }`}
                      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${
                                notification.isRead ? 'text-gray-600' : 'text-gray-900'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            <p className={`text-xs ${
                              notification.isRead ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            
                            {/* פרטי הגשת המשמרת */}
                            {notification.type === 'shift_submission' && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {notification.employeeName && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    <User className="h-3 w-3 ml-1" />
                                    {notification.employeeName}
                                  </Badge>
                                )}
                                {notification.shiftTime && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    <Clock className="h-3 w-3 ml-1" />
                                    {notification.shiftTime}
                                  </Badge>
                                )}
                                {notification.branchName && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    <MapPin className="h-3 w-3 ml-1" />
                                    {notification.branchName}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* פרטי רישום עובד */}
                            {notification.type === 'employee_registration' && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                  <UserPlus className="h-3 w-3 ml-1" />
                                  רישום עובד חדש
                                </Badge>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
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