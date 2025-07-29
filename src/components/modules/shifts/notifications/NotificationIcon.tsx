import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from './NotificationsPanel';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';

export const NotificationIcon = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead } = useAdvancedNotifications();

  // המרת התראות מתקדמות לפורמט של הפאנל הישן
  const convertedNotifications = notifications.map(notification => ({
    id: notification.id,
    type: notification.notification_type as 'shift_submission' | 'shift_approval' | 'shift_rejection' | 'employee_registration' | 'general',
    title: notification.title,
    message: notification.message,
    employeeName: notification.notification_type === 'employee_registration' ? 
      notification.message.match(/([א-ת\s]+)/)?.[1]?.trim() : 
      undefined,
    isRead: notification.is_read,
    createdAt: notification.created_at
  }));

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    for (const notification of notifications.filter(n => !n.is_read)) {
      await markAsRead(notification.id);
    }
  };

  const handleNotificationClick = (notification: any) => {
    switch (notification.type) {
      case 'shift_submission':
        navigate('/modules/shifts');
        break;
      case 'shift_approval':
      case 'shift_rejection':
        navigate('/modules/shifts');
        break;
      case 'employee_registration':
        // נווט לעמוד אישור עובדים חדשים
        navigate('/modules/employees/registration-requests');
        break;
      default:
        // For general notifications, stay on current page
        break;
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <NotificationsPanel 
      notifications={convertedNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onNotificationClick={handleNotificationClick}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    />
  );
};