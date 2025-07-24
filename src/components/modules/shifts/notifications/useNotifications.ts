import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

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
  const { profile } = useAuth();

  // פונקציה לנגינת צליל התראה
  const playNotificationSound = () => {
    try {
      // יצירת צליל התראה באמצעות Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // תדירות הצליל
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  // טעינת התראות אמיתיות מהמסד
  const loadNotifications = async () => {
    if (!profile?.business_id) return;

    try {
      // קריאה להגשות משמרות חדשות שעדיין לא נקראו
      const { data: shiftRequests, error } = await supabase
        .from('employee_shift_requests')
        .select(`
          id,
          shift_date,
          start_time,
          end_time,
          created_at,
          status,
          notes,
          branch_preference,
          employees!inner(
            first_name,
            last_name,
            business_id
          )
        `)
        .eq('employees.business_id', profile.business_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading shift requests:', error);
        return;
      }

      // המרת בקשות משמרות להתראות
      const shiftNotifications: Notification[] = (shiftRequests || []).map(request => ({
        id: request.id,
        type: 'shift_submission' as const,
        title: 'הגשת משמרת חדשה',
        message: `עובד הגיש בקשה למשמרת`,
        employeeName: `${request.employees.first_name} ${request.employees.last_name}`,
        submissionTime: new Date(request.created_at).toLocaleTimeString('he-IL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        shiftDate: new Date(request.shift_date).toLocaleDateString('he-IL'),
        shiftTime: `${request.start_time}-${request.end_time}`,
        branchName: request.branch_preference || 'לא צוין',
        isRead: false,
        createdAt: request.created_at
      }));

      setNotifications(shiftNotifications);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // הגדרת real-time subscription להתראות חדשות
    if (!profile?.business_id) return;
    
    const channel = supabase
      .channel(`shift-submissions-${profile.business_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employee_shift_requests',
          filter: `employees.business_id=eq.${profile.business_id}`
        },
        (payload) => {
          console.log('New shift submission:', payload);
          // נגינת צליל התראה
          playNotificationSound();
          // טעינה מחדש של ההתראות כשיש הגשה חדשה
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.business_id]);

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