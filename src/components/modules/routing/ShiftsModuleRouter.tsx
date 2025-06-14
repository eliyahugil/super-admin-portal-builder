
import React from 'react';
import { ShiftManagement } from '../employees/ShiftManagement';

interface Props {
  route: string;
}
export const ShiftsModuleRouter: React.FC<Props> = ({ route }) => {
  switch (route) {
    case '':
      return <ShiftManagement />;
    case 'requests':
      return <div className="p-6 text-center">רכיב בקשות משמרת בפיתוח</div>;
    case 'approval':
      return <div className="p-6 text-center">רכיב אישור משמרות בפיתוח</div>;
    case 'schedule':
      return <div className="p-6 text-center">רכיב לוח משמרות בפיתוח</div>;
    case 'admin':
      return <div className="p-6 text-center">רכיב כלי מנהל בפיתוח</div>;
    case 'tokens':
      return <div className="p-6 text-center">רכיב טוקני הגשה בפיתוח</div>;
    default:
      return null;
  }
};
