
import React from 'react';
import { BusinessSelector } from '@/components/shared/BusinessSelector';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

export const BusinessSwitcher: React.FC = () => {
  const { isSuperAdmin, hasMultipleBusinesses, loading } = useCurrentBusiness();

  // הצג את בורר העסק אם:
  // 1. המשתמש הוא super admin (תמיד - כדי שיוכל לבחור בין מצב admin לעסק ספציפי)
  // 2. או שיש לו יותר מעסק אחד
  const shouldShowSelector = isSuperAdmin || hasMultipleBusinesses;

  if (loading || !shouldShowSelector) {
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <BusinessSelector
        placeholder="בחר מצב עבודה..."
        showAllOption={isSuperAdmin}
        className="w-full"
      />
    </div>
  );
};
