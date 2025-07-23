
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
    console.log('🔍 useEmployeeContext - Checking for employee context...');
    
    // Check if user accessed via employee token from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const employeeDataFromStorage = localStorage.getItem('employee_token_data');
    
    console.log('🔍 Employee context check:', { tokenFromUrl, hasStorageData: !!employeeDataFromStorage });
    
    if (tokenFromUrl || employeeDataFromStorage) {
      try {
        let employeeData;
        
        if (employeeDataFromStorage) {
          employeeData = JSON.parse(employeeDataFromStorage);
          console.log('📋 Employee data from storage:', employeeData);
        }
        
        if (employeeData && employeeData.employee_id) {
          const newContext = {
            isEmployee: true,
            employeeId: employeeData.employee_id,
            businessId: employeeData.business_id,
            assignedBranchIds: employeeData.assigned_branch_ids || [],
            tokenId: employeeData.token_id
          };
          
          console.log('✅ Employee context set:', newContext);
          setContext(newContext);
        }
      } catch (error) {
        console.error('❌ Error parsing employee token data:', error);
      }
    } else {
      console.log('ℹ️ No employee token found - user is admin/business user');
    }
  }, []);

  return context;
};
