
import React from 'react';
import { ShiftManagement } from '../employees/ShiftManagement';
import { ShiftSchedule } from '../shifts/ShiftSchedule';
import { AutoShiftAssignment } from '../shifts/AutoShiftAssignment';
import { VacationRequestSystem } from '../shifts/VacationRequestSystem';
import { ShiftTokenManagement } from '../shifts/ShiftTokenManagement';
import { WeeklyTokenManagement } from '../shifts/WeeklyTokenManagement';
import { QuickRequestRegistration } from '../shifts/QuickRequestRegistration';
import { ShiftRequests } from '../shifts/ShiftRequests';
import { ShiftApprovalPage } from '../shifts/ShiftApprovalPage';
import { ShiftSubmissionManager } from '../shifts/ShiftSubmissionManager';

interface Props {
  route: string;
}

export const ShiftsModuleRouter: React.FC<Props> = ({ route }) => {
  switch (route) {
    case '':
      return <ShiftManagement />;
    case 'schedule':
      return <ShiftSchedule />;
    case 'submission':
      return <ShiftSubmissionManager />;
    case 'auto-assignment':
      return <AutoShiftAssignment />;
    case 'vacation-requests':
      return <VacationRequestSystem />;
    case 'requests':
      return <ShiftRequests />;
    case 'approval':
    case 'approval-dashboard':
      return <ShiftApprovalPage />;
    case 'quick-requests':
      return <QuickRequestRegistration />;
    case 'tokens':
      return <ShiftTokenManagement />;
    case 'weekly-tokens':
      return <WeeklyTokenManagement />;
    case 'admin':
      return <div className="p-6 text-center">רכיב כלי מנהל בפיתוח</div>;
    default:
      return null;
  }
};
