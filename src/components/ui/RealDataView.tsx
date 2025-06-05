
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Database } from 'lucide-react';

interface RealDataViewProps<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  loadingSkeletonCount?: number;
}

export function RealDataView<T>({
  data,
  loading,
  error,
  renderItem,
  emptyMessage = 'אין מידע להצגה כרגע',
  emptyIcon,
  className = '',
  loadingSkeletonCount = 3
}: RealDataViewProps<T>) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: loadingSkeletonCount }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">שגיאה בטעינת הנתונים</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        {emptyIcon || <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">אין נתונים</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {data.map(renderItem)}
    </div>
  );
}
