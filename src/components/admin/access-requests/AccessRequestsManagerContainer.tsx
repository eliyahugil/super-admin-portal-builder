
import React from 'react';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import { AccessRequestsHeader } from './AccessRequestsHeader';
import { AccessRequestsStats } from './AccessRequestsStats';
import { AccessRequestsDebugCard } from './AccessRequestsDebugCard';
import { PendingRequestsSection } from './PendingRequestsSection';
import { MinimizedProcessedRequestsSection } from './MinimizedProcessedRequestsSection';

export const AccessRequestsManagerContainer: React.FC = () => {
  const { requests, isLoading, handleRequestMutation, refetch } = useAccessRequests();
  
  const pendingRequests = requests.filter(req => req.status === 'pending');
  console.log('📋 AccessRequestsManagerContainer - All requests:', requests);
  console.log('⏳ Pending requests:', pendingRequests.length);

  const handleApprove = (requestId: string, assignmentData: any) => {
    console.log('🔄 Approving request with assignment:', { requestId, assignmentData });
    
    handleRequestMutation.mutate({ 
      requestId, 
      action: 'approve',
      reviewNotes: assignmentData.reviewNotes,
      assignmentData: assignmentData
    });
  };

  const handleReject = (requestId: string, reviewNotes: string) => {
    console.log('❌ Rejecting request:', { requestId, reviewNotes });
    
    handleRequestMutation.mutate({ 
      requestId, 
      action: 'reject',
      reviewNotes: reviewNotes 
    });
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

  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <AccessRequestsHeader 
        pendingCount={pendingRequests.length}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />
      
      <AccessRequestsDebugCard 
        totalRequests={requests.length}
        pendingCount={pendingRequests.length}
        processedCount={processedRequests.length}
      />
      
      <AccessRequestsStats requests={requests} />
      
      <PendingRequestsSection
        requests={pendingRequests}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={handleRequestMutation.isPending}
      />

      <MinimizedProcessedRequestsSection requests={processedRequests} />
    </div>
  );
};
