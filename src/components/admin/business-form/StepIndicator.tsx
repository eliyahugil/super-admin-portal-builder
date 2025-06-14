
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-center mb-6 sm:mb-8">
      <div className="flex items-center space-x-2 space-x-reverse">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            {step < totalSteps && (
              <ArrowRight
                className={`w-4 h-4 ${
                  step < currentStep ? 'text-blue-600' : 'text-gray-300'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
