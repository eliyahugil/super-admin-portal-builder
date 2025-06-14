
import React from 'react';

interface Props {
  fullRoute: string;
  employeeId?: string;
}
export const DefaultModuleRouter: React.FC<Props> = ({ fullRoute, employeeId }) => (
  <div className="p-6 text-center">
    <h2 className="text-xl font-semibold mb-4">המודול לא נמצא</h2>
    <p>הנתיב "{fullRoute}" אינו קיים במערכת</p>
    <div className="mt-4 text-sm text-gray-500">
      <p>פרטי ניתוב נוכחיים:</p>
      <div className="bg-gray-100 p-3 rounded mt-2 text-left font-mono">
        <p>fullRoute: {fullRoute}</p>
        <p>employeeId: {employeeId || 'לא הוגדר'}</p>
        <p>window.location.pathname: {window.location.pathname}</p>
      </div>
    </div>
  </div>
);
