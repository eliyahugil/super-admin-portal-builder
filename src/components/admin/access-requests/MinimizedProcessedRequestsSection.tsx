
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { AccessRequest } from './types';
import { CollapsedAccessRequestCard } from './CollapsedAccessRequestCard';

interface MinimizedProcessedRequestsSectionProps {
  requests: AccessRequest[];
}

export const MinimizedProcessedRequestsSection: React.FC<MinimizedProcessedRequestsSectionProps> = ({
  requests
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            בקשות שטופלו ({requests.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <span className="text-sm">
              {isExpanded ? 'צמצם' : 'הרחב'}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!isExpanded && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{approvedCount} אושרו</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>{rejectedCount} נדחו</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">אין בקשות שטופלו</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 10).map((request) => (
                <CollapsedAccessRequestCard
                  key={request.id}
                  request={request}
                  onApprove={() => {}}
                  onReject={() => {}}
                  isLoading={false}
                  showActions={false}
                />
              ))}
              {requests.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  מוצגות 10 בקשות מתוך {requests.length}
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
