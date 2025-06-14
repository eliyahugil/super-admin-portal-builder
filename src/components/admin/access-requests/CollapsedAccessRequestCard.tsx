
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Phone, Mail, Calendar } from 'lucide-react';
import { AccessRequest } from './types';
import { AccessRequestStatusBadge } from './AccessRequestStatusBadge';
import { DetailedAccessRequestCard } from './DetailedAccessRequestCard';

interface CollapsedAccessRequestCardProps {
  request: AccessRequest;
  onApprove: (requestId: string, assignmentData: any) => void;
  onReject: (requestId: string, reviewNotes: string) => void;
  isLoading: boolean;
  showActions?: boolean;
}

export const CollapsedAccessRequestCard: React.FC<CollapsedAccessRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  isLoading,
  showActions = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const profileFullName = request.profiles?.full_name;
  const profileEmail = request.profiles?.email;
  const profilePhone = request.profiles?.phone;

  if (isExpanded) {
    return (
      <DetailedAccessRequestCard
        request={request}
        onApprove={onApprove}
        onReject={onReject}
        isLoading={isLoading}
        onCollapse={() => setIsExpanded(false)}
      />
    );
  }

  return (
    <Card className={`border-l-4 ${request.status === 'pending' ? 'border-l-yellow-500' : 'border-l-gray-300'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Name */}
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {profileFullName || (
                  <span className="text-red-600">לא זמין</span>
                )}
              </span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              <span>
                {profilePhone || (
                  <span className="text-red-600">לא זמין</span>
                )}
              </span>
            </div>
            
            {/* Email */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>
                {profileEmail || (
                  <span className="text-red-600">לא זמין</span>
                )}
              </span>
            </div>
            
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(request.created_at).toLocaleDateString('he-IL')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AccessRequestStatusBadge status={request.status} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="p-1"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
