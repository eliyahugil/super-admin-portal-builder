
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImportButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ImportButton: React.FC<ImportButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Upload className="h-4 w-4" />
      ייבוא מקובץ Excel
    </Button>
  );
};
