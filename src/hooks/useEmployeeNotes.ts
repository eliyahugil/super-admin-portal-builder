
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';

export interface EmployeeNote {
  id: string;
  employee_id: string;
  business_id: string;
  note_type: 'general' | 'warning' | 'positive' | 'performance' | 'communication';
  content: string;
  is_warning: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: {
    full_name: string;
    email: string;
  };
}

export const useEmployeeNotes = (employeeId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch employee notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['employee-notes', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_notes')
        .select(`
          *,
          creator:profiles(full_name, email)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employee notes:', error);
        throw error;
      }

      return data as EmployeeNote[];
    },
    enabled: !!employeeId,
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (newNote: Omit<EmployeeNote, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'creator'>) => {
      if (!user?.id) {
        throw new Error('User must be authenticated to create notes');
      }

      const noteToInsert = {
        ...newNote,
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('employee_notes')
        .insert([noteToInsert])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notes', employeeId] });
      toast({
        title: 'הערה נוספה',
        description: 'ההערה נוספה בהצלחה לפרופיל העובד',
      });
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן להוסיף את ההערה',
        variant: 'destructive',
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('employee_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notes', employeeId] });
      toast({
        title: 'הערה נמחקה',
        description: 'ההערה נמחקה בהצלחה',
      });
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast({
        title: 'שגיאה',
        description: 'לא ניתן למחוק את ההערה',
        variant: 'destructive',
      });
    },
  });

  return {
    notes,
    isLoading,
    createNote: createNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
    isCreating: createNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
  };
};
