
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle,
  XCircle
} from 'lucide-react';

interface ShiftApprovalStatsProps {
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export const ShiftApprovalStats: React.FC<ShiftApprovalStatsProps> = ({
  pendingRequests,
  approvedRequests,
  rejectedRequests
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">ממתין לאישור</p>
              <p className="text-2xl font-bold">{pendingRequests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">מאושר</p>
              <p className="text-2xl font-bold">{approvedRequests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">נדחה</p>
              <p className="text-2xl font-bold">{rejectedRequests}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
