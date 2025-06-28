
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImportButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ImportButton: React.FC<ImportButtonProps> = ({ 
  onClick, 
  disabled = false,
  loading = false 
}) => {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
      size="lg"
    >
      <Upload className="h-5 w-5" />
      {loading ? 'טוען...' : 'ייבוא עובדים מקובץ Excel'}
    </Button>
  );
};
