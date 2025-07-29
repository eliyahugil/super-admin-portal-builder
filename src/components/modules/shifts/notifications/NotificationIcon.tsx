import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsPanel } from './NotificationsPanel';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';

export const NotificationIcon = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, acknowledgeNotification } = useAdvancedNotifications();

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

  const handleDeleteNotification = async (notificationId: string) => {
    await acknowledgeNotification(notificationId);
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
        navigate('/modules/employees');
        break;
      default:
        // For general notifications, stay on current page
        break;
    }
  };

  return (
    <NotificationsPanel 
      notifications={convertedNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDeleteNotification={handleDeleteNotification}
      onNotificationClick={handleNotificationClick}
    />
  );
};