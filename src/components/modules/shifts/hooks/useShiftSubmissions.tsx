
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';
import { WeeklyShiftService } from '@/services/WeeklyShiftService';
import { ShiftSubmission, ShiftEntry } from '../types';

export const useShiftSubmissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { businessId, isLoading } = useBusiness();

  // Get shift submissions
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['shift-submissions', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const rawData = await WeeklyShiftService.getShiftSubmissionsForBusiness(businessId);
      
      // Map the data to ensure employee has the correct id field
      return rawData.map((submission: any) => ({
        ...submission,
        employee: submission.employee ? {
          ...submission.employee,
          id: submission.employee.employee_id || submission.employee.id, // Use employee_id as id if id doesn't exist
        } : undefined,
      })) as ShiftSubmission[];
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

  const filteredSubmissions = submissions?.filter((submission: ShiftSubmission) =>
    submission.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.employee?.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm,
    setSearchTerm,
    submissions,
    filteredSubmissions,
    isLoading: isLoading || submissionsLoading,
    parseShifts,
    sendWhatsApp
  };
};
