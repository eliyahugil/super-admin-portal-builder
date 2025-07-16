
import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { SubmitShiftPage } from '@/components/modules/shifts/SubmitShiftPage';
import { SignDocumentPage } from '@/components/modules/employees/SignDocumentPage';
import { TokenBasedShiftManager } from '@/components/modules/shifts/TokenBasedShiftManager';
import { QuickAddEmployeePage } from '@/pages/QuickAddEmployeePage';

const QuickRegistrationPage = lazy(() => import('@/pages/QuickRegistrationPage').then(m => ({ default: m.QuickRegistrationPage })));
const EmployeeLoginPage = lazy(() => import('@/pages/auth/EmployeeLoginPage'));

const WeeklyShiftSubmissionForm = lazy(() => import('@/components/modules/shifts/WeeklyShiftSubmissionForm').then(m => ({ default: m.WeeklyShiftSubmissionForm })));
const ShiftSubmissionSuccess = lazy(() => import('@/components/modules/shifts/ShiftSubmissionSuccess').then(m => ({ default: m.ShiftSubmissionSuccess })));

export const PublicRoutes = () => (
  <>
    <Route 
      path="/shift-submission/:token" 
      element={<SubmitShiftPage />} 
    />
    <Route 
      path="/weekly-shift-submission/:token" 
      element={
        <Suspense fallback={<div>טוען טופס שבועי...</div>}>
          <WeeklyShiftSubmissionForm />
        </Suspense>
      } 
    />
    <Route 
      path="/advanced-shift-submission/:token" 
      element={<TokenBasedShiftManager />} 
    />
    <Route 
      path="/shift-submitted" 
      element={
        <Suspense fallback={<div>טוען אישור הגשה...</div>}>
          <ShiftSubmissionSuccess />
        </Suspense>
      } 
    />
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
  </>
);
