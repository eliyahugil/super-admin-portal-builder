
import React from 'react';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, UserPlus, Building2 } from 'lucide-react';
import { AccessRequest } from '@/types/access-request';

const AccessRequestCard: React.FC<{
  request: AccessRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading: boolean;
}> = ({ request, onApprove, onReject, isLoading }) => {
  const getStatusBadge = (status: string) => {
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

  return (
    <Card className={`border-l-4 ${request.status === 'pending' ? 'border-l-yellow-500' : 'border-l-gray-300'}`}>
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
          {getStatusBadge(request.status)}
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
        
        {request.status === 'pending' && (
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
        )}
      </CardContent>
    </Card>
  );
};

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="h-8 w-8" />
          ניהול בקשות גישה
        </h1>
        <p className="text-gray-600 mt-2">סקור ואשר בקשות גישה למערכת</p>
      </div>
      
      {/* Pending Requests */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            בקשות ממתינות ({pendingRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות ממתינות</h3>
              <p className="text-gray-600">כל הבקשות טופלו</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <AccessRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={handleRequestMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests */}
      <Card>
        <CardHeader>
          <CardTitle>בקשות שטופלו ({processedRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">אין בקשות שטופלו</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <AccessRequestCard
                  key={request.id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isLoading={handleRequestMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
