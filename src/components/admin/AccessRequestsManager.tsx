
import React from 'react';
import { useAccessRequests } from './access-requests/useAccessRequests';
import { AccessRequestsHeader } from './access-requests/AccessRequestsHeader';
import { PendingRequestsSection } from './access-requests/PendingRequestsSection';
import { ProcessedRequestsList } from './access-requests/ProcessedRequestsList';

export const AccessRequestsManager: React.FC = () => {
  const { requests, isLoading, handleRequestMutation } = useAccessRequests();

  const handleApprove = (requestId: string) => {
    handleRequestMutation.mutate({ requestId, action: 'approve' });
  };

  const handleReject = (requestId: string) => {
    handleRequestMutation.mutate({ requestId, action: 'reject' });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <AccessRequestsHeader />
      
      <PendingRequestsSection
        requests={pendingRequests}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={handleRequestMutation.isPending}
      />

      <ProcessedRequestsList requests={processedRequests} />
    </div>
  );
};
