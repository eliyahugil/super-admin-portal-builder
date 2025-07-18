import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { SignDocumentPage } from '@/components/modules/employees/SignDocumentPage';
import QuickAddEmployeePage from '@/pages/QuickAddEmployeePage';
import PublicShiftSubmission from '@/pages/public/PublicShiftSubmission';
import { EmployeeProfilePage } from '@/components/modules/employees/profile/EmployeeProfilePage';

const QuickRegistrationPage = lazy(() => import('@/pages/QuickRegistrationPage').then(m => ({ default: m.QuickRegistrationPage })));
const EmployeeLoginPage = lazy(() => import('@/pages/auth/EmployeeLoginPage'));


export const PublicRoutes = () => (
  <>
    <Route 
      path="/sign-document/:documentId" 
      element={<SignDocumentPage />} 
    />
    <Route path="/auth" element={<AuthForm />} />
    <Route 
      path="/employee-login" 
      element={
        <Suspense fallback={<div>טוען דף התחברות עובדים...</div>}>
          <EmployeeLoginPage />
        </Suspense>
      } 
    />
    <Route path="/quick-add-employee" element={<QuickAddEmployeePage />} />
    <Route path="/quick-registration" element={
      <Suspense fallback={<div>טוען טופס הרשמה...</div>}>
        <QuickRegistrationPage />
      </Suspense>
    } />
    <Route path="/public/shift-submission/:token" element={<PublicShiftSubmission />} />
    
    {/* Employee profile route - accessible for logged in employees */}
    <Route path="/employee/profile/:employeeId" element={
      <div className="min-h-screen bg-background" dir="rtl">
        <Suspense fallback={<div>טוען פרופיל עובד...</div>}>
          <EmployeeProfilePage />
        </Suspense>
      </div>
    } />
  </>
);