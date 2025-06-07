
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { AccessRequest } from './types';
import { PendingRequestCard } from './PendingRequestCard';

interface PendingRequestsSectionProps {
  requests: AccessRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading: boolean;
}

export const PendingRequestsSection: React.FC<PendingRequestsSectionProps> = ({
  requests,
  onApprove,
  onReject,
  isLoading
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          בקשות ממתינות ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות ממתינות</h3>
            <p className="text-gray-600">כל הבקשות טופלו</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <PendingRequestCard
                key={request.id}
                request={request}
                onApprove={onApprove}
                onReject={onReject}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
