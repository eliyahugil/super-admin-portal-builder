
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Bell, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';


interface SystemNotification {
  id: string;
  type: 'access_request' | 'system_alert';
  title: string;
  message: string;
  phone?: string;
  created_at: string;
  acknowledged: boolean;
}

export const SystemNotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [phoneCallEnabled, setPhoneCallEnabled] = useState(true);
  const { toast } = useToast();

  // Function to play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjuY3PLEeisELIzS8dWKOQgSaEbBNjZgodPcqV8cBjyZ2/LAbcQEK7zP8tyJNwgZaL3u55xPEAxPqOTwtmQcBjhR1vLNeSsFJJfH6t+PTwgOWqcvgG6EYnTBqs1wWmyCzYJAAgA');
      audio.volume = 0.3;
      audio.play().catch(console.error);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  // Function to make a phone call alert
  const makePhoneCall = async (phone: string, message: string) => {
    if (!phoneCallEnabled || !phone) return;

    try {
      console.log('📞 Attempting to make phone call alert:', phone);
      
      // In a real implementation, you would integrate with a service like Twilio
      // For now, we'll show a notification and optionally open WhatsApp
      toast({
        title: '📞 התראת טלפון',
        description: `ניסיון התקשרות ל${phone} - ${message}`,
        duration: 10000,
      });

      // Alternative: Open WhatsApp manually
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`🚨 התראת מערכת חשובה: ${message}\n\nאנא התחבר למערכת לטיפול בבקשה.`)}`, '_blank');

    } catch (error) {
      console.error('Failed to make phone call:', error);
      toast({
        title: 'שגיאה בהתקשרות',
        description: 'לא ניתן להתקשר כרגע',
        variant: 'destructive',
      });
    }
  };

  // Listen for new access requests
  useEffect(() => {
    const channel = supabase
      .channel(`access_requests_notifications_${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_access_requests'
        },
        async (payload) => {
          console.log('🔔 New access request received:', payload);
          
          // Get user details for the notification
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('email, full_name, phone')
            .eq('id', payload.new.user_id)
            .single();

          const notification: SystemNotification = {
            id: `access_request_${payload.new.id}`,
            type: 'access_request',
            title: 'בקשת גישה חדשה',
            message: `משתמש ${userProfile?.full_name || userProfile?.email || 'לא ידוע'} ביקש גישה למערכת`,
            phone: userProfile?.phone || undefined,
            created_at: new Date().toISOString(),
            acknowledged: false
          };

          setNotifications(prev => [notification, ...prev]);
          
          // Play notification sound
          playNotificationSound();
          
          // Show toast notification
          toast({
            title: '🔔 בקשת גישה חדשה!',
            description: notification.message,
            duration: 8000,
          });

          // Make phone call if enabled and phone number exists
          if (userProfile?.phone) {
            setTimeout(() => {
              makePhoneCall(userProfile.phone!, notification.message);
            }, 2000); // Delay phone call by 2 seconds
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [phoneCallEnabled, toast]);

  const acknowledgeNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, acknowledged: true }
          : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unacknowledgedCount = notifications.filter(n => !n.acknowledged).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          התראות מערכת
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive" className="mr-2">
              {unacknowledgedCount}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-sm">התראות טלפון:</span>
            <Button
              size="sm"
              variant={phoneCallEnabled ? "default" : "outline"}
              onClick={() => setPhoneCallEnabled(!phoneCallEnabled)}
            >
              {phoneCallEnabled ? "פעיל" : "כבוי"}
            </Button>
          </div>
          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearAllNotifications}
            >
              נקה הכל
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">אין התראות חדשות</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.acknowledged 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {notification.type === 'access_request' ? (
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Bell className="h-4 w-4 text-blue-500" />
                      )}
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.acknowledged && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          חדש
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        {new Date(notification.created_at).toLocaleString('he-IL')}
                      </span>
                      {notification.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {notification.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeNotification(notification.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      אשר
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
