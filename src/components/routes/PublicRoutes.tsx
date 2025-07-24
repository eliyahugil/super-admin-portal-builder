import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { SignDocumentPage } from '@/components/modules/employees/SignDocumentPage';
import QuickAddEmployeePage from '@/pages/QuickAddEmployeePage';
import PublicShiftSubmission from '@/pages/public/PublicShiftSubmission';
import { PublicWeeklyShifts } from './PublicWeeklyShifts';
import { SimpleEmployeeProfile } from '@/components/modules/employees/profile/SimpleEmployeeProfile';
import { EmployeeRegistrationPage } from '@/pages/public/EmployeeRegistrationPage';
import PermanentShiftsPage from '@/pages/public/PermanentShiftsPage';

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
    <Route path="/public/weekly-shifts/:token" element={<PublicWeeklyShifts />} />
    <Route path="/public/permanent-shifts/:token" element={<PermanentShiftsPage />} />
    <Route path="/register-employee" element={<EmployeeRegistrationPage />} />
    
    {/* Employee profile route - accessible for logged in employees */}
    <Route path="/employee/profile/:employeeId" element={<SimpleEmployeeProfile />} />
  </>
);