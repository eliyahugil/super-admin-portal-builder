
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { sendShiftTokenWhatsapp } from '@/utils/sendWhatsappReminder';
import { useBusinessSettings } from '@/hooks/useBusinessSettings';
import { useBusiness } from '@/hooks/useBusiness';
import { TokenData, LogReminderData } from './types';
import { getUpcomingWeekDates } from '@/lib/dateUtils';

export const useWeeklyToken = (employeeId: string, employeeName: string, phone: string) => {
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const { businessId } = useBusiness();
  const { settings } = useBusinessSettings(businessId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create weekly token for next week - now includes context for available/assigned shifts
  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['weekly-token', employeeId],
    queryFn: async (): Promise<TokenData> => {
      // Use the upcoming week dates function for consistent calculation
      const upcomingWeek = getUpcomingWeekDates();
      const weekStart = upcomingWeek.start;
      const weekEnd = upcomingWeek.end;

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
          context_type: existingToken.context_type as 'submission' | 'available_shifts' | 'assigned_shifts',
          submissionUrl: `${window.location.origin}/weekly-shift-view/${existingToken.token}`,
          advancedSubmissionUrl: `${window.location.origin}/advanced-shift-submission/${existingToken.token}`
        };
      }

      // Create new token with open context (shows available shifts before publishing)
      const newToken = crypto.randomUUID().replace(/-/g, '');
      const expiresAt = new Date(upcomingWeek.endDate);
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data: newTokenData, error: insertError } = await supabase
        .from('employee_weekly_tokens')
        .insert({
          employee_id: employeeId,
          token: newToken,
          week_start_date: weekStart,
          week_end_date: weekEnd,
          expires_at: expiresAt.toISOString(),
          context_type: 'available_shifts',
          shifts_published: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        ...newTokenData,
        context_type: newTokenData.context_type as 'submission' | 'available_shifts' | 'assigned_shifts',
        submissionUrl: `${window.location.origin}/weekly-shift-view/${newTokenData.token}`,
        advancedSubmissionUrl: `${window.location.origin}/advanced-shift-submission/${newTokenData.token}`
      };
    },
    enabled: !!employeeId,
  });

  // Log WhatsApp reminder
  const logReminderMutation = useMutation({
    mutationFn: async (data: LogReminderData) => {
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

  // Revoke token mutation
  const revokeTokenMutation = useMutation({
    mutationFn: async () => {
      if (!tokenData?.id) throw new Error('No token to revoke');
      
      const { error } = await supabase
        .from('employee_weekly_tokens')
        .update({ is_active: false })
        .eq('id', tokenData.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'הטוכן בוטל',
        description: `הטוכן של ${employeeName} בוטל בהצלחה`,
      });
      queryClient.invalidateQueries({ queryKey: ['weekly-token', employeeId] });
    },
    onError: (error) => {
      console.error('Error revoking token:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לבטל את הטוכן',
        variant: 'destructive',
      });
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
        message: `שליחת קישור צפייה במשמרות ${useAdvanced ? 'מתקדם' : 'רגיל'} ל-${employeeName}`,
        method: useAPI ? 'whatsapp_api' : 'browser',
        status: 'success',
      });
      
      const methodText = useAPI ? 'WhatsApp API' : 'דפדפן';
      const systemText = useAdvanced ? 'מערכת מתקדמת' : 'צפייה במשמרות';
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
        description: `קישור צפייה במשמרות ${useAdvanced ? '(מתקדם)' : ''} הועתק ללוח`,
      });
    }
  };

  const handleOpenLink = (useAdvanced = false) => {
    const url = useAdvanced ? tokenData?.advancedSubmissionUrl : tokenData?.submissionUrl;
    if (url) {
      window.open(url, '_blank');
      toast({
        title: 'הקישור נפתח',
        description: `קישור צפייה במשמרות ${useAdvanced ? '(מתקדם)' : ''} נפתח בכרטיסייה חדשה`,
      });
    }
  };

  const handleRevokeToken = async () => {
    setRevoking(true);
    try {
      await revokeTokenMutation.mutateAsync();
    } finally {
      setRevoking(false);
    }
  };

  return {
    tokenData,
    isLoading,
    loading,
    revoking,
    settings,
    handleSendWhatsApp,
    handleCopyLink,
    handleOpenLink,
    handleRevokeToken,
  };
};
