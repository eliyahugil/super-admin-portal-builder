import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'shift_submission' | 'shift_approval' | 'shift_rejection' | 'general';
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

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // טעינת התראות דמה - יש להחליף בקריאה אמיתית לשרת
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'shift_submission',
        title: 'הגשת משמרת חדשה',
        message: 'עובד הגיש בקשה למשמרת ביום ראשון',
        employeeName: 'דוד כהן',
        submissionTime: '14:30',
        shiftDate: '2024-01-15',
        shiftTime: '08:00-16:00',
        branchName: 'סניף מרכז',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // לפני 30 דקות
      },
      {
        id: '2',
        type: 'shift_submission',
        title: 'הגשת משמרת נוספת',
        message: 'עובדת הגישה בקשה למשמרת ערב',
        employeeName: 'שרה לוי',
        submissionTime: '13:15',
        shiftDate: '2024-01-16',
        shiftTime: '16:00-00:00',
        branchName: 'סניף צפון',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // לפני שעתיים
      },
      {
        id: '3',
        type: 'shift_approval',
        title: 'משמרת אושרה',
        message: 'משמרת של עובד אושרה למחר',
        employeeName: 'מיכל רוזן',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // לפני יום
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  };

  const addShiftSubmissionNotification = (
    employeeName: string,
    shiftDate: string,
    shiftTime: string,
    branchName?: string
  ) => {
    addNotification({
      type: 'shift_submission',
      title: 'הגשת משמרת חדשה',
      message: `${employeeName} הגיש בקשה למשמרת`,
      employeeName,
      shiftDate,
      shiftTime,
      branchName,
      submissionTime: new Date().toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isRead: false
    });
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addShiftSubmissionNotification
  };
};