
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface BusinessIntegration {
  id: string;
  integration_name: string;
  display_name: string;
  is_active: boolean;
  last_sync: string | null;
  created_at: string;
  credentials: Record<string, any>;
  config: Record<string, any>;
}

interface IntegrationActionsProps {
  businessIntegration?: BusinessIntegration;
  onDelete?: (integrationId: string) => void;
  isLoading?: boolean;
}

export const IntegrationActions: React.FC<IntegrationActionsProps> = ({
  businessIntegration,
  onDelete,
  isLoading = false,
}) => {
  const handleDelete = () => {
    if (businessIntegration && onDelete) {
      if (confirm(`האם אתה בטוח שברצונך למחוק את האינטגרציה "${businessIntegration.display_name}"?`)) {
        onDelete(businessIntegration.id);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center pt-4">
        {businessIntegration && onDelete && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {businessIntegration?.last_sync && (
        <div className="text-sm text-gray-500 pt-2 border-t">
          סונכרן לאחרונה: {new Date(businessIntegration.last_sync).toLocaleDateString('he-IL')}
        </div>
      )}
    </div>
  );
};
