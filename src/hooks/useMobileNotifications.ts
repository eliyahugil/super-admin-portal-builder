import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

export const useMobileNotifications = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const isNativeApp = Capacitor.isNativePlatform();
    setIsNative(isNativeApp);

    if (isNativeApp) {
      initializeNotifications();
    }
  }, []);

  const initializeNotifications = async () => {
    try {
      // בקשת הרשאות להתראות מקומיות
      const localPermission = await LocalNotifications.requestPermissions();
      
      // בקשת הרשאות ל-push notifications
      const pushPermission = await PushNotifications.requestPermissions();
      
      if (localPermission.display === 'granted' || pushPermission.receive === 'granted') {
        setHasPermission(true);
        
        // הגדרת listeners ל-push notifications
        await PushNotifications.addListener('registration', token => {
          console.log('Push registration success, token: ' + token.value);
        });

        await PushNotifications.addListener('registrationError', err => {
          console.error('Registration error: ', err.error);
        });

        await PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Push notification received: ', notification);
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });

        // רישום לקבלת push notifications
        await PushNotifications.register();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const showLocalNotification = async (title: string, body: string, data?: any) => {
    if (!isNative || !hasPermission) {
      return false;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            extra: data,
            schedule: { at: new Date(Date.now() + 1000) }, // תציג בעוד שנייה
          }
        ]
      });
      return true;
    } catch (error) {
      console.error('Error showing local notification:', error);
      return false;
    }
  };

  return {
    hasPermission,
    isNative,
    showLocalNotification,
    initializeNotifications
  };
};