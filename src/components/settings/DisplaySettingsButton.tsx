import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { UserDisplaySettings } from './UserDisplaySettings';

interface DisplaySettingsButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export const DisplaySettingsButton: React.FC<DisplaySettingsButtonProps> = ({
  variant = 'ghost',
  size = 'sm',
  className = '',
  showLabel = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <Settings className="h-4 w-4" />
        {showLabel && <span className="mr-2">הגדרות תצוגה</span>}
      </Button>
      
      <UserDisplaySettings open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};