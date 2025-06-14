
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive } from 'lucide-react';
import { useArchivedData } from '@/hooks/useArchivedData';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { GenericArchiveButton } from './GenericArchiveButton';

type AllowedTableNames = 'employees' | 'branches' | 'customers';

interface GenericArchivedListProps {
  tableName: AllowedTableNames;
  entityName: string;
  entityNamePlural: string;
  queryKey: string[];
  getEntityDisplayName: (entity: any) => string;
  renderEntityCard: (entity: any) => React.ReactNode;
  selectedBusinessId?: string | null;
  select?: string;
}

export const GenericArchivedList: React.FC<GenericArchivedListProps> = ({
  tableName,
  entityName,
  entityNamePlural,
  queryKey,
  getEntityDisplayName,
  renderEntityCard,
  selectedBusinessId,
  select
}) => {
  const { businessId } = useCurrentBusiness();
  const { data: archivedResult, isLoading } = useArchivedData({
    tableName,
    queryKey,
    selectedBusinessId: selectedBusinessId || businessId,
    select
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Handle error case
  if (archivedResult && !archivedResult.success) {
    return (
      <Card>
        <CardContent className="py-8 text-center" dir="rtl">
          <div className="text-red-500">
            <h3 className="text-lg font-medium mb-2">שגיאה בטעינת הנתונים</h3>
            <p>{archivedResult.error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const archivedItems = archivedResult?.success ? archivedResult.data : [];

  if (archivedItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center" dir="rtl">
          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">אין {entityNamePlural} בארכיון</h3>
            <p>{entityNamePlural} שיועברו לארכיון יופיעו כאן</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-2 mb-4">
        <Archive className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          {entityNamePlural} בארכיון ({archivedItems.length})
        </h3>
      </div>

      <div className="grid gap-4">
        {archivedItems.map((item: any) => (
          <Card key={item.id} className="border-l-4 border-l-orange-400">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {renderEntityCard(item)}
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 mt-2">
                    בארכיון
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <GenericArchiveButton
                    entity={item}
                    tableName={tableName}
                    entityName={entityName}
                    queryKey={queryKey}
                    getEntityDisplayName={getEntityDisplayName}
                    isArchived={true}
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
