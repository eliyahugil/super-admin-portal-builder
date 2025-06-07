
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, UserPlus, Building2 } from 'lucide-react';

interface AccessRequest {
  id: string;
  user_id: string;
  requested_business_id: string;
  requested_role: string;
  request_reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_email?: string;
  user_full_name?: string;
  business_name?: string;
}

export const AccessRequestsManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['access-requests'],
    queryFn: async (): Promise<AccessRequest[]> => {
      const { data, error } = await supabase
        .from('user_access_requests')
        .select(`
          *,
          user_email:profiles!user_access_requests_user_id_fkey(email, full_name),
          business_name:businesses!user_access_requests_requested_business_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(request => ({
        ...request,
        user_email: request.user_email?.email,
        user_full_name: request.user_email?.full_name,
        business_name: request.business_name?.name
      })) || [];
    },
  });

  const handleRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, reviewNotes }: { 
      requestId: string; 
      action: 'approve' | 'reject';
      reviewNotes?: string;
    }) => {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update the access request status
      const { error: updateError } = await supabase
        .from('user_access_requests')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          review_notes: reviewNotes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, create user_business relationship and update profile
      if (action === 'approve' && request.requested_business_id) {
        // Create user_business relationship
        const { error: businessError } = await supabase
          .from('user_businesses')
          .insert({
            user_id: request.user_id,
            business_id: request.requested_business_id,
            role: 'member'
          });

        if (businessError) {
          console.warn('Error creating user_business relationship:', businessError);
        }

        // Update user profile with business_id
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            business_id: request.requested_business_id,
            role: request.requested_role
          })
          .eq('id', request.user_id);

        if (profileError) {
          console.warn('Error updating user profile:', profileError);
        }
      }

      return { action, requestId };
    },
    onSuccess: (data) => {
      toast({
        title: data.action === 'approve' ? 'בקשה אושרה' : 'בקשה נדחתה',
        description: data.action === 'approve' 
          ? 'המשתמש קיבל גישה לעסק'
          : 'הבקשה נדחתה',
      });
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
    onError: (error: any) => {
      console.error('Error handling request:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעבד את הבקשה',
        variant: 'destructive',
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          ממתין
        </Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          אושר
        </Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          נדחה
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
                <Card key={request.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {request.user_full_name || request.user_email || 'משתמש לא מזוהה'}
                        </h3>
                        <p className="text-sm text-gray-600">{request.user_email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {request.business_name || 'עסק לא מזוהה'}
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
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRequestMutation.mutate({ 
                          requestId: request.id, 
                          action: 'approve' 
                        })}
                        disabled={handleRequestMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        אשר
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestMutation.mutate({ 
                          requestId: request.id, 
                          action: 'reject' 
                        })}
                        disabled={handleRequestMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        דחה
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
                <div key={request.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">
                      {request.user_full_name || request.user_email}
                    </span>
                    <span className="text-sm text-gray-600 mr-2">
                      → {request.business_name}
                    </span>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
