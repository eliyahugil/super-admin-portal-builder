
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ImportActionButtonsProps {
  onStartOver: () => void;
  onClose: () => void;
}

export const ImportActionButtons: React.FC<ImportActionButtonsProps> = ({
  onStartOver,
  onClose,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Button 
        variant="outline" 
        onClick={onStartOver} 
        className="flex items-center gap-2"
        size="lg"
      >
        <RefreshCw className="h-4 w-4" />
        ייבא קובץ נוסף
      </Button>
      
      <Button 
        onClick={onClose}
        size="lg"
        className="min-w-32"
      >
        סיום
      </Button>
    </div>
  );
};
