
import React from 'react';
import { BusinessSelector } from '@/components/shared/BusinessSelector';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useQueryClient } from '@tanstack/react-query';

export const BusinessSwitcher: React.FC = () => {
  const { isSuperAdmin, hasMultipleBusinesses, loading } = useCurrentBusiness();
  const queryClient = useQueryClient();

  // הצג את בורר העסק אם:
  // 1. המשתמש הוא super admin (תמיד - כדי שיוכל לבחור בין מצב admin לעסק ספציפי)
  // 2. או שיש לו יותר מעסק אחד
  const shouldShowSelector = isSuperAdmin || hasMultipleBusinesses;

  if (loading || !shouldShowSelector) {
    return null;
  }

  const handleBusinessChanged = () => {
    // Invalidate all queries immediately to reflect the new business context (≤300ms)
    try {
      queryClient.cancelQueries();
      queryClient.invalidateQueries({ predicate: () => true, refetchType: 'all' });
    } catch (e) {
      console.warn('Failed to invalidate queries on business change', e);
    }
  };

  return (
    <div className="w-full max-w-md">
      <BusinessSelector
        placeholder="בחר מצב עבודה..."
        showAllOption={isSuperAdmin}
        className="w-full"
        onChange={handleBusinessChanged}
      />
    </div>
  );
};
