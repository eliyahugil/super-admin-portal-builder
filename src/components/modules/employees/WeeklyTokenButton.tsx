
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Calendar, Link, Copy, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sendShiftTokenWhatsapp } from '@/utils/sendWhatsappReminder';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusiness } from '@/hooks/useBusiness';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WeeklyTokenButtonProps {
  phone: string;
  employeeName: string;
  employeeId: string;
  compact?: boolean;
}

export const WeeklyTokenButton: React.FC<WeeklyTokenButtonProps> = ({
  phone,
  employeeName,
  employeeId,
  compact = false,
}) => {
  const [loading, setLoading] = useState(false);
  const { businessId } = useBusiness();
  const { settings } = useBusinessSettings(businessId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create weekly token for next week
  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['weekly-token', employeeId],
    queryFn: async () => {
      // Calculate next week dates
      const now = new Date();
      const currentDay = now.getDay();
      const startOfNextWeek = new Date(now);
      startOfNextWeek.setDate(now.getDate() - currentDay + 7);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

      const weekStart = startOfNextWeek.toISOString().split('T')[0];
      const weekEnd = endOfNextWeek.toISOString().split('T')[0];

      // Check if token exists for next week
      const { data: existingToken, error } = await supabase
        .from('employee_weekly_tokens')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('week_start_date', weekStart)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (existingToken) {
        return {
          ...existingToken,
          submissionUrl: `${window.location.origin}/weekly-shift-submission/${existingToken.token}`,
          advancedSubmissionUrl: `${window.location.origin}/advanced-shift-submission/${existingToken.token}`
        };
      }

      // Create new token
      const newToken = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(endOfNextWeek);
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: newTokenData, error: insertError } = await supabase
        .from('employee_weekly_tokens')
        .insert({
          employee_id: employeeId,
          token: newToken,
          week_start_date: weekStart,
          week_end_date: weekEnd,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        ...newTokenData,
        submissionUrl: `${window.location.origin}/weekly-shift-submission/${newTokenData.token}`,
        advancedSubmissionUrl: `${window.location.origin}/advanced-shift-submission/${newTokenData.token}`
      };
    },
    enabled: !!employeeId,
  });

  // Log WhatsApp reminder
  const logReminderMutation = useMutation({
    mutationFn: async (data: {
      phone: string;
      message: string;
      method: string;
      status: string;
      errorDetails?: string;
    }) => {
      const { error } = await supabase
        .from('shift_reminder_logs')
        .insert({
          employee_id: employeeId,
          business_id: businessId,
          phone_number: data.phone,
          message_content: data.message,
          method: data.method,
          status: data.status,
          error_details: data.errorDetails,
        });

      if (error) throw error;
    },
  });

  const handleSendWhatsApp = async (useAdvanced = false) => {
    if (!phone || !tokenData?.submissionUrl) {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח הודעה - חסר מספר טלפון או טוכן',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const useAPI = settings?.use_whatsapp_api || false;
      const submissionUrl = useAdvanced ? tokenData.advancedSubmissionUrl : tokenData.submissionUrl;
      
      await sendShiftTokenWhatsapp({
        phone,
        employeeName,
        employeeId,
        tokenUrl: submissionUrl,
        useAPI,
        isAdvanced: useAdvanced,
      });
      
      // Log successful reminder
      await logReminderMutation.mutateAsync({
        phone,
        message: `שליחת טוכן ${useAdvanced ? 'מתקדם' : 'רגיל'} ל-${employeeName}`,
        method: useAPI ? 'whatsapp_api' : 'browser',
        status: 'success',
      });
      
      const methodText = useAPI ? 'WhatsApp API' : 'דפדפן';
      const systemText = useAdvanced ? 'מערכת מתקדמת' : 'מערכת רגילה';
      toast({
        title: useAPI ? 'הודעה נשלחה' : 'נפתח WhatsApp',
        description: `${useAPI ? 'הודעה נשלחה בהצלחה' : 'WhatsApp נפתח עם הודעה מוכנה'} ל-${employeeName} דרך ${methodText} (${systemText})`,
      });
    } catch (error) {
      console.error('Error sending WhatsApp reminder:', error);
      
      // Log failed reminder
      await logReminderMutation.mutateAsync({
        phone,
        message: '',
        method: settings?.use_whatsapp_api ? 'whatsapp_api' : 'browser',
        status: 'failed',
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
      });
      
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לשלוח הודעה',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (useAdvanced = false) => {
    const url = useAdvanced ? tokenData?.advancedSubmissionUrl : tokenData?.submissionUrl;
    if (url) {
      navigator.clipboard.writeText(url);
      toast({
        title: 'הקישור הועתק',
        description: `קישור הגשת המשמרות ${useAdvanced ? '(מתקדם)' : ''} הועתק ללוח`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">טוען טוכן...</span>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="text-sm text-red-600">
        שגיאה ביצירת טוכן
      </div>
    );
  }

  const weekStart = new Date(tokenData.week_start_date).toLocaleDateString('he-IL');
  const weekEnd = new Date(tokenData.week_end_date).toLocaleDateString('he-IL');
  const isExpired = new Date(tokenData.expires_at) < new Date();

  if (compact) {
    return (
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={loading || !phone || isExpired}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {loading ? 'שולח...' : 'שלח בוואטסאפ'}
              {settings?.use_whatsapp_api && (
                <span className="text-xs text-blue-600">(API)</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSendWhatsApp(false)}>
              <Send className="h-4 w-4 mr-2" />
              טופס רגיל
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSendWhatsApp(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              מערכת מתקדמת
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              title="העתק קישור"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCopyLink(false)}>
              <Copy className="h-4 w-4 mr-2" />
              טופס רגיל
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyLink(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              מערכת מתקדמת
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium">טוכן שבוע {weekStart} - {weekEnd}</span>
        <Badge variant={isExpired ? "destructive" : "default"}>
          {isExpired ? "פג תוקף" : "פעיל"}
        </Badge>
      </div>
      
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              disabled={loading || !phone || isExpired}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {loading ? 'שולח...' : 'שלח בוואטסאפ'}
              {settings?.use_whatsapp_api && (
                <span className="text-xs text-blue-600">(API)</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSendWhatsApp(false)}>
              <Send className="h-4 w-4 mr-2" />
              טופס רגיל
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSendWhatsApp(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              מערכת מתקדמת
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              title="העתק קישור"
            >
              <Copy className="h-4 w-4" />
              העתק קישור
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCopyLink(false)}>
              <Copy className="h-4 w-4 mr-2" />
              טופס רגיל
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCopyLink(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              מערכת מתקדמת
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex items-center">
          <Link className="h-3 w-3 inline mr-1" />
          <span>רגיל: {tokenData.submissionUrl}</span>
        </div>
        <div className="flex items-center">
          <Sparkles className="h-3 w-3 inline mr-1" />
          <span>מתקדם: {tokenData.advancedSubmissionUrl}</span>
        </div>
      </div>
    </div>
  );
};
