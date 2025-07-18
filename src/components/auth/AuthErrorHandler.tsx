import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { AuthSessionFixer } from './AuthSessionFixer';

interface AuthErrorHandlerProps {
  children: React.ReactNode;
}

export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const [showSessionFixer, setShowSessionFixer] = useState(false);
  const [stuckTime, setStuckTime] = useState(0);

  useEffect(() => {
    // אם יש user אבל אין profile ואנחנו לא בטעינה, ייתכן שהסשן תקוע
    if (user && !profile && !loading) {
      const timer = setTimeout(() => {
        setStuckTime(prev => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setStuckTime(0);
    }
  }, [user, profile, loading]);

  useEffect(() => {
    // אם אנחנו תקועים יותר מ-10 שניות, נציג את מתקן הסשן
    if (stuckTime > 10) {
      console.log('⚠️ Auth session appears to be stuck, showing session fixer');
      setShowSessionFixer(true);
    }
  }, [stuckTime]);

  const handleFixAttempted = () => {
    setShowSessionFixer(false);
    setStuckTime(0);
  };

  if (showSessionFixer) {
    return <AuthSessionFixer onFixAttempted={handleFixAttempted} />;
  }

  return <>{children}</>;
};