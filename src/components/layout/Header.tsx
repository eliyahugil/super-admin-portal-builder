
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export const Header: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-end">
      <AuthForm />
    </div>
  );
};
