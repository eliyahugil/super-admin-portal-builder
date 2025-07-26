
import { useTokenDetails } from './useTokenDetails';
import { useTokenSubmissions } from './useTokenSubmissions';
import { useShiftSubmission } from './useShiftSubmission';
import { useTokenManagement } from './useTokenManagement';
import { useEmployeeCompatibleShifts } from './useEmployeeCompatibleShifts';

export const usePublicShifts = () => {
  const { 
    generateToken,
    toggleTokenStatus,
    resetSingleToken,
    resetAllTokens,
    useBusinessTokens,
    useEmployeeActiveToken,
    useTokenAvailableShifts 
  } = useTokenManagement();

  const useShiftSubmissionMutation = useShiftSubmission;

  return {
    useToken: useTokenDetails,
    useTokenSubmissions,
    useEmployeeCompatibleShifts,
    useShiftSubmissionMutation,
    generateToken,
    toggleTokenStatus,
    useBusinessTokens,
    useEmployeeActiveToken,
    useTokenAvailableShifts,
    resetSingleToken,
    resetAllTokens,
  };
};
