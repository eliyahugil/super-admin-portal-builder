
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { AccessRequest } from './types';
import { CollapsedAccessRequestCard } from './CollapsedAccessRequestCard';

interface PendingRequestsSectionProps {
  requests: AccessRequest[];
  onApprove: (requestId: string, assignmentData: any) => void;
  onReject: (requestId: string, reviewNotes: string) => void;
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
          בקשות ממתינות לאישור ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">אין בקשות ממתינות</h3>
            <p className="text-gray-600">כל הבקשות טופלו</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <CollapsedAccessRequestCard
                key={request.id}
                request={request}
                onApprove={onApprove}
                onReject={onReject}
                isLoading={isLoading}
                showActions={true}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
