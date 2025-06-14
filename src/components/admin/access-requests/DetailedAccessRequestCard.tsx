
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Building2, AlertCircle, Phone } from 'lucide-react';
import { AccessRequest } from './types';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';
import { UserProfileDisplay } from './UserProfileDisplay';
import { AssignmentForm } from './AssignmentForm';

interface DetailedAccessRequestCardProps {
  request: AccessRequest;
  onApprove: (requestId: string, assignmentData: any) => void;
  onReject: (requestId: string, reviewNotes: string) => void;
  isLoading: boolean;
}

export const DetailedAccessRequestCard: React.FC<DetailedAccessRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading
}) => {
  const [reviewNotes, setReviewNotes] = useState('');

  console.log('🔍 DetailedAccessRequestCard - Request data:', {
    id: request.id,
    user_id: request.user_id,
    profiles: request.profiles,
    businesses: request.businesses
  });

  const handleApprove = (assignmentData: any) => {
    onApprove(request.id, assignmentData);
  };

  const handleReject = () => {
    onReject(request.id, reviewNotes);
  };

  return (
    <Card className={`border-l-4 ${request.status === 'pending' ? 'border-l-yellow-500' : 'border-l-gray-300'}`}>
      <CardContent className="p-6">
        {/* Header with status */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <UserProfileDisplay request={request} />

            {request.businesses?.name && (
              <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">עסק מבוקש:</span>
                <span className="text-sm text-gray-900">{request.businesses.name}</span>
              </div>
            )}
          </div>
          <AccessRequestStatusBadge status={request.status} />
        </div>
        
        {/* Request reason */}
        {request.request_reason && (
          <div className="mb-6">
            <h4 className="font-medium mb-2 text-gray-700">סיבת הבקשה ומידע נוסף:</h4>
            <div className="bg-gray-50 p-3 rounded border-l-4 border-l-blue-400">
              <p className="text-gray-800">{request.request_reason}</p>
            </div>
          </div>
        )}
        
        {/* Assignment form for pending requests */}
        {request.status === 'pending' && (
          <AssignmentForm
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isLoading}
            reviewNotes={reviewNotes}
            onReviewNotesChange={setReviewNotes}
          />
        )}
        
        {/* Review notes for processed requests */}
        {request.status !== 'pending' && request.review_notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-l-gray-400">
            <h4 className="font-medium mb-2 text-gray-700">הערות מנהל המערכת:</h4>
            <p className="text-sm text-gray-800">{request.review_notes}</p>
            {request.reviewed_at && (
              <p className="text-xs text-gray-500 mt-2">
                נבדק ב: {new Date(request.reviewed_at).toLocaleDateString('he-IL')} 
                {' בשעה '}
                {new Date(request.reviewed_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
