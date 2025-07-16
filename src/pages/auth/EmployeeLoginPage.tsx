import React from 'react';
import { EmployeeLoginFlow } from '@/components/auth/EmployeeLoginFlow';
import { BackButton } from '@/components/ui/BackButton';

const EmployeeLoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton to="/login" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            מערכת ניהול עובדים
          </h1>
          <p className="text-muted-foreground">
            התחבר באמצעות אימייל או מספר טלפון
          </p>
        </div>
        
        <EmployeeLoginFlow />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            בעיות בהתחברות? פנה למנהל המערכת
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;