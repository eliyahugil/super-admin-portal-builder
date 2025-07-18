import React from 'react';
import { NotificationsPanel } from './NotificationsPanel';
import { useNotifications } from './useNotifications';

export const NotificationIcon = () => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <NotificationsPanel 
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onDeleteNotification={deleteNotification}
    />
  );
};