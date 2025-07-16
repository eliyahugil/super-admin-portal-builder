
import React from 'react';
import { ShiftManagement } from '../employees/ShiftManagement';
import { ShiftManagementTabs } from '../shifts/ShiftManagementTabs';
import { ShiftSchedule } from '../shifts/ShiftSchedule';
import { AutoShiftAssignment } from '../shifts/AutoShiftAssignment';
import { VacationRequestSystem } from '../shifts/VacationRequestSystem';
import { ShiftTokenManagement } from '../shifts/ShiftTokenManagement';
import { WeeklyTokenManagement } from '../shifts/WeeklyTokenManagement';
import { QuickRequestRegistration } from '../shifts/QuickRequestRegistration';
import { UnifiedShiftRequests } from '../shifts/UnifiedShiftRequests';
import { ShiftSubmissionManager } from '../shifts/ShiftSubmissionManager';

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
      return <ShiftSubmissionManager />;
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
      return <ShiftTokenManagement />;
    case 'weekly-tokens':
      return <WeeklyTokenManagement />;
    case 'admin':
      return <ShiftManagement />;
    default:
      return null;
  }
};
