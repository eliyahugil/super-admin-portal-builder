
import React, { useState } from 'react';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, UserPlus, Building2 } from 'lucide-react';
import { AccessRequest } from '@/types/access-request';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AccessRequestCard: React.FC<{
  request: AccessRequest;
  onApprove: (requestId: string, businessId: string) => void;
  onReject: (requestId: string) => void;
  isLoading: boolean;
}> = ({ request, onApprove, onReject, isLoading }) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses-for-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: request.status === 'pending'
  });

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

  const handleApprove = () => {
    if (!selectedBusinessId) {
      toast({
        title: 'שגיאה',
        description: 'נא לבחור עסק לשיוך המשתמש',
        variant: 'destructive',
      });
      return;
    }
    onApprove(request.id, selectedBusinessId);
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
            {request.businesses?.name && (
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  שויך לעסק: {request.businesses.name}
                </span>
              </div>
            )}
          </div>
          {getStatusBadge(request.status)}
        </div>
        
        {request.request_reason && (
          <div className="mb-4">
            <h4 className="font-medium mb-1">מידע נוסף מהמשתמש:</h4>
            <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded">{request.request_reason}</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 mb-4">
          נשלח ב: {new Date(request.created_at).toLocaleDateString('he-IL')} בשעה {new Date(request.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {request.status === 'pending' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`business-${request.id}`}>בחר עסק לשיוך המשתמש:</Label>
              <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עסק..." />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`notes-${request.id}`}>הערות (אופציונלי):</Label>
              <Textarea
                id={`notes-${request.id}`}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="הערות למשתמש..."
                className="min-h-[60px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isLoading || !selectedBusinessId}
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                אשר ושייך לעסק
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
          </div>
        )}
        
        {request.status !== 'pending' && request.review_notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium mb-1">הערות מנהל המערכת:</h4>
            <p className="text-sm text-gray-700">{request.review_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AccessRequestsManagerEnhanced: React.FC = () => {
  const { requests, isLoading, handleRequestMutation } = useAccessRequests();

  const handleApprove = (requestId: string, businessId: string) => {
    handleRequestMutation.mutate({ 
      requestId, 
      action: 'approve',
      businessId // Pass the selected business ID
    });
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
          ניהול בקשות גישה והרשמות
        </h1>
        <p className="text-gray-600 mt-2">סקור, שייך לעסק ואשר בקשות גישה למערכת</p>
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
