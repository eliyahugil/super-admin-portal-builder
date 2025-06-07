
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AccessRequestStatusBadgeProps {
  status: string;
}

export const AccessRequestStatusBadge: React.FC<AccessRequestStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          ממתין
        </Badge>
      );
    case 'approved':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          אושר
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          נדחה
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
