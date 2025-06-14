
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { AccessRequest } from './types';

interface AccessRequestsStatsProps {
  requests: AccessRequest[];
}

export const AccessRequestsStats: React.FC<AccessRequestsStatsProps> = ({ requests }) => {
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-gray-600">בקשות ממתינות</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-gray-600">בקשות אושרו</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              <p className="text-sm text-gray-600">בקשות נדחו</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
