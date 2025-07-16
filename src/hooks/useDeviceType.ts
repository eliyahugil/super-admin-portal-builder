import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceInfo {
  type: DeviceType;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  label: string;
  icon: string;
}

/**
 * Hook לזיהוי סוג מכשיר ומידע נוסף
 * 📱 Mobile: < 768px
 * 🖥️ Tablet: 768px - 1024px  
 * 💻 Desktop: > 1024px
 */
export function useDeviceType(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return {
      type: getDeviceType(width),
      width,
      height: typeof window !== 'undefined' ? window.innerHeight : 768,
      orientation: width > (typeof window !== 'undefined' ? window.innerHeight : 768) ? 'landscape' : 'portrait',
      touchSupported: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
      label: getDeviceLabel(getDeviceType(width)),
      icon: getDeviceIcon(getDeviceType(width))
    };
  });

  useEffect(() => {
    function updateDeviceInfo() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const type = getDeviceType(width);
      
      setDeviceInfo({
        type,
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
        touchSupported: 'ontouchstart' in window,
        label: getDeviceLabel(type),
        icon: getDeviceIcon(type)
      });
    }

    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // עדכון ראשוני
    updateDeviceInfo();

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

function getDeviceType(width: number): DeviceType {
  if (width < 768) {
    return 'mobile';
  } else if (width < 1024) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

function getDeviceLabel(type: DeviceType): string {
  switch (type) {
    case 'mobile':
      return 'נייד';
    case 'tablet':
      return 'טאבלט';
    case 'desktop':
      return 'מחשב';
    default:
      return 'לא ידוע';
  }
}

function getDeviceIcon(type: DeviceType): string {
  switch (type) {
    case 'mobile':
      return '📱';
    case 'tablet':
      return '📱';
    case 'desktop':
      return '💻';
    default:
      return '📟';
  }
}

/**
 * Hook פשוט לקבלת סוג המכשיר בלבד
 */
export function useSimpleDeviceType(): DeviceType {
  const { type } = useDeviceType();
  return type;
}