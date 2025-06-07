
import React from 'react';
import { Route } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { SubmitShiftPage } from '@/components/modules/shifts/SubmitShiftPage';

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
        element={React.createElement(React.lazy(() => import('@/components/modules/shifts/WeeklyShiftSubmissionForm').then(m => ({ default: m.WeeklyShiftSubmissionForm }))))} 
      />
      <Route 
        path="/shift-submitted" 
        element={React.createElement(React.lazy(() => import('@/components/modules/shifts/ShiftSubmissionSuccess').then(m => ({ default: m.ShiftSubmissionSuccess }))))} 
      />
      
      {/* Auth route - MUST be before protected routes */}
      <Route path="/auth" element={<AuthForm />} />
    </>
  );
};
