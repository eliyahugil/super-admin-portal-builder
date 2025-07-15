import React, { useState } from 'react';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowRightLeft, Check, X, Clock, User, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ShiftSwapRequest {
  id: string;
  requester_employee_id: string;
  target_employee_id?: string;
  original_shift_id: string;
  proposed_shift_id?: string;
  request_type: 'swap' | 'cover' | 'release';
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  message?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  requester_employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  target_employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  original_shift?: {
    id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    role?: string;
    branches?: {
      name: string;
    };
  };
  proposed_shift?: {
    id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
    role?: string;
    branches?: {
      name: string;
    };
  };
}

export const ShiftSwapManager: React.FC = () => {
  const { businessId } = useCurrentBusiness();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<ShiftSwapRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // שליפת בקשות החלפת משמרות
  const { data: swapRequests = [], isLoading } = useQuery({
    queryKey: ['shift-swap-requests', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('shift_swap_requests')
        .select(`
          *,
          requester_employee:employees!shift_swap_requests_requester_employee_id_fkey(
            id, first_name, last_name, employee_id
          ),
          target_employee:employees!shift_swap_requests_target_employee_id_fkey(
            id, first_name, last_name, employee_id
          ),
          original_shift:scheduled_shifts!shift_swap_requests_original_shift_id_fkey(
            id, shift_date, start_time, end_time, role,
            branches:branch_id(name)
          ),
          proposed_shift:scheduled_shifts!shift_swap_requests_proposed_shift_id_fkey(
            id, shift_date, start_time, end_time, role,
            branches:branch_id(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!businessId
  });

  // אישור/דחיית בקשה
  const reviewRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: 'approved' | 'rejected'; notes?: string }) => {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({
          status,
          approved_at: new Date().toISOString(),
          review_notes: notes
        })
        .eq('id', requestId);
      
      if (error) throw error;

      // אם הבקשה אושרה, צריך גם לעדכן את המשמרות
      if (status === 'approved') {
        const request = swapRequests.find(r => r.id === requestId);
        if (request && request.request_type === 'swap' && request.proposed_shift_id) {
          // החלפת עובדים בין המשמרות
          await Promise.all([
            supabase
              .from('scheduled_shifts')
              .update({ employee_id: request.target_employee_id })
              .eq('id', request.original_shift_id),
            supabase
              .from('scheduled_shifts')
              .update({ employee_id: request.requester_employee_id })
              .eq('id', request.proposed_shift_id)
          ]);
        } else if (request && request.request_type === 'cover' && request.target_employee_id) {
          // הקצאת העובד המבקש למשמרת
          await supabase
            .from('scheduled_shifts')
            .update({ employee_id: request.target_employee_id })
            .eq('id', request.original_shift_id);
        } else if (request && request.request_type === 'release') {
          // שחרור המשמרת (הסרת העובד)
          await supabase
            .from('scheduled_shifts')
            .update({ employee_id: null })
            .eq('id', request.original_shift_id);
        }
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['shift-swap-requests', businessId] });
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts', businessId] });
      setSelectedRequest(null);
      setReviewNotes('');
      toast({
        title: status === 'approved' ? "בקשה אושרה" : "בקשה נדחתה",
        description: status === 'approved' 
          ? "החלפת המשמרות בוצעה בהצלחה."
          : "הבקשה נדחתה ולא בוצעו שינויים."
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה בעיבוד הבקשה",
        description: "אנא נסה שוב.",
        variant: "destructive"
      });
      console.error('Error processing request:', error);
    }
  });

  const handleReviewRequest = (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    reviewRequestMutation.mutate({
      requestId: selectedRequest.id,
      status,
      notes: reviewNotes.trim() || undefined
    });
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'swap': return 'החלפת משמרות';
      case 'cover': return 'כיסוי משמרת';
      case 'release': return 'שחרור משמרת';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתין לאישור';
      case 'approved': return 'אושר';
      case 'rejected': return 'נדחה';
      case 'completed': return 'הושלם';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatShiftTime = (shift: any) => {
    if (!shift) return '';
    const date = new Date(shift.shift_date).toLocaleDateString('he-IL');
    return `${date} ${shift.start_time}-${shift.end_time}`;
  };

  const pendingRequests = swapRequests.filter(r => r.status === 'pending');
  const processedRequests = swapRequests.filter(r => r.status !== 'pending');

  if (isLoading) {
    return <div className="flex justify-center p-8">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      {/* בקשות ממתינות לאישור */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            בקשות ממתינות לאישור
          </CardTitle>
          <CardDescription>
            בקשות שמחכות להחלטה מנהלים
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              אין בקשות ממתינות כרגע
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">
                          {getRequestTypeLabel(request.request_type)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          מאת: {request.requester_employee?.first_name} {request.requester_employee?.last_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-white ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewNotes('');
                            }}
                          >
                            בדוק
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>בדיקת בקשת {getRequestTypeLabel(request.request_type)}</DialogTitle>
                            <DialogDescription>
                              בדוק את פרטי הבקשה וקבל החלטה
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedRequest && (
                            <div className="space-y-6">
                              {/* פרטי הבקשה */}
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="font-medium">מבקש:</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                      <User className="h-4 w-4" />
                                      <span>
                                        {selectedRequest.requester_employee?.first_name}{' '}
                                        {selectedRequest.requester_employee?.last_name}
                                      </span>
                                      <Badge variant="outline">
                                        {selectedRequest.requester_employee?.employee_id}
                                      </Badge>
                                    </div>
                                  </div>

                                  {selectedRequest.target_employee && (
                                    <div>
                                      <Label className="font-medium">עובד יעד:</Label>
                                      <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4" />
                                        <span>
                                          {selectedRequest.target_employee.first_name}{' '}
                                          {selectedRequest.target_employee.last_name}
                                        </span>
                                        <Badge variant="outline">
                                          {selectedRequest.target_employee.employee_id}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div>
                                  <Label className="font-medium">משמרת מקורית:</Label>
                                  <div className="flex items-center gap-2 mt-1 p-2 bg-muted rounded">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatShiftTime(selectedRequest.original_shift)}</span>
                                    {selectedRequest.original_shift?.branches && (
                                      <Badge variant="outline">
                                        {selectedRequest.original_shift.branches.name}
                                      </Badge>
                                    )}
                                    {selectedRequest.original_shift?.role && (
                                      <Badge variant="secondary">
                                        {selectedRequest.original_shift.role}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {selectedRequest.proposed_shift && (
                                  <div>
                                    <Label className="font-medium">משמרת מוצעת:</Label>
                                    <div className="flex items-center gap-2 mt-1 p-2 bg-muted rounded">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatShiftTime(selectedRequest.proposed_shift)}</span>
                                      {selectedRequest.proposed_shift.branches && (
                                        <Badge variant="outline">
                                          {selectedRequest.proposed_shift.branches.name}
                                        </Badge>
                                      )}
                                      {selectedRequest.proposed_shift.role && (
                                        <Badge variant="secondary">
                                          {selectedRequest.proposed_shift.role}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {selectedRequest.message && (
                                  <div>
                                    <Label className="font-medium">הודעה מהמבקש:</Label>
                                    <div className="mt-1 p-2 bg-muted rounded text-sm">
                                      {selectedRequest.message}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* הערות לביקורת */}
                              <div className="space-y-2">
                                <Label htmlFor="review-notes">הערות (אופציונלי)</Label>
                                <Textarea
                                  id="review-notes"
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                  placeholder="הוסף הערות או הסבר להחלטה..."
                                />
                              </div>

                              {/* כפתורי אישור/דחייה */}
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline"
                                  onClick={() => handleReviewRequest('rejected')}
                                  disabled={reviewRequestMutation.isPending}
                                  className="flex items-center gap-2"
                                >
                                  <X className="h-4 w-4" />
                                  דחה
                                </Button>
                                <Button 
                                  onClick={() => handleReviewRequest('approved')}
                                  disabled={reviewRequestMutation.isPending}
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  אשר
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="text-sm space-y-1">
                    <div>
                      <strong>משמרת מקורית:</strong> {formatShiftTime(request.original_shift)}
                    </div>
                    {request.proposed_shift && (
                      <div>
                        <strong>משמרת מוצעת:</strong> {formatShiftTime(request.proposed_shift)}
                      </div>
                    )}
                    {request.message && (
                      <div>
                        <strong>הודעה:</strong> {request.message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* היסטוריית בקשות */}
      <Card>
        <CardHeader>
          <CardTitle>היסטוריית בקשות</CardTitle>
          <CardDescription>
            בקשות שכבר טופלו בעבר
          </CardDescription>
        </CardHeader>
        <CardContent>
          {processedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              אין היסטוריית בקשות
            </div>
          ) : (
            <div className="space-y-3">
              {processedRequests.slice(0, 10).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {getRequestTypeLabel(request.request_type)} - {request.requester_employee?.first_name} {request.requester_employee?.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatShiftTime(request.original_shift)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <Badge className={`text-white ${getStatusColor(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              ))}
              
              {processedRequests.length > 10 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    הצג עוד
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};