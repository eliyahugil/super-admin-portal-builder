import React from 'react';
import { Route, useParams } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';
import { BusinessDashboard } from '@/components/business/BusinessDashboard';
import { ModuleWrapper } from '@/components/modules/ModuleWrapper';
import { EmployeeProfilePage } from '@/components/modules/employees/EmployeeProfilePage';

const BusinessShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { businessId } = useParams();
  const id = businessId ?? 'test-business';

  const NAV = [
    { id: 'dashboard', label: 'לוח מחוונים', href: `/business/${id}/dashboard` },
    { id: 'employees', label: 'עובדים', href: `/business/${id}/modules/employees` },
    { id: 'shifts', label: 'משמרות', href: `/business/${id}/modules/shifts` },
    { id: 'orders', label: 'הזמנות', href: `/business/${id}/modules/orders` },
    { id: 'products', label: 'מוצרים', href: `/business/${id}/modules/products` },
    { id: 'settings', label: 'הגדרות', href: `/business/${id}/modules/settings` },
  ];

  return (
    <AppShell navItems={NAV}>
      {children}
    </AppShell>
  );
};

export const BusinessRoutes = () => (
  <>
    <Route path="/business/:businessId/dashboard" element={
      <ProtectedRoute>
        <BusinessShell>
          <BusinessDashboard />
        </BusinessShell>
      </ProtectedRoute>
    } />

    <Route path="/business/:businessId/modules/:moduleRoute" element={
      <ProtectedRoute>
        <BusinessShell>
          <ModuleWrapper />
        </BusinessShell>
      </ProtectedRoute>
    } />
    
    <Route path="/business/:businessId/modules/:moduleRoute/:subModule" element={
      <ProtectedRoute>
        <BusinessShell>
          <ModuleWrapper />
        </BusinessShell>
      </ProtectedRoute>
    } />

    <Route path="/business/:businessId/modules/:moduleRoute/:subModule/:employeeId" element={
      <ProtectedRoute>
        <BusinessShell>
          <ModuleWrapper />
        </BusinessShell>
      </ProtectedRoute>
    } />

    <Route path="/business/:businessId/modules/employees/profile/:employeeId" element={
      <ProtectedRoute>
        <BusinessShell>
          <EmployeeProfilePage />
        </BusinessShell>
      </ProtectedRoute>
    } />
  </>
);
