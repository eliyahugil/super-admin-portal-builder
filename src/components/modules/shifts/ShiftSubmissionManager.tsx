
import React, { useState } from 'react';
import { ShiftSubmissionCalendar } from './ShiftSubmissionCalendar';
import { VacationRequestForm } from './VacationRequestForm';
import { useToast } from '@/hooks/use-toast';
import { useBusiness } from '@/hooks/useBusiness';

interface SelectedShift {
  date: Date;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  branchName: string;
}

interface VacationRequest {
  startDate: Date;
  endDate: Date;
  reason: string;
  notes?: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'military';
}

type ViewMode = 'calendar' | 'vacation';

export const ShiftSubmissionManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const { toast } = useToast();
  const { businessId } = useBusiness();

  const handleShiftSubmission = async (shifts: SelectedShift[]) => {
    try {
      console.log('Submitting shifts:', shifts);
      
      // Here you would typically send the data to your backend
      // For now, we'll just show a success message
      
      toast({
        title: 'הצלחה!',
        description: `${shifts.length} משמרות נשלחו בהצלחה`,
      });

      // Reset or redirect as needed
      // setViewMode('calendar');
    } catch (error) {
      console.error('Error submitting shifts:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת המשמרות. נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  const handleVacationRequest = async (request: VacationRequest) => {
    try {
      console.log('Submitting vacation request:', request);
      
      // Here you would typically send the data to your backend
      // For now, we'll just show a success message
      
      toast({
        title: 'בקשת חופשה נשלחה!',
        description: `בקשה לחופשה מ-${request.startDate.toLocaleDateString('he-IL')} עד ${request.endDate.toLocaleDateString('he-IL')}`,
      });

      // Return to calendar view
      setViewMode('calendar');
    } catch (error) {
      console.error('Error submitting vacation request:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בשליחת בקשת החופשה. נסה שוב.',
        variant: 'destructive',
      });
    }
  };

  const handleVacationRequestClick = () => {
    setViewMode('vacation');
  };

  const handleCancelVacationRequest = () => {
    setViewMode('calendar');
  };

  if (!businessId) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">לא נבחר עסק</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {viewMode === 'calendar' ? (
        <ShiftSubmissionCalendar
          businessId={businessId}
          onSubmit={handleShiftSubmission}
          onVacationRequest={handleVacationRequestClick}
        />
      ) : (
        <VacationRequestForm
          onSubmit={handleVacationRequest}
          onCancel={handleCancelVacationRequest}
        />
      )}
    </div>
  );
};
