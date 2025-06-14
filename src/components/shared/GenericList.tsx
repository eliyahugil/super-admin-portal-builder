
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useBusinessData } from '@/hooks/useBusinessData';

type AllowedTableNames = 'employees' | 'branches' | 'customers';
type FilterType = 'active' | 'archived' | 'deleted' | 'pending';

interface BaseEntity {
  id: string;
  [key: string]: any;
}

interface GenericListProps<T extends BaseEntity> {
  tableName: AllowedTableNames;
  queryKey: string[];
  filter: FilterType;
  renderItem: (item: T) => React.ReactNode;
  noDataMessage?: string;
  select?: string;
  statusField?: string;
  selectedBusinessId?: string | null;
  className?: string;
}

export function GenericList<T extends BaseEntity>({
  tableName,
  queryKey,
  filter,
  renderItem,
  noDataMessage = 'אין נתונים להצגה',
  select = '*',
  statusField = 'status',
  selectedBusinessId,
  className,
}: GenericListProps<T>) {
  const { data, isLoading, error } = useBusinessData<T>({
    tableName,
    queryKey,
    filter,
    selectedBusinessId,
    select,
    statusField,
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center" dir="rtl">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">טוען...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center" dir="rtl">
          <div className="text-red-500">
            <h3 className="text-lg font-medium mb-2">שגיאה בטעינת הנתונים</h3>
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center" dir="rtl">
          <div className="text-gray-500">
            <p>{noDataMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`} dir="rtl">
      {data.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
