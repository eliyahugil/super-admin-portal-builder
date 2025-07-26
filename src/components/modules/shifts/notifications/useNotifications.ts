import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useMobileNotifications } from '@/hooks/useMobileNotifications';

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
  const { showLocalNotification, isNative } = useMobileNotifications();

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
      // קריאה להגשות משמרות חדשות מטבלת shift_submissions
      const { data: shiftSubmissions, error } = await supabase
        .from('shift_submissions')
        .select(`
          id,
          week_start_date,
          week_end_date,
          shifts,
          notes,
          submitted_at,
          status,
          employees!inner(
            first_name,
            last_name,
            business_id
          )
        `)
        .eq('employees.business_id', profile.business_id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading shift submissions:', error);
        return;
      }

      // המרת הגשות משמרות להתראות
      const shiftNotifications: Notification[] = (shiftSubmissions || []).map(submission => {
        const shifts = Array.isArray(submission.shifts) ? submission.shifts : [];
        const shiftsCount = shifts.length;
        
        return {
          id: submission.id,
          type: 'shift_submission' as const,
          title: 'הגשת משמרות חדשה',
          message: `עובד הגיש ${shiftsCount} משמרות לשבוע`,
          employeeName: `${submission.employees.first_name} ${submission.employees.last_name}`,
          submissionTime: new Date(submission.submitted_at).toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          shiftDate: `${new Date(submission.week_start_date).toLocaleDateString('he-IL')} - ${new Date(submission.week_end_date).toLocaleDateString('he-IL')}`,
          shiftTime: `${shiftsCount} משמרות`,
          branchName: submission.notes || 'אין הערות',
          isRead: false,
          createdAt: submission.submitted_at
        };
      });

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
          table: 'shift_submissions'
        },
        (payload) => {
          console.log('New shift submission:', payload);
          
          // בדיקה שזה השגה שייכת לעסק הנוכחי
          if (payload.new?.business_id === profile.business_id || 
              (payload.new?.employee_id && payload.new?.employee_id)) {
            
            // אם זה אפליקציה native, הצג התראה native
            if (isNative) {
              showLocalNotification(
                'הגשת משמרות חדשה',
                'עובד הגיש משמרות לשבוע',
                { type: 'shift_submission', payload }
              );
            } else {
              // אחרת, נגן צליל התראה
              playNotificationSound();
            }
            
            // טעינה מחדש של ההתראות כשיש הגשה חדשה
            loadNotifications();
          }
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