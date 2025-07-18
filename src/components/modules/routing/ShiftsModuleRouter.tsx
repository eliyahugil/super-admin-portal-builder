
import React from 'react';
import { ShiftManagement } from '../employees/ShiftManagement';
import { ShiftManagementTabs } from '../shifts/ShiftManagementTabs';
import { ShiftSchedule } from '../shifts/ShiftSchedule';
import { AutoShiftAssignment } from '../shifts/AutoShiftAssignment';
import { VacationRequestSystem } from '../shifts/VacationRequestSystem';
import { QuickRequestRegistration } from '../shifts/QuickRequestRegistration';
import { UnifiedShiftRequests } from '../shifts/UnifiedShiftRequests';


interface Props {
  route: string;
}

export const ShiftsModuleRouter: React.FC<Props> = ({ route }) => {
  switch (route) {
    case '':
      return <ShiftManagementTabs />;
    case 'schedule':
      return <ShiftSchedule />;
    case 'submission':
    case 'public-tokens':
      return <div className="p-4 text-center">מערכת הגשת משמרות הוסרה - השתמש בטוקנים ציבוריים</div>;
    case 'auto-assignment':
      return <AutoShiftAssignment />;
    case 'vacation-requests':
      return <VacationRequestSystem />;
    case 'requests':
    case 'approval':
    case 'approval-dashboard':
      return <UnifiedShiftRequests />;
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
