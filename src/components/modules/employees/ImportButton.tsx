
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
      size="lg"
      aria-label={loading ? 'מייבא עובדים...' : 'ייבוא עובדים מקובץ Excel'}
      aria-busy={loading}
      data-testid="import-employees-button"
    >
      <Upload className="h-5 w-5" aria-hidden="true" />
      {loading ? 'טוען...' : 'ייבוא עובדים מקובץ Excel'}
    </Button>
  );
};
