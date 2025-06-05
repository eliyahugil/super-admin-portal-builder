
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_radius: number | null;
  is_active: boolean;
}

interface BranchesListProps {
  branches: Branch[];
  onRefetch: () => void;
}

export const BranchesList: React.FC<BranchesListProps> = ({ branches, onRefetch }) => {
  if (branches.length === 0) {
    return (
      <div className="text-center py-8">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">אין סניפים עדיין</p>
        <p className="text-sm text-gray-400">התחל על ידי הוספת הסניף הראשון</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {branches.map((branch) => (
        <div
          key={branch.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-medium text-gray-900">{branch.name}</h3>
              {!branch.is_active && (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  לא פעיל
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {branch.address && (
                <div>כתובת: {branch.address}</div>
              )}
              {branch.latitude && branch.longitude && (
                <div>
                  קואורדינטות: {branch.latitude.toFixed(6)}, {branch.longitude.toFixed(6)}
                </div>
              )}
              {branch.gps_radius && (
                <div>רדיוס GPS: {branch.gps_radius} מטר</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
