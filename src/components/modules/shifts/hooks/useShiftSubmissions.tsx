import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyShiftService } from '@/services/WeeklyShiftService';
import { ShiftSubmission, ShiftEntry } from '../types';
import { getUpcomingWeekDates } from '@/lib/dateUtils';

export const useShiftSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { businessId } = useCurrentBusiness();

  // Fetch shift submissions from database
  const { data: submissions, isLoading: submissionsLoading, refetch } = useQuery({
    queryKey: ['shift-submissions', businessId],
    queryFn: async () => {
      console.log('🔄 Fetching submissions from useShiftSubmissions hook. businessId:', businessId);
      
      if (!businessId) {
        console.log('❌ No businessId provided');
        return [];
      }
      
      const { data, error } = await supabase
        .from('shift_submissions')
        .select(`
          *,
          employees!inner(
            id,
            first_name,
            last_name,
            business_id
          )
        `)
        .eq('employees.business_id', businessId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching submissions:', error);
        throw error;
      }
      
      console.log('📊 Hook fetched submissions count:', data?.length || 0);
      console.log('📄 First submission sample:', data?.[0]);
      return (data || []) as any[];
    },
    enabled: !!businessId,
  });

  // Get all employees to show missing submissions
  const { data: allEmployees } = useQuery({
    queryKey: ['employees-for-submissions', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, phone, employee_id, is_active')
        .eq('business_id', businessId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // WhatsApp functions
  const sendWhatsApp = (phone: string | undefined, employeeName: string, weekStart: string, weekEnd: string) => {
    if (!phone) {
      toast({
        title: 'שגיאה',
        description: 'לא נמצא מספר טלפון לעובד זה',
        variant: 'destructive',
      });
      return;
    }

    const message = `שלום ${employeeName}! 👋\n\nקיבלנו את בקשת המשמרות שלך לשבוע ${new Date(weekStart).toLocaleDateString('he-IL')} - ${new Date(weekEnd).toLocaleDateString('he-IL')}.\n\nתודה רבה! ✅\nצוות הניהול`;
    
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const whatsappPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : cleanPhone;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    
    toast({
      title: 'נשלח',
      description: `הודעה נשלחה ל${employeeName}`,
    });
  };

  // Send reminder to employee - disabled since shift submission system has been removed
  const sendReminder = async (employee: any) => {
    toast({
      title: 'מערכת לא זמינה',
      description: 'מערכת הגשת המשמרות הוסרה',
      variant: 'destructive',
    });
  };

  // Get upcoming week dates (next week as default)
  const getWeekDates = () => {
    return getUpcomingWeekDates();
  };

  // Parse shifts from JSON and ensure it's an array
  const parseShifts = (shiftsData: any): ShiftEntry[] => {
    if (!shiftsData) return [];
    
    if (typeof shiftsData === 'string') {
      try {
        return JSON.parse(shiftsData);
      } catch {
        return [];
      }
    }
    
    if (Array.isArray(shiftsData)) {
      return shiftsData;
    }
    
    return [];
  };

  // Create combined data for dashboard
  const currentWeek = getWeekDates();
  const dashboardData = allEmployees?.map(employee => {
    const submission = submissions?.find(s => s.employee_id === employee.id && 
      s.week_start_date <= currentWeek.end && s.week_end_date >= currentWeek.start);
    
    return {
      ...employee,
      hasSubmitted: !!submission,
      submissionDate: submission?.submitted_at,
      submissionId: submission?.id,
      status: submission ? 'submitted' : 'pending'
    };
  }) || [];

  const filteredData = dashboardData.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete submission function
  const deleteSubmission = async (submissionId: string) => {
    console.log('🗑️ Hook: Attempting to delete submission:', submissionId);
    console.log('🏢 Hook: Current businessId:', businessId);
    
    try {
      const { error, data } = await supabase
        .from('shift_submissions')
        .delete()
        .eq('id', submissionId)
        .select();

      console.log('📝 Hook: Delete response:', { error, data });

      if (error) {
        console.error('❌ Hook: Error deleting submission:', error);
        throw error;
      } else {
        console.log('✅ Hook: Submission deleted successfully');
        // Force refetch to update the cache
        await refetch();
        return { success: true };
      }
    } catch (err) {
      console.error('💥 Hook: Unexpected error:', err);
      throw err;
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    submissions,
    allEmployees,
    dashboardData: filteredData,
    isLoading: submissionsLoading,
    parseShifts,
    sendWhatsApp,
    sendReminder,
    refetch,
    deleteSubmission
  };
};
