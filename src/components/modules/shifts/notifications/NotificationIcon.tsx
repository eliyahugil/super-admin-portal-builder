import React from 'react';
import { NotificationsPanel } from './NotificationsPanel';
import { useAdvancedNotifications } from '@/hooks/useAdvancedNotifications';

export const NotificationIcon = () => {
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

  return (
    <NotificationsPanel 
      notifications={convertedNotifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDeleteNotification={handleDeleteNotification}
    />
  );
};