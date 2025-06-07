
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessRequest } from './types';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';

interface ProcessedRequestsListProps {
  requests: AccessRequest[];
}

export const ProcessedRequestsList: React.FC<ProcessedRequestsListProps> = ({ requests }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>בקשות שטופלו ({requests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">אין בקשות שטופלו</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 10).map((request) => (
              <div key={request.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">
                    {request.profiles?.full_name || request.profiles?.email}
                  </span>
                  <span className="text-sm text-gray-600 mr-2">
                    → {request.businesses?.name}
                  </span>
                </div>
                <AccessRequestStatusBadge status={request.status} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
