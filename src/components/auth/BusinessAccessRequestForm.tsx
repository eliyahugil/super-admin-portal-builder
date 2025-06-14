
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Building2, Send } from 'lucide-react';
import { useAuth } from './AuthContext';

export const BusinessAccessRequestForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState('');
  const [requestReason, setRequestReason] = useState('');

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses-for-request'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessId) {
      toast({
        title: 'שגיאה',
        description: 'נא לבחור עסק',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'שגיאה',
        description: 'משתמש לא מזוהה',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_access_requests')
        .insert({
          user_id: user.id,
          requested_business_id: businessId,
          requested_role: 'business_user',
          request_reason: requestReason
        });

      if (error) throw error;

      toast({
        title: 'בקשה נשלחה בהצלחה',
        description: 'הבקשה שלך נשלחה למנהל המערכת לאישור',
      });

      setBusinessId('');
      setRequestReason('');
    } catch (error: any) {
      console.error('Error submitting access request:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'לא ניתן לשלוח את הבקשה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            בקשת גישה לעסק
          </CardTitle>
          <CardDescription>
            החשבון שלך נוצר בהצלחה. כדי לגשת למערכת, נא לבקש אישור גישה לעסק
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business">בחר עסק</Label>
              <Select value={businessId} onValueChange={setBusinessId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר עסק לבקש גישה אליו" />
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
              <Label htmlFor="reason">סיבת הבקשה (אופציונלי)</Label>
              <Textarea
                id="reason"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="הסבר קצר מדוע אתה זקוק לגישה לעסק זה..."
                className="min-h-[80px]"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !businessId}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  שולח בקשה...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  שלח בקשת גישה
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">מה קורה עכשיו?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• הבקשה שלך תישלח למנהל העסק</li>
              <li>• תקבל עדכון כשהבקשה תאושר או תידחה</li>
              <li>• לאחר אישור תוכל לגשת למערכת</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
