
import { BusinessFormData } from './types';

export const useBusinessFormValidation = () => {
  const validateStep = (step: number, formData: BusinessFormData, useSubscriptionPlan: boolean, selectedPlanId: string, selectedModules: string[]): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.admin_email && formData.admin_full_name);
      case 2:
        return true; // Optional fields
      case 3:
        if (useSubscriptionPlan) {
          return !!selectedPlanId;
        }
        return selectedModules.length > 0;
      default:
        return false;
    }
  };

  return { validateStep };
};
