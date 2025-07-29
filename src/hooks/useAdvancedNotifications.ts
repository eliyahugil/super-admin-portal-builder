import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';
import { useBusinessId } from './useBusinessId';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export interface AdvancedNotification {
  id: string;
  business_id: string;
  user_id: string;
  employee_id?: string;
  branch_id?: string;
  notification_type: string;
  notification_category: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  metadata: any;
  requires_action: boolean;
  action_deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  business_id: string;
  user_id: string;
  setting_type: string;
  setting_key: string;
  is_enabled: boolean;
  threshold_value?: number;
  threshold_unit?: string;
  sound_enabled: boolean;
  mobile_enabled: boolean;
  email_enabled: boolean;
}

export const useAdvancedNotifications = () => {
  const [notifications, setNotifications] = useState<AdvancedNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user } = useAuth();
  const businessId = useBusinessId();

  // מעקב אחר מצב רשת
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // הגדרות ההתראות המקומיות
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.requestPermissions().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  // פונקציה להשמעת צליל התראה
  const playNotificationSound = useCallback((soundType: 'info' | 'warning' | 'error' | 'critical' = 'info') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // תדירויות שונות לסוגי התראה שונים
      const frequencies = {
        info: 800,
        warning: 1000,
        error: 600,
        critical: 400
      };
      
      oscillator.frequency.value = frequencies[soundType];
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }, []);

  // פונקציה להצגת התראה native
  const showNativeNotification = useCallback(async (notification: AdvancedNotification) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: parseInt(notification.id.slice(-8), 16), // המרת UUID לנמבר
            title: notification.title,
            body: notification.message,
            sound: notification.severity === 'critical' ? 'beep.wav' : undefined,
            actionTypeId: notification.requires_action ? 'action_required' : undefined,
            extra: {
              notificationId: notification.id,
              category: notification.notification_category,
              severity: notification.severity
            }
          }
        ]
      });
    } catch (error) {
      console.error('Failed to show native notification:', error);
    }
  }, []);

  // טעינת התראות מהמסד
  const loadNotifications = useCallback(async () => {
    if (!businessId || !user) return;

    try {
      // בנייה דינמית של השאילתה בהתאם לתפקיד המשתמש
      let query = supabase
        .from('advanced_notifications')
        .select('*')
        .eq('business_id', businessId);

      // אם לא סופר אדמין, הוסף פילטר למשתמש ספציפי
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'super_admin') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error in loadNotifications:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId, user]);

  // טעינת הגדרות התראות
  const loadSettings = useCallback(async () => {
    if (!businessId || !user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('business_id', businessId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading notification settings:', error);
        return;
      }

      setSettings(data || []);
    } catch (error) {
      console.error('Error in loadSettings:', error);
    }
  }, [businessId, user]);

  // עדכון הגדרות התראה
  const updateSetting = useCallback(async (
    settingType: string,
    settingKey: string,
    updates: Partial<NotificationSettings>
  ) => {
    if (!businessId || !user) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          business_id: businessId,
          user_id: user.id,
          setting_type: settingType,
          setting_key: settingKey,
          ...updates
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating notification setting:', error);
        toast.error('שגיאה בעדכון הגדרות ההתראות');
        return;
      }

      // עדכון הגדרות מקומיות
      setSettings(prev => {
        const index = prev.findIndex(s => 
          s.setting_type === settingType && s.setting_key === settingKey
        );
        if (index >= 0) {
          return [...prev.slice(0, index), data, ...prev.slice(index + 1)];
        } else {
          return [...prev, data];
        }
      });

      toast.success('הגדרות ההתראות עודכנו בהצלחה');
    } catch (error) {
      console.error('Error in updateSetting:', error);
    }
  }, [businessId, user]);

  // סימון התראה כנקראה
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('advanced_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error in markAsRead:', error);
    }
  }, []);

  // אישור התראה
  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('advanced_notifications')
        .update({ 
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: user.id
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error acknowledging notification:', error);
        return;
      }

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { 
            ...n, 
            is_acknowledged: true,
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: user.id
          } : n
        )
      );

      toast.success('התראה אושרה');
    } catch (error) {
      console.error('Error in acknowledgeNotification:', error);
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!businessId || !user) return;

    loadNotifications();
    loadSettings();

    // בדיקת תפקיד המשתמש לפילטר realtime
    const checkUserRoleAndSubscribe = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isSuper = profile?.role === 'super_admin';
      
      // בניית פילטר בהתאם לתפקיד
      const filter = isSuper 
        ? `business_id=eq.${businessId}`
        : `business_id=eq.${businessId} AND user_id=eq.${user.id}`;

      const channel = supabase
        .channel(`advanced-notifications-${businessId}-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'advanced_notifications',
            filter: filter
          },
          async (payload) => {
            const newNotification = payload.new as AdvancedNotification;
            
            setNotifications(prev => [newNotification, ...prev]);
            
            // הצגת התראה visual
            toast[newNotification.severity === 'critical' ? 'error' : 'info'](
              newNotification.title,
              { description: newNotification.message }
            );

            // השמעת צליל
            const setting = settings.find(s => 
              s.setting_type === newNotification.notification_category && 
              s.sound_enabled
            );
            if (setting?.sound_enabled !== false) {
              playNotificationSound(newNotification.severity as 'info' | 'warning' | 'error' | 'critical');
            }

            // התראה native במובייל
            if (Capacitor.isNativePlatform()) {
              await showNativeNotification(newNotification);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = checkUserRoleAndSubscribe();
    
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [businessId, user, loadNotifications, loadSettings, playNotificationSound, showNativeNotification, settings]);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const unacknowledgedCount = notifications.filter(n => !n.is_acknowledged && n.requires_action).length;

  return {
    notifications,
    settings,
    loading,
    isOnline,
    unreadCount,
    unacknowledgedCount,
    updateSetting,
    markAsRead,
    acknowledgeNotification,
    playNotificationSound,
    showNativeNotification
  };
};