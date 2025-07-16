import React from 'react';
import { useDeviceType } from '@/hooks/useDeviceType';

interface DeviceIndicatorProps {
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

/**
 * Component לתצוגת אינדיקטור מכשיר במודולי עובדים
 */
export function DeviceIndicator({ 
  className = '', 
  showIcon = true, 
  showLabel = true 
}: DeviceIndicatorProps) {
  const device = useDeviceType();
  
  const deviceClass = `device-${device.type}`;
  
  return (
    <span className={`device-indicator ${deviceClass} ${className}`}>
      {showIcon && <span className="text-xs">{device.icon}</span>}
      {showLabel && <span>{device.label}</span>}
    </span>
  );
}