
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Building2 } from 'lucide-react';
import { AccessRequest } from './types';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';

interface PendingRequestCardProps {
  request: AccessRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading: boolean;
}

export const PendingRequestCard: React.FC<PendingRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading
}) => {
  return (
    <Card className="border-l-4 border-l-yellow-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              {request.profiles?.full_name || request.profiles?.email || 'משתמש לא מזוהה'}
            </h3>
            <p className="text-sm text-gray-600">{request.profiles?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {request.businesses?.name || 'עסק לא מזוהה'}
              </span>
            </div>
          </div>
          <AccessRequestStatusBadge status={request.status} />
        </div>
        
        {request.request_reason && (
          <div className="mb-4">
            <h4 className="font-medium mb-1">סיבת הבקשה:</h4>
            <p className="text-gray-700 text-sm">{request.request_reason}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mb-4">
          נשלח ב: {new Date(request.created_at).toLocaleDateString('he-IL')}
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onApprove(request.id)}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-4 w-4" />
            אשר
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(request.id)}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <XCircle className="h-4 w-4" />
            דחה
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
