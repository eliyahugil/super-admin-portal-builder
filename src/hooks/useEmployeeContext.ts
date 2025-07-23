
import { useState, useEffect } from 'react';

interface EmployeeContext {
  isEmployee: boolean;
  employeeId?: string;
  businessId?: string;
  assignedBranchIds: string[];
  tokenId?: string;
}

export const useEmployeeContext = (): EmployeeContext => {
  const [context, setContext] = useState<EmployeeContext>({
    isEmployee: false,
    assignedBranchIds: []
  });

  useEffect(() => {
    // Check if user accessed via employee token from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const employeeDataFromStorage = localStorage.getItem('employee_token_data');
    
    if (tokenFromUrl || employeeDataFromStorage) {
      try {
        let employeeData;
        
        if (employeeDataFromStorage) {
          employeeData = JSON.parse(employeeDataFromStorage);
        }
        
        if (employeeData && employeeData.employee_id) {
          setContext({
            isEmployee: true,
            employeeId: employeeData.employee_id,
            businessId: employeeData.business_id,
            assignedBranchIds: employeeData.assigned_branch_ids || [],
            tokenId: employeeData.token_id
          });
        }
      } catch (error) {
        console.error('Error parsing employee token data:', error);
      }
    }
  }, []);

  return context;
};
