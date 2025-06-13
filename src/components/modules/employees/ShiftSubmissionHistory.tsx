
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShiftSubmissionCard } from './ShiftSubmissionCard';
import { ShiftSubmissionLoading } from './ShiftSubmissionLoading';
import { ShiftSubmissionError } from './ShiftSubmissionError';
import { ShiftSubmissionEmpty } from './ShiftSubmissionEmpty';
import { ShiftSubmissionHeader } from './ShiftSubmissionHeader';

interface ShiftSubmissionHistoryProps {
  employeeId: string;
}

export const ShiftSubmissionHistory: React.FC<ShiftSubmissionHistoryProps> = ({ employeeId }) => {
  console.log('🔍 ShiftSubmissionHistory - Props:', { employeeId });

  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['shift-submissions', employeeId],
    queryFn: async () => {
      console.log('🔍 ShiftSubmissionHistory - Fetching submissions for employee:', employeeId);
      
      const { data, error } = await supabase
        .from('shift_submissions')
        .select('*')
        .eq('employee_id', employeeId)
        .order('week_start_date', { ascending: false });

      if (error) {
        console.error('❌ ShiftSubmissionHistory - Error fetching submissions:', error);
        throw error;
      }

      console.log('✅ ShiftSubmissionHistory - Fetched submissions:', {
        count: data?.length || 0,
        submissions: data
      });

      return data;
    },
    enabled: !!employeeId,
  });

  if (isLoading) {
    return <ShiftSubmissionLoading />;
  }

  if (error) {
    return <ShiftSubmissionError error={error} />;
  }

  console.log('📊 ShiftSubmissionHistory - Rendering with submissions:', submissions);

  return (
    <div className="space-y-4">
      <ShiftSubmissionHeader submissionsCount={submissions?.length || 0} />

      {submissions && submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <ShiftSubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>
      ) : (
        <ShiftSubmissionEmpty />
      )}
    </div>
  );
};
