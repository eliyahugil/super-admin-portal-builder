import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Archive, ArchiveRestore, Check } from 'lucide-react';
import { useBusinessData } from '@/hooks/useBusinessData';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { GenericArchiveButton } from './GenericArchiveButton';
import { useGenericArchive } from '@/hooks/useGenericArchive';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: archivedItems = [], isLoading, error, refetch } = useBusinessData({
    tableName,
    queryKey,
    filter: 'archived',
    selectedBusinessId: selectedBusinessId || businessId,
    select
  });

  const { restoreEntity } = useGenericArchive({
    tableName,
    entityName,
    queryKey,
    getEntityDisplayName: () => '',
    onSuccess: () => {
      refetch();
    }
  });

  // Toggle single item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Select/deselect all items
  const toggleSelectAll = () => {
    if (selectedItems.length === archivedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(archivedItems.map((item: any) => item.id));
    }
  };

  // Restore multiple selected items
  const restoreMultipleItems = async () => {
    if (selectedItems.length === 0) return;

    setIsRestoring(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Process each item individually
      for (const itemId of selectedItems) {
        try {
          const item = archivedItems.find((item: any) => item.id === itemId);
          if (item) {
            // Use Supabase directly to avoid hook complications
            const { error } = await supabase
              .from(tableName)
              .update({ is_archived: false })
              .eq('id', item.id);

            if (error) {
              console.error('Error restoring item:', error);
              errorCount++;
            } else {
              successCount++;
            }
          }
        } catch (error) {
          console.error('Error restoring item:', error);
          errorCount++;
        }
      }

      // Show appropriate message
      if (successCount > 0) {
        toast({
          title: "שחזור הושלם",
          description: `${successCount} ${entityNamePlural} שוחזרו בהצלחה${errorCount > 0 ? `, ${errorCount} נכשלו` : ''}`,
          variant: errorCount === 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "שגיאה בשחזור",
          description: "לא ניתן היה לשחזר אף פריט",
          variant: "destructive"
        });
      }

      setSelectedItems([]);
      await refetch();
    } catch (error) {
      console.error('Error in bulk restore:', error);
      toast({
        title: "שגיאה בשחזור",
        description: "אירעה שגיאה בשחזור הפריטים",
        variant: "destructive"
      });
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center" dir="rtl">
          <div className="text-red-500">
            <h3 className="text-lg font-medium mb-2">שגיאה בטעינת הנתונים</h3>
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {entityNamePlural} בארכיון ({archivedItems.length})
          </h3>
        </div>

        {/* Multi-select controls */}
        {archivedItems.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedItems.length === archivedItems.length}
                onCheckedChange={toggleSelectAll}
              />
              <label 
                htmlFor="select-all" 
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                בחר הכל ({selectedItems.length}/{archivedItems.length})
              </label>
            </div>

            {selectedItems.length > 0 && (
              <Button
                onClick={restoreMultipleItems}
                disabled={isRestoring}
                size="sm"
                className="flex items-center gap-2"
              >
                <ArchiveRestore className="h-4 w-4" />
                {isRestoring ? "משחזר..." : `שחזר נבחרים (${selectedItems.length})`}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Selected items summary */}
      {selectedItems.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  נבחרו {selectedItems.length} פריטים לשחזור
                </span>
              </div>
              <Button 
                onClick={() => setSelectedItems([])}
                variant="ghost" 
                size="sm"
                className="text-blue-700 hover:text-blue-900"
              >
                בטל בחירה
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {archivedItems.map((item: any) => (
          <Card 
            key={item.id} 
            className={`border-l-4 border-l-orange-400 transition-all ${
              selectedItems.includes(item.id) 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Selection checkbox */}
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                  />
                  
                  <div className="flex-1">
                    {renderEntityCard(item)}
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 mt-2">
                      בארכיון
                    </Badge>
                  </div>
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
                    onSuccess={() => {
                      refetch();
                      setSelectedItems(prev => prev.filter(id => id !== item.id));
                    }}
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
