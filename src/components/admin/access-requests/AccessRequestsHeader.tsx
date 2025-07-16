import React from 'react';
import { RefreshCw, Users, AlertTriangle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessRequestsHeaderProps {
  pendingCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AccessRequestsHeader: React.FC<AccessRequestsHeaderProps> = ({
  pendingCount = 0,
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול בקשות גישה מתקדם</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600 text-sm">
                סקור פרטי משתמשים, שייך לעסק או צור עסק חדש, ואשר בקשות גישה למערכת
              </p>
              {pendingCount > 0 && (
                <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {pendingCount} ממתינות לטיפול
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  מרענן...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  רענן
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};