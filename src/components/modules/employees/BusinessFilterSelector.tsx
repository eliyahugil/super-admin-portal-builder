
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { useBusinessesData } from '@/hooks/useRealData';

interface BusinessFilterSelectorProps {
  selectedBusinessId: string | null;
  onBusinessChange: (businessId: string | null) => void;
}

export const BusinessFilterSelector: React.FC<BusinessFilterSelectorProps> = ({
  selectedBusinessId,
  onBusinessChange,
}) => {
  const { isSuperAdmin } = useCurrentBusiness();
  const { data: businesses = [] } = useBusinessesData();

  // Only show this component for super admins
  if (!isSuperAdmin) {
    return null;
  }

  console.log('🏢 BusinessFilterSelector - Available businesses:', businesses.length);
  console.log('📋 Selected business ID:', selectedBusinessId);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          בחירת עסק לניהול
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedBusinessId || 'all'}
          onValueChange={(value) => onBusinessChange(value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="בחר עסק לניהול" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              כל העסקים ({businesses.length})
            </SelectItem>
            {businesses.map((business) => (
              <SelectItem key={business.id} value={business.id}>
                {business.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedBusinessId && (
          <div className="mt-2 text-sm text-gray-600">
            מציג עובדים מעסק: {businesses.find(b => b.id === selectedBusinessId)?.name || 'לא ידוע'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
