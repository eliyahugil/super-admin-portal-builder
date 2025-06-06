
import React from 'react';
import { GlobalIntegrationsAdmin } from '@/components/modules/integrations/GlobalIntegrationsAdmin';

export const GlobalIntegrationsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ניהול אינטגרציות גלובליות</h1>
        <p className="text-gray-600 mt-2">
          הגדרת מפתחות API גלובליים ואינטגרציות משותפות לכל המערכת
        </p>
      </div>
      <GlobalIntegrationsAdmin />
    </div>
  );
};
