
import React, { useState } from 'react';
import { ShiftSubmissionCalendar } from './ShiftSubmissionCalendar';
import { VacationRequestForm } from './VacationRequestForm';
import { useToast } from '@/hooks/use-toast';
import { useCurrentBusiness } from '@/hooks/useCurrentBusiness';

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
  const { businessId, loading, error } = useCurrentBusiness();

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

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">טוען...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-gray-600">אנא בחר עסק מהתפריט העליון</p>
      </div>
    );
  }

  // Show business selection message
  if (!businessId) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">לא נבחר עסק</h2>
        <p className="text-gray-600 mb-4">אנא בחר עסק מהתפריט העליון כדי להמשיך</p>
        <p className="text-sm text-gray-500">
          ניתן לבחור עסק מהרשימה הנפתחת בחלק העליון של העמוד
        </p>
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
