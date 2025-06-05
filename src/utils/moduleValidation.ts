
import type { ValidationResult } from './moduleTypes';

// Validate module name
export const validateModuleName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'שם המודול לא יכול להיות ריק' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'שם המודול חייב להכיל לפחות 2 תווים' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'שם המודול לא יכול להכיל יותר מ-50 תווים' };
  }

  return { isValid: true };
};
