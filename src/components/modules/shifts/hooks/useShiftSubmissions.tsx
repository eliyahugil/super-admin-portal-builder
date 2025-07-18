import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyShiftService } from '@/services/WeeklyShiftService';
import { ShiftSubmission, ShiftEntry } from '../types';
import { getUpcomingWeekDates } from '@/lib/dateUtils';

export const useShiftSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { businessId, isLoading } = useBusiness();

  // Shift submissions system has been removed - return empty data
  const { data: submissions, isLoading: submissionsLoading, refetch } = useQuery({
    queryKey: ['shift-submissions', businessId],
    queryFn: async () => {
      // Shift submission system has been removed
      return [] as ShiftSubmission[];
    },
    enabled: false, // Disabled since shift submissions are no longer available
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
    enabled: !!businessId && !isLoading,
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

  return {
    searchTerm,
    setSearchTerm,
    submissions,
    allEmployees,
    dashboardData: filteredData,
    isLoading: isLoading || submissionsLoading,
    parseShifts,
    sendWhatsApp,
    sendReminder,
    refetch
  };
};
