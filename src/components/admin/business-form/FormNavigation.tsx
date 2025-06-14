
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  loading: boolean;
  canProceed: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  loading,
  canProceed,
  onNext,
  onPrevious,
  onCancel,
  onSubmit
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-6">
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onCancel}
          className="flex-1 sm:flex-initial"
        >
          ביטול
        </Button>
        {currentStep > 1 && (
          <Button 
            variant="outline"
            onClick={onPrevious}
            className="flex-1 sm:flex-initial"
          >
            חזור
          </Button>
        )}
      </div>
      
      {currentStep < totalSteps ? (
        <Button 
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          המשך
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button 
          onClick={onSubmit}
          disabled={loading || !canProceed}
          size="lg"
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              יוצר עסק ומנהל...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              צור עסק + מנהל אוטומטי
            </>
          )}
        </Button>
      )}
    </div>
  );
};
