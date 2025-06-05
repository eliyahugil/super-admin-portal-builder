
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleEmptyStateProps {
  searchTerm: string;
  onCreateModule: () => void;
  onCreateCustomModule: () => void;
}

export const ModuleEmptyState: React.FC<ModuleEmptyStateProps> = ({
  searchTerm,
  onCreateModule,
  onCreateCustomModule,
}) => {
  const navigate = useNavigate();

  const navigateToEmployees = () => {
    navigate('/modules/employees');
  };

  return (
    <div className="text-center py-12">
      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchTerm ? 'לא נמצאו מודלים' : 'אין מודלים'}
      </h3>
      <p className="text-gray-600 mb-4">
        {searchTerm 
          ? 'נסה לשנות את מונחי החיפוש' 
          : 'התחל על ידי יצירת המודל הראשון או השתמש במודלים הקיימים'
        }
      </p>
      {!searchTerm && (
        <div className="flex gap-2 justify-center flex-wrap">
          <Button onClick={navigateToEmployees} variant="default">
            ניהול עובדים וסניפים
          </Button>
          <Button onClick={onCreateCustomModule} variant="outline">
            צור מודל מותאם אישית
          </Button>
          <Button onClick={onCreateModule} variant="outline">
            צור מודל רגיל
          </Button>
        </div>
      )}
    </div>
  );
};
