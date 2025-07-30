
import React from 'react';
import { ShiftManagement } from '../employees/ShiftManagement';
import { ShiftManagementTabs } from '../shifts/ShiftManagementTabs';
import { ShiftSchedule } from '../shifts/ShiftSchedule';
import { AutoShiftAssignment } from '../shifts/AutoShiftAssignment';
import { VacationRequestSystem } from '../shifts/VacationRequestSystem';
import { QuickRequestRegistration } from '../shifts/QuickRequestRegistration';
import { PublicTokenManager } from '../shifts/PublicTokenManager';
import { EmployeeCompatibleShiftsView } from '../shifts/EmployeeCompatibleShiftsView';

interface Props {
  route: string;
}

export const ShiftsModuleRouter: React.FC<Props> = ({ route }) => {
  console.log('🚨🚨🚨 ShiftsModuleRouter - route received:', route);
  
  switch (route) {
    case '':
      console.log('🚨 Routing to ShiftManagementTabs');
      return <ShiftManagementTabs />;
    case 'schedule':
      console.log('🚨🚨🚨 ROUTING TO SHIFT SCHEDULE!!!');
      return <ShiftSchedule />;
    case 'submission':
      return <PublicTokenManager />;
    case 'employee-shifts':
      return <EmployeeCompatibleShiftsView />;
    case 'public-tokens':
      return <div className="p-4 text-center">מערכת הטוקנים הציבוריים זמינה בהגשות משמרות</div>;
    case 'auto-assignment':
      return <AutoShiftAssignment />;
    case 'vacation-requests':
      return <VacationRequestSystem />;
    case 'quick-requests':
      return <QuickRequestRegistration />;
    case 'tokens':
    case 'weekly-tokens':
      return <div className="p-4 text-center">מערכת הטוקנים הוסרה</div>;
    case 'admin':
      return <ShiftManagement />;
    default:
      return null;
  }
};
