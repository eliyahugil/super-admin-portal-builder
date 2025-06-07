
import React, { Suspense, lazy } from 'react';
import { Route } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { SubmitShiftPage } from '@/components/modules/shifts/SubmitShiftPage';

const WeeklyShiftSubmissionForm = lazy(() => import('@/components/modules/shifts/WeeklyShiftSubmissionForm').then(m => ({ default: m.WeeklyShiftSubmissionForm })));
const ShiftSubmissionSuccess = lazy(() => import('@/components/modules/shifts/ShiftSubmissionSuccess').then(m => ({ default: m.ShiftSubmissionSuccess })));

export const PublicRoutes: React.FC = () => {
  return (
    <>
      {/* Public shift submission routes */}
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
        path="/shift-submitted" 
        element={
          <Suspense fallback={<div>טוען אישור הגשה...</div>}>
            <ShiftSubmissionSuccess />
          </Suspense>
        } 
      />
      
      {/* Auth route - MUST be before protected routes */}
      <Route path="/auth" element={<AuthForm />} />
    </>
  );
};
