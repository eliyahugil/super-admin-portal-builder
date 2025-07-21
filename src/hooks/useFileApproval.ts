import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FileApprovalNotification {
  id: string;
  file_id: string;
  manager_id: string;
  business_id: string;
  employee_id: string;
  notification_type: 'file_uploaded' | 'file_approved' | 'file_rejected';
  is_read: boolean;
  message: string;
  created_at: string;
  read_at?: string;
}

export const useFileApproval = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveFile = async (fileId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('approve_employee_file', {
        file_id_param: fileId,
        approval_status_param: status,
        rejection_reason_param: rejectionReason
      });

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['employee-files'] });
      queryClient.invalidateQueries({ queryKey: ['file-notifications'] });

      toast({
        title: status === 'approved' ? 'קובץ אושר' : 'קובץ נדחה',
        description: status === 'approved' 
          ? 'הקובץ אושר בהצלחה' 
          : 'הקובץ נדחה',
      });

      return data;
    } catch (error) {
      console.error('Error approving file:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה באישור הקובץ',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('file_approval_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['file-notifications'] });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getFileNotifications = async (businessId?: string) => {
    try {
      let query = supabase
        .from('file_approval_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as FileApprovalNotification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  };

  return {
    approveFile,
    markNotificationAsRead,
    getFileNotifications,
    loading
  };
};