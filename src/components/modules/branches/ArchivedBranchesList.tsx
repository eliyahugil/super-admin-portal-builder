
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users } from 'lucide-react';
import { GenericArchivedList } from '@/components/shared/GenericArchivedList';
import type { Branch } from '@/types/branch';

export const ArchivedBranchesList: React.FC = () => {
  const renderBranchCard = (branch: Branch) => {
    return (
      <>
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-gray-900">{branch.name}</h4>
          <Badge variant={branch.is_active ? 'default' : 'secondary'}>
            {branch.is_active ? 'פעיל' : 'לא פעיל'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {branch.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{branch.address}</span>
            </div>
          )}
          
          {branch.gps_radius && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>רדיוס: {branch.gps_radius}מ</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          נוצר: {new Date(branch.created_at || '').toLocaleDateString('he-IL')}
        </div>
      </>
    );
  };

  return (
    <GenericArchivedList<Branch>
      tableName="branches"
      entityName="הסניף"
      entityNamePlural="סניפים"
      queryKey={['branches']}
      getEntityDisplayName={(branch) => branch.name}
      renderEntityCard={renderBranchCard}
    />
  );
};
